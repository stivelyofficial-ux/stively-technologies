"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/session";
import type { ActionResult } from "@/actions/leads";
import { assignProjectSchema, createTaskSchema, reviewTaskSchema } from "../validation";

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
}

/** One project per track (schema's @@unique on trackId) - assigning again overwrites the brief rather than creating a second one, since a track only ever has one live project at a time. */
export async function assignInternshipProject(input: unknown): Promise<ActionResult> {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const parsed = assignProjectSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { trackId, title, brief, instructions, resourceUrl } = parsed.data;

  try {
    const assignedById = await resolveActorTeamMemberId();
    await prisma.$transaction([
      prisma.internshipProject.upsert({
        where: { trackId },
        create: { trackId, title, brief, instructions: instructions || null, resourceUrl: resourceUrl || null },
        update: { title, brief, instructions: instructions || null, resourceUrl: resourceUrl || null },
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

export async function createInternshipTask(input: unknown): Promise<ActionResult> {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const parsed = createTaskSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { trackId, title, description } = parsed.data;

  try {
    const count = await prisma.internshipTask.count({ where: { trackId } });
    await prisma.internshipTask.create({
      data: { trackId, title, description: description || null, order: count + 1 },
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

/** The only place a task leaves SUBMITTED - approve or send back with feedback, same two-outcome shape as the existing mentor-review pattern on AssessmentSubmission. */
export async function reviewInternshipTask(input: unknown): Promise<ActionResult> {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const parsed = reviewTaskSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { taskId, status, feedback } = parsed.data;

  try {
    const reviewedById = await resolveActorTeamMemberId();
    const task = await prisma.internshipTask.update({
      where: { id: taskId },
      data: { status, feedback: feedback || null, reviewedAt: new Date(), reviewedById },
    });
    revalidateTrack(task.trackId);
    return { success: true };
  } catch (error) {
    console.error("reviewInternshipTask failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function updateInternshipTrackStatus(trackId: string, status: "ACTIVE" | "COMPLETED" | "PAUSED"): Promise<ActionResult> {
  await requireRole("ADMIN", "SUPER_ADMIN");
  try {
    await prisma.internshipTrack.update({
      where: { id: trackId },
      data: { status, completedAt: status === "COMPLETED" ? new Date() : null },
    });
    revalidateTrack(trackId);
    return { success: true };
  } catch (error) {
    console.error("updateInternshipTrackStatus failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
