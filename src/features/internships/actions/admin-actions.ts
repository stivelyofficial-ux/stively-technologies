"use server";

import { revalidatePath } from "next/cache";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/session";
import type { ActionResult } from "@/actions/leads";
import {
  assignProjectSchema,
  assignTemplateSchema,
  createTaskSchema,
  reviewFinalSchema,
  setDurationSchema,
} from "../validation";
import { getProjectTemplate } from "../lib/project-templates";
import { addMonths, isValidDuration } from "../lib/durations";
import { sendDurationChangedEmail } from "../server/emails";
import { getMentorByUserId } from "@/features/mentors/server/queries";
import { mentorCanAccessTrack } from "../server/mentor-access";
import { createNotification, notifyAllAdmins } from "@/features/notifications/server/creation";
import { issueCompletionDocuments } from "@/features/internship-documents/server/issuance";

async function resolveActorTeamMemberId(): Promise<string | undefined> {
  const session = await auth();
  if (!session?.user?.id) return undefined;
  const teamMember = await prisma.teamMember.findUnique({ where: { userId: session.user.id } });
  return teamMember?.id;
}

/** Tells the intern the outcome (and, for a mentor's decision, the admins - an approval makes a stipend payable). Never fails the review itself. */
async function notifyReviewDecision(
  trackId: string,
  status: "APPROVED" | "CHANGES_REQUESTED" | "NOT_ELIGIBLE",
  feedback: string | undefined,
  byMentor: boolean
) {
  try {
    const track = await prisma.internshipTrack.findUnique({
      where: { id: trackId },
      select: { studentId: true, student: { select: { name: true } } },
    });
    if (!track) return;
    const copy = {
      APPROVED: {
        title: "Your final project was approved 🎉",
        body: "You are stipend eligible. Your certificate and letters are now in your Documents.",
        link: "/intern/documents",
      },
      CHANGES_REQUESTED: {
        title: "Your reviewer asked for changes",
        body: feedback,
        link: "/intern/submit",
      },
      NOT_ELIGIBLE: {
        title: "Your final submission was marked not eligible for the stipend",
        body: `${feedback ?? ""}

Your certificate and letters are still yours - find them in Documents. Only the stipend is withheld.`.trim(),
        link: "/intern/submit",
      },
    }[status];
    await createNotification({ userId: track.studentId, type: "FEEDBACK_RECEIVED", ...copy });
    if (byMentor && status !== "CHANGES_REQUESTED") {
      await notifyAllAdmins({
        type: "FEEDBACK_RECEIVED",
        title: `${status === "APPROVED" ? "Stipend eligible" : "Not eligible"}: ${track.student.name ?? "an intern"}`,
        body: "A mentor reviewed the final submission.",
        link: `/admin/internships/${trackId}`,
      });
    }
  } catch (error) {
    console.error("notifyReviewDecision failed:", error);
  }
}

function revalidateTrack(trackId: string) {
  revalidatePath(`/admin/internships/${trackId}`);
  revalidatePath("/admin/internships");
  revalidatePath("/student/internships");
  revalidatePath("/intern", "layout");
  revalidatePath("/mentor/interns");
  revalidatePath(`/mentor/interns/${trackId}`);
}

