"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { ActionResult } from "@/actions/leads";
import { startOfTodayUtc } from "@/features/learning/lib/ai-tutor";
import { submitDailyReportSchema, submitTaskSchema } from "../validation";

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
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
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
    return { success: true };
  } catch (error) {
    console.error("submitDailyReport failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/**
 * A student can only ever move their own task PENDING/CHANGES_REQUESTED ->
 * SUBMITTED - review (APPROVED/CHANGES_REQUESTED) is admin-only, see
 * admin-actions.ts. Requires the actual deliverable (live URL + GitHub
 * repo, see AD-036) every time, including a resubmission after
 * CHANGES_REQUESTED - the links on a resubmit overwrite the previous ones,
 * there's no per-submission history kept, same as `feedback` only ever
 * holding the latest review note.
 */
export async function submitInternshipTask(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "You must be signed in." };

  const parsed = submitTaskSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { taskId, liveUrl, repoUrl } = parsed.data;

  const task = await prisma.internshipTask.findFirst({
    where: { id: taskId, track: { studentId: session.user.id } },
  });
  if (!task) return { success: false, error: "Task not found." };
  if (task.status !== "PENDING" && task.status !== "CHANGES_REQUESTED") {
    return { success: false, error: "This task has already been submitted." };
  }

  try {
    await prisma.internshipTask.update({
      where: { id: taskId },
      data: { status: "SUBMITTED", submittedAt: new Date(), liveUrl, repoUrl },
    });
    revalidatePath("/student/internships");
    return { success: true };
  } catch (error) {
    console.error("submitInternshipTask failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
