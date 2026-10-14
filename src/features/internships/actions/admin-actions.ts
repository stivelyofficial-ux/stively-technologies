"use server";

import { revalidatePath } from "next/cache";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/session";
import type { ActionResult } from "@/actions/leads";
import {
  assignNextProjectSchema,
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
  byMentor: boolean,
  completed: boolean,
  projectNumber: number
) {
  try {
    const track = await prisma.internshipTrack.findUnique({
      where: { id: trackId },
      select: { studentId: true, student: { select: { name: true } } },
    });
    if (!track) return;
    const copy = {
      APPROVED: {
        title: `Project ${projectNumber} was approved 🎉`,
        body: completed
          ? "You are stipend eligible. Your certificate and letters are now in your Documents."
          : "You are stipend eligible for this project. Your Stively team will be in touch about what comes next.",
        link: completed ? "/intern/documents" : "/intern",
      },
      CHANGES_REQUESTED: {
        title: "Your reviewer asked for changes",
        body: feedback,
        link: "/intern/submit",
      },
      NOT_ELIGIBLE: {
        title: `Project ${projectNumber} was marked not eligible for the stipend`,
        body: `${feedback ?? ""}

${completed ? "Your certificate and letters are still yours - find them in Documents. " : ""}Only the stipend for this project is withheld.`.trim(),
        link: completed ? "/intern/documents" : "/intern/submit",
      },
    }[status];
    await createNotification({ userId: track.studentId, type: "FEEDBACK_RECEIVED", ...copy });
    if ((byMentor || !completed) && status !== "CHANGES_REQUESTED") {
      await notifyAllAdmins({
        type: "FEEDBACK_RECEIVED",
        title: `${status === "APPROVED" ? "Stipend eligible" : "Not eligible"}: ${track.student.name ?? "an intern"} (project ${projectNumber})`,
        body: completed
          ? "A mentor reviewed the final submission."
          : "Reviewed. Open the intern to assign their next project or complete the internship.",
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

/**
 * Sets or edits the intern's CURRENT project's brief. Once that project has a
 * submission it is part of the record and can't be rewritten - use "Assign
 * next project" (assignNextProject) to give the intern their next one.
 */
export async function assignInternshipProject(input: unknown): Promise<ActionResult> {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const parsed = assignProjectSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { trackId, title, brief, instructions, resourceUrl } = parsed.data;

  try {
    const track = await prisma.internshipTrack.findUnique({
      where: { id: trackId },
      select: { project: { select: { id: true, finalStatus: true } } },
    });
    if (!track) return { success: false, error: "Internship not found." };
    if (track.project?.finalStatus) {
      return {
        success: false,
        error:
          'This project already has a submission. Use "Assign next project" to give the intern a new one.',
      };
    }
    const assignedById = await resolveActorTeamMemberId();
    const data = {
      title,
      brief,
      instructions: instructions || null,
      resourceUrl: resourceUrl || null,
    };
    await prisma.$transaction(async (tx) => {
      if (track.project) {
        await tx.internshipProject.update({ where: { id: track.project.id }, data });
      } else {
        const created = await tx.internshipProject.create({
          data: { trackId, sequence: 1, ...data },
        });
        await tx.internshipTrack.update({
          where: { id: trackId },
          data: { currentProjectId: created.id },
        });
      }
      await tx.internshipTrack.update({ where: { id: trackId }, data: { assignedById } });
    });
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
    const track = await prisma.internshipTrack.findUnique({
      where: { id: trackId },
      select: { project: { select: { id: true, finalStatus: true } } },
    });
    if (!track) return { success: false, error: "Internship not found." };
    const worked = await prisma.internshipTask.count({
      where: { trackId, isArchived: false, isAddon: false, progress: { not: "TODO" } },
    });
    if (worked > 0 || track.project?.finalStatus) {
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
    await prisma.$transaction(async (tx) => {
      let projectId = track.project?.id;
      if (projectId) {
        await tx.internshipProject.update({ where: { id: projectId }, data });
      } else {
        const created = await tx.internshipProject.create({
          data: { trackId, sequence: 1, ...data },
        });
        projectId = created.id;
        await tx.internshipTrack.update({
          where: { id: trackId },
          data: { currentProjectId: projectId },
        });
      }
      // Core tasks are replaced; any add-on features an admin attached stay.
      await tx.internshipTask.deleteMany({ where: { trackId, isAddon: false, isArchived: false } });
      await tx.internshipTask.createMany({
        data: template.tasks.map((t, i) => ({
          trackId,
          projectId,
          title: t.title,
          description: t.description,
          order: i + 1,
        })),
      });
      await tx.internshipTrack.update({ where: { id: trackId }, data: { assignedById } });
    });
    revalidateTrack(trackId);
    return { success: true };
  } catch (error) {
    console.error("assignProjectTemplate failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/**
 * The admin's decision to give an intern their NEXT project, inside the same
 * internship period (the duration never changes - a 3-month internship stays
 * 3 months). Only offered once the current project is reviewed (approved or
 * not eligible); the finished project and its tasks stay as history, and the
 * new project starts with its own fresh task list. Admin-only on purpose: who
 * gets another project is a judgement call, never automatic.
 */
export async function assignNextProject(input: unknown): Promise<ActionResult> {
  const admin = await requireRole("ADMIN", "SUPER_ADMIN");
  const parsed = assignNextProjectSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { trackId, templateKey, instructions, resourceUrl } = parsed.data;

  const template = templateKey ? getProjectTemplate(templateKey) : undefined;
  if (templateKey && !template) return { success: false, error: "Unknown project template." };

  try {
    const track = await prisma.internshipTrack.findUnique({
      where: { id: trackId },
      select: {
        status: true,
        onboardedAt: true,
        endsAt: true,
        studentId: true,
        project: { select: { id: true, sequence: true, finalStatus: true } },
      },
    });
    if (!track || !track.onboardedAt) {
      return { success: false, error: "This intern hasn't started their internship yet." };
    }
    if (track.status !== "ACTIVE") {
      return { success: false, error: "This internship is not active - reopen it first." };
    }
    if (!track.endsAt || track.endsAt.getTime() <= Date.now()) {
      return {
        success: false,
        error:
          "The internship period has ended. The duration is fixed, so no further project can be assigned.",
      };
    }
    if (
      !track.project ||
      (track.project.finalStatus !== "APPROVED" && track.project.finalStatus !== "NOT_ELIGIBLE")
    ) {
      return {
        success: false,
        error: "The current project hasn't been reviewed yet - finish its review first.",
      };
    }

    const taskLines = (parsed.data.tasks ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const title = template?.title ?? parsed.data.title!;
    const brief = template?.brief ?? parsed.data.brief!;
    const tasks = template
      ? template.tasks.map((t) => ({ title: t.title, description: t.description }))
      : taskLines.map((line) => ({ title: line, description: undefined as string | undefined }));

    const assignedById = await resolveActorTeamMemberId();
    const sequence = track.project.sequence + 1;
    await prisma.$transaction(async (tx) => {
      // Keep the finished project's tasks for history, out of the intern's live roadmap.
      await tx.internshipTask.updateMany({
        where: { trackId, isArchived: false },
        data: { isArchived: true, projectId: track.project!.id },
      });
      const created = await tx.internshipProject.create({
        data: {
          trackId,
          sequence,
          title,
          brief,
          instructions: template?.instructions ?? (instructions || null),
          resourceUrl: resourceUrl || null,
          details: template ? (template.details as unknown as Prisma.InputJsonValue) : undefined,
        },
      });
      if (tasks.length > 0) {
        await tx.internshipTask.createMany({
          data: tasks.map((t, i) => ({
            trackId,
            projectId: created.id,
            title: t.title,
            description: t.description ?? null,
            order: i + 1,
          })),
        });
      }
      await tx.internshipTrack.update({
        where: { id: trackId },
        data: { currentProjectId: created.id, assignedById },
      });
    });
    console.info(`assignNextProject: track ${trackId} -> project ${sequence} by admin ${admin.id}`);
    await createNotification({
      userId: track.studentId,
      type: "FEEDBACK_RECEIVED",
      title: `Your next project is ready: ${title}`,
      body: "Open your Overview to see the brief and your new task list. Your internship end date has not changed.",
      link: "/intern",
    }).catch((error) => console.error("assignNextProject notification failed:", error));
    revalidateTrack(trackId);
    return { success: true };
  } catch (error) {
    console.error("assignNextProject failed:", error);
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
    const [count, track] = await Promise.all([
      prisma.internshipTask.count({ where: { trackId, isArchived: false } }),
      prisma.internshipTrack.findUnique({
        where: { id: trackId },
        select: { currentProjectId: true },
      }),
    ]);
    await prisma.internshipTask.create({
      data: {
        trackId,
        projectId: track?.currentProjectId ?? null,
        title,
        description: description || null,
        order: count + 1,
        isAddon: true,
      },
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
    const reviewedTrack = await prisma.internshipTrack.findUnique({
      where: { id: trackId },
      select: { endsAt: true, project: true },
    });
    const project = reviewedTrack?.project;
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
    // A reviewed project no longer ends the internship by itself: the admin decides, per intern, whether to assign a next project (inside the same fixed period) or complete the internship. Only when the period is already over is there nothing left to assign, so the internship closes and the certificate and letters are issued right away. Ineligibility only withholds the stipend (terms section 8).
    const reviewed = status === "APPROVED" || status === "NOT_ELIGIBLE";
    const periodOver = !reviewedTrack?.endsAt || reviewedTrack.endsAt.getTime() <= Date.now();
    const completed = reviewed && periodOver;
    if (completed) {
      await prisma.internshipTrack.update({
        where: { id: trackId },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
      await issueCompletionDocuments(trackId);
    }
    await notifyReviewDecision(
      trackId,
      status,
      feedback,
      admin.role === "MENTOR",
      completed,
      project.sequence
    );
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
