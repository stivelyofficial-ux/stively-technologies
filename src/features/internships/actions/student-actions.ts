"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { ActionResult } from "@/actions/leads";
import { startOfTodayUtc } from "@/features/learning/lib/ai-tutor";
import {
  submitDailyReportSchema,
  startInternshipSchema,
  submitFinalProjectSchema,
  setTaskProgressSchema,
} from "../validation";
import { addMonths } from "../lib/durations";
import { STIPEND_TERMS_VERSION } from "../lib/stipend-terms";
import { createNotification, notifyAllAdmins } from "@/features/notifications/server/creation";
import { issueStartDocuments } from "@/features/internship-documents/server/issuance";

async function requireOwnedTrack(trackId: string, studentId: string) {
  return prisma.internshipTrack.findFirst({ where: { id: trackId, studentId } });
}

/**
 * Upserts today's report on the track's own @@unique([trackId, reportDate])
 * - editing today's entry after already submitting is the same call, not a
 * second report. Yesterday's (or any past day's) report is immutable once
 * the date rolls over - there's no "content" arg accepted for a date the
 * caller doesn't control.
 */
export async function submitDailyReport(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "You must be signed in." };

  const parsed = submitDailyReportSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { trackId, content } = parsed.data;

  const track = await requireOwnedTrack(trackId, session.user.id);
  if (!track) return { success: false, error: "Internship track not found." };

  try {
    const reportDate = startOfTodayUtc();
    await prisma.internshipDailyReport.upsert({
      where: { trackId_reportDate: { trackId, reportDate } },
      create: { trackId, reportDate, content },
      update: { content },
    });
    revalidatePath("/student/internships");
    revalidatePath("/intern", "layout");
    return { success: true };
  } catch (error) {
    console.error("submitDailyReport failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/** Tells the intern's mentor(s) - and the admins - that a final project is waiting for review. Never fails the submission. */
async function notifySubmission(trackId: string, studentId: string, studentName: string) {
  try {
    const mentors = await prisma.mentorAssignment.findMany({
      where: { studentId, status: "ACTIVE", mentor: { isActive: true } },
      select: { mentor: { select: { userId: true } } },
    });
    for (const { mentor } of mentors) {
      await createNotification({
        userId: mentor.userId,
        type: "FEEDBACK_RECEIVED",
        title: `${studentName} submitted their final project`,
        body: "Review it and approve, request changes, or mark not eligible.",
        link: `/mentor/interns/${trackId}`,
      });
    }
    await notifyAllAdmins({
      type: "FEEDBACK_RECEIVED",
      title: `${studentName} submitted their final project`,
      link: `/admin/internships/${trackId}`,
    });
  } catch (error) {
    console.error("notifySubmission failed:", error);
  }
}

/**
 * The ONE final submission for the stipend. Interns don't submit task by
 * task - tasks are a read-only roadmap. Allowed when nothing has been
 * submitted yet, or when a mentor asked for changes; once SUBMITTED or
 * APPROVED it is locked (terms section 3: one final submission per project).
 */
export async function submitFinalProject(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "You must be signed in." };

  const parsed = submitFinalProjectSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { liveUrl, repoUrl, notes } = parsed.data;

  const track = await prisma.internshipTrack.findFirst({
    where: { studentId: session.user.id },
    include: { project: true },
  });
  if (!track?.project) return { success: false, error: "Your project hasn't been assigned yet." };
  if (!track.onboardedAt) return { success: false, error: "Start your internship first." };
  const status = track.project.finalStatus;
  if (status === "SUBMITTED")
    return { success: false, error: "Your final submission is already under review." };
  if (status === "APPROVED")
    return { success: false, error: "Your final submission has already been approved." };
  if (status === "NOT_ELIGIBLE")
    return {
      success: false,
      error: "Your final submission has been reviewed and can't be resubmitted.",
    };

  try {
    await prisma.internshipProject.update({
      where: { id: track.project.id },
      data: {
        finalLiveUrl: liveUrl,
        finalRepoUrl: repoUrl,
        finalNotes: notes || null,
        finalStatus: "SUBMITTED",
        finalSubmittedAt: new Date(),
        finalFeedback: null,
      },
    });
    await notifySubmission(track.id, session.user.id, session.user.name ?? "An intern");
    revalidatePath("/intern", "layout");
    revalidatePath(`/admin/internships/${track.id}`);
    revalidatePath("/admin/internships");
    revalidatePath("/mentor/interns");
    return { success: true };
  } catch (error) {
    console.error("submitFinalProject failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/**
 * The /intern/start step: the student chooses how long they'll intern and
 * accepts the stipend terms (acceptance + terms version are recorded on the
 * track). Resets startedAt to now so Day 1 is the day they chose to begin.
 * One-shot - once onboarded, the duration can't be changed here.
 */
export async function startInternship(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "You must be signed in." };

  const parsed = startInternshipSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { durationMonths } = parsed.data;

  const track = await prisma.internshipTrack.findFirst({ where: { studentId: session.user.id } });
  if (!track)
    return {
      success: false,
      error: "Your internship isn't unlocked yet - finish your course first.",
    };
  if (track.onboardedAt)
    return { success: false, error: "You've already started your internship." };

  try {
    const now = new Date();
    await prisma.internshipTrack.update({
      where: { id: track.id },
      data: {
        onboardedAt: now,
        startedAt: now,
        durationMonths,
        endsAt: addMonths(now, durationMonths),
        termsAcceptedAt: now,
        termsVersion: STIPEND_TERMS_VERSION,
      },
    });
    // The offer letter is issued the moment the internship starts (failures are logged, never block starting).
    await issueStartDocuments(track.id);
    revalidatePath("/intern", "layout");
    return { success: true };
  } catch (error) {
    console.error("startInternship failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/**
 * The intern marks their own task To do / In progress / Done. Pure
 * self-tracking: nothing is reviewed per task and there are no deadlines -
 * the stipend is decided on the single final submission.
 */
export async function setTaskProgress(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "You must be signed in." };

  const parsed = setTaskProgressSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { taskId, progress } = parsed.data;

  const task = await prisma.internshipTask.findFirst({
    where: { id: taskId, track: { studentId: session.user.id } },
    select: { id: true },
  });
  if (!task) return { success: false, error: "Task not found." };

  try {
    await prisma.internshipTask.update({ where: { id: taskId }, data: { progress } });
    revalidatePath("/intern", "layout");
    return { success: true };
  } catch (error) {
    console.error("setTaskProgress failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