/** One project per track (schema's @@unique on trackId) - assigning again overwrites the brief rather than creating a second one, since a track only ever has one live project at a time. */
export async function assignInternshipProject(input: unknown): Promise<ActionResult> {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const parsed = assignProjectSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { trackId, title, brief, instructions, resourceUrl } = parsed.data;

  try {
    const assignedById = await resolveActorTeamMemberId();
    await prisma.$transaction([
      prisma.internshipProject.upsert({
        where: { trackId },
        create: {
          trackId,
          title,
          brief,
          instructions: instructions || null,
          resourceUrl: resourceUrl || null,
        },
        update: {
          title,
          brief,
          instructions: instructions || null,
          resourceUrl: resourceUrl || null,
        },
      }),
      prisma.internshipTrack.update({ where: { id: trackId }, data: { assignedById } }),
    ]);
    revalidateTrack(trackId);
    return { success: true };
  } catch (error) {
    console.error("assignInternshipProject failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/**
 * Assigns a ready-made project (brief + its dated task list) in one step.
 * Replaces the track's project and its tasks - refused once any task has
 * been submitted, so an admin can't wipe a student's submitted work by
 * re-applying a template.
 */
export async function assignProjectTemplate(input: unknown): Promise<ActionResult> {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const parsed = assignTemplateSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { trackId, templateKey } = parsed.data;

  const template = getProjectTemplate(templateKey);
  if (!template) return { success: false, error: "Unknown project template." };

  try {
    const existing = await prisma.internshipProject.findUnique({ where: { trackId } });
    const worked = await prisma.internshipTask.count({
      where: { trackId, isAddon: false, progress: { not: "TODO" } },
    });
    if (worked > 0 || existing?.finalStatus) {
      return {
        success: false,
        error: "This intern has already started - a template would overwrite their work.",
      };
    }
    const assignedById = await resolveActorTeamMemberId();
    const data = {
      title: template.title,
      brief: template.brief,
      instructions: template.instructions,
      details: template.details as unknown as Prisma.InputJsonValue,
    };
    await prisma.$transaction([
      prisma.internshipProject.upsert({
        where: { trackId },
        create: { trackId, ...data },
        update: data,
      }),
      // Core tasks are replaced; any add-on features an admin attached stay.
      prisma.internshipTask.deleteMany({ where: { trackId, isAddon: false } }),
      prisma.internshipTask.createMany({
        data: template.tasks.map((t, i) => ({
          trackId,
          title: t.title,
          description: t.description,
          order: i + 1,
        })),
      }),
      prisma.internshipTrack.update({ where: { id: trackId }, data: { assignedById } }),
    ]);
    revalidateTrack(trackId);
    return { success: true };
  } catch (error) {
    console.error("assignProjectTemplate failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function createInternshipTask(input: unknown): Promise<ActionResult> {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const parsed = createTaskSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { trackId, title, description } = parsed.data;

  try {
    const count = await prisma.internshipTask.count({ where: { trackId } });
    await prisma.internshipTask.create({
      data: { trackId, title, description: description || null, order: count + 1, isAddon: true },
    });
    revalidateTrack(trackId);
    return { success: true };
  } catch (error) {
    console.error("createInternshipTask failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function deleteInternshipTask(taskId: string): Promise<ActionResult> {
  await requireRole("ADMIN", "SUPER_ADMIN");
  try {
    const task = await prisma.internshipTask.delete({ where: { id: taskId } });
    revalidateTrack(task.trackId);
    return { success: true };
  } catch (error) {
    console.error("deleteInternshipTask failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/**
 * Mentor/admin decision on the intern's one final submission: approve (stipend
 * eligible, completes the internship and issues the certificates), request
 * changes, or mark not eligible. A mentor can only decide for interns
 * assigned to them; admins can decide for anyone.
 */
export async function reviewFinalSubmission(input: unknown): Promise<ActionResult> {
  const admin = await requireRole("ADMIN", "SUPER_ADMIN", "MENTOR");
  const parsed = reviewFinalSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { trackId, status, feedback } = parsed.data;
  if (status === "CHANGES_REQUESTED" && !feedback) {
    return { success: false, error: "Tell the intern what to change." };
  }
  if (status === "NOT_ELIGIBLE" && !feedback) {
    return { success: false, error: "Tell the intern why the submission is not eligible." };
  }
  if (admin.role === "MENTOR") {
    const mentor = await getMentorByUserId(admin.id);
    if (!mentor || !(await mentorCanAccessTrack(mentor.id, trackId))) {
      return { success: false, error: "This intern is not assigned to you." };
    }
  }

  try {
    const project = await prisma.internshipProject.findUnique({ where: { trackId } });
    if (!project || project.finalStatus !== "SUBMITTED") {
      return { success: false, error: "There is no submission awaiting review." };
    }
    await prisma.internshipProject.update({
      where: { id: project.id },
      data: {
        finalStatus: status,
        finalFeedback: feedback || null,
        finalReviewedAt: new Date(),
        finalReviewedById: admin.id,
      },
    });
    if (status === "APPROVED" || status === "NOT_ELIGIBLE") {
      // A reviewed final project completes the internship either way: close the track and issue the completion certificate, recommendation and experience letters. Ineligibility only withholds the stipend (terms section 8).
      await prisma.internshipTrack.update({
        where: { id: trackId },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
      await issueCompletionDocuments(trackId);
    }
    await notifyReviewDecision(trackId, status, feedback, admin.role === "MENTOR");
    revalidateTrack(trackId);
    return { success: true };
  } catch (error) {
    console.error("reviewFinalSubmission failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/**
 * Fixes a wrong duration choice (e.g. an intern picked 1 month instead of 3).
 * Keeps the start date and recomputes the end date from it, so the ID card,
 * "days left" and verification page all follow. Admin-only on purpose: the
 * end date is the one real deadline and the stipend leverage, so interns
 * can't move it themselves after choosing.
 */
export async function setInternshipDuration(input: unknown): Promise<ActionResult> {
  const admin = await requireRole("ADMIN", "SUPER_ADMIN");
  const parsed = setDurationSchema.safeParse(input);
  if (!parsed.success || !isValidDuration(parsed.data.durationMonths)) {
    return { success: false, error: "Choose 1, 2 or 3 months." };
  }
  const { trackId, durationMonths } = parsed.data;

  try {
    const track = await prisma.internshipTrack.findUnique({
      where: { id: trackId },
      include: { student: { select: { name: true, email: true } } },
    });
    if (!track || !track.onboardedAt) {
      return { success: false, error: "This intern hasn't started their internship yet." };
    }
    if (track.durationMonths === durationMonths) {
      return { success: true };
    }
    const endsAt = addMonths(track.startedAt, durationMonths);
    await prisma.internshipTrack.update({
      where: { id: trackId },
      data: { durationMonths, endsAt },
    });
    console.info(
      `setInternshipDuration: track ${trackId} ${track.durationMonths ?? "?"} -> ${durationMonths} months by admin ${admin.id}`
    );
    // The duration is already saved - the confirmation email is a courtesy and can't fail the action.
    await sendDurationChangedEmail(track.student.email, {
      name: track.student.name,
      previousMonths: track.durationMonths,
      newMonths: durationMonths,
      startDate: track.startedAt,
      endDate: endsAt,
    });
    revalidateTrack(trackId);
    return { success: true };
  } catch (error) {
    console.error("setInternshipDuration failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function updateInternshipTrackStatus(
  trackId: string,
  status: "ACTIVE" | "COMPLETED" | "PAUSED"
): Promise<ActionResult> {
  await requireRole("ADMIN", "SUPER_ADMIN");
  try {
    await prisma.internshipTrack.update({
      where: { id: trackId },
      data: { status, completedAt: status === "COMPLETED" ? new Date() : null },
    });
    // Marking an internship completed by hand is the same milestone as an approved final project.
    if (status === "COMPLETED") await issueCompletionDocuments(trackId);
    revalidateTrack(trackId);
    return { success: true };
  } catch (error) {
    console.error("updateInternshipTrackStatus failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
