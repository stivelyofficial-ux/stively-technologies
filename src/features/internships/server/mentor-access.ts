import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Which interns a mentor looks after: any intern (started internship) whose
 * student has an ACTIVE MentorAssignment to this mentor. The assignment is
 * the single source of truth - the same table admins already use to hand
 * students to a mentor - so no second "internship mentor" relation exists.
 */
export async function getMentorInternTracks(mentorId: string) {
  return prisma.internshipTrack.findMany({
    where: {
      onboardedAt: { not: null },
      student: { mentorAssignments: { some: { mentorId, status: "ACTIVE" } } },
    },
    include: {
      student: { select: { id: true, name: true, email: true } },
      project: { select: { title: true, finalStatus: true, finalSubmittedAt: true } },
      tasks: { select: { isAddon: true, progress: true } },
      dailyReports: { select: { reportDate: true }, orderBy: { reportDate: "desc" }, take: 1 },
    },
    orderBy: { startedAt: "desc" },
  });
}

/** True only if this mentor has an ACTIVE assignment to the track's student - the guard for every mentor view/review of an intern. */
export async function mentorCanAccessTrack(mentorId: string, trackId: string): Promise<boolean> {
  const hit = await prisma.internshipTrack.findFirst({
    where: {
      id: trackId,
      student: { mentorAssignments: { some: { mentorId, status: "ACTIVE" } } },
    },
    select: { id: true },
  });
  return hit != null;
}

/** The mentor a student leads with (primary first) - shown on the intern overview and printed as "Reporting to" on the offer letter. */
export async function getPrimaryMentorForStudent(studentId: string) {
  const assignment = await prisma.mentorAssignment.findFirst({
    where: { studentId, status: "ACTIVE", mentor: { isActive: true } },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
    include: { mentor: { include: { user: { select: { name: true } } } } },
  });
  return assignment?.mentor ?? null;
}
