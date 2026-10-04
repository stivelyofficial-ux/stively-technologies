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
import { issueCompletionDocuments } from "@/features/internship-documents/server/issuance";

async function resolveActorTeamMemberId(): Promise<string | undefined> {
  const session = await auth();
  if (!session?.user?.id) return undefined;
  const teamMember = await prisma.teamMember.findUnique({ where: { userId: session.user.id } });
  return teamMember?.id;
}

function revalidateTrack(trackId: string) {
  revalidatePath(`/admin/internships/${trackId}`);
  revalidatePath("/admin/internships");
  revalidatePath("/student/internships");
  revalidatePath("/intern", "layout");
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

/** Mentor/admin decision on the intern's one final submission - approving it is what makes the stipend payable. */
export async function reviewFinalSubmission(input: unknown): Promise<ActionResult> {
  const admin = await requireRole("ADMIN", "SUPER_ADMIN");
  const parsed = reviewFinalSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { trackId, status, feedback } = parsed.data;
  if (status === "CHANGES_REQUESTED" && !feedback) {
    return { success: false, error: "Tell the intern what to change." };
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
    if (status === "APPROVED") {
      // An approved final project completes the internship: close the track and issue the completion certificate, recommendation and experience letters.
      await prisma.internshipTrack.update({
        where: { id: trackId },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
      await issueCompletionDocuments(trackId);
    }
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
