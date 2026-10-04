import "server-only";

import { prisma } from "@/lib/prisma";

export interface DashboardCourse {
  enrollmentId: string;
  title: string;
  status: "ACTIVE" | "COMPLETED" | "PAUSED" | "PENDING" | "CANCELLED" | "EXPIRED";
  progress: number;
  completedAt: Date | null;
  /** Certificate number when one has been issued (download link target), else null. */
  certificateNumber: string | null;
}

export interface DashboardInternship {
  status: "ACTIVE" | "COMPLETED" | "PAUSED";
  onboarded: boolean;
  hasProject: boolean;
  finalStatus: "SUBMITTED" | "APPROVED" | "CHANGES_REQUESTED" | "NOT_ELIGIBLE" | "PENDING" | null;
  projectTitle: string | null;
}

/**
 * One round of cheap, narrowly-selected queries for the student dashboard -
 * run in parallel, only the columns the page actually renders. (The learning
 * progress comes straight from OfferingEnrollment.progressPercentage, no
 * per-lesson joins.)
 */
export async function getStudentDashboardData(userId: string) {
  const [enrollments, track] = await Promise.all([
    prisma.offeringEnrollment.findMany({
      where: { studentId: userId, status: { in: ["ACTIVE", "COMPLETED", "PAUSED"] } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        progressPercentage: true,
        completionDate: true,
        offering: { select: { title: true } },
        certificate: { select: { certificateNumber: true } },
      },
    }),
    prisma.internshipTrack.findFirst({
      where: { studentId: userId },
      select: {
        status: true,
        onboardedAt: true,
        project: { select: { title: true, finalStatus: true } },
      },
    }),
  ]);

  const courses: DashboardCourse[] = enrollments.map((e) => ({
    enrollmentId: e.id,
    title: e.offering.title,
    status: e.status,
    progress: e.progressPercentage,
    completedAt: e.completionDate,
    certificateNumber: e.certificate?.certificateNumber ?? null,
  }));

  const internship: DashboardInternship | null = track
    ? {
        status: track.status,
        onboarded: track.onboardedAt != null,
        hasProject: track.project != null,
        finalStatus: track.project?.finalStatus ?? null,
        projectTitle: track.project?.title ?? null,
      }
    : null;

  return {
    courses,
    internship,
    completedCount: courses.filter((c) => c.status === "COMPLETED").length,
    certificateCount: courses.filter((c) => c.certificateNumber != null).length,
  };
}
