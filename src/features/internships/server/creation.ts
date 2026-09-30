import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Called from completeEnrollment (enrollments/server/creation.ts) the
 * moment an OfferingEnrollment first reaches COMPLETED - a real, earned
 * unlock, not something a student can reach any other way. Idempotent:
 * a student who completes a second course later doesn't get a second
 * track, they keep their one active one (real internship capacity is
 * finite - this isn't a per-course reward loop).
 */
export async function ensureInternshipTrack(enrollmentId: string, studentId: string): Promise<void> {
  const existing = await prisma.internshipTrack.findFirst({ where: { studentId } });
  if (existing) return;

  const enrollment = await prisma.offeringEnrollment.findUnique({
    where: { id: enrollmentId },
    select: { offering: { select: { title: true } } },
  });
  if (!enrollment) return;

  await prisma.internshipTrack.create({
    data: {
      studentId,
      enrollmentId,
      title: `${enrollment.offering.title} Internship`,
    },
  });
}
