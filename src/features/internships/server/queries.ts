import "server-only";

import { prisma } from "@/lib/prisma";
import type {
  InternshipTrack,
  InternshipProject,
  InternshipTask,
  InternshipDailyReport,
} from "@prisma/client";

export type InternshipTrackDetail = InternshipTrack & {
  project: InternshipProject | null;
  tasks: InternshipTask[];
  dailyReports: InternshipDailyReport[];
};

/** A student has at most one track (see ensureInternshipTrack's own comment on why) - null means not yet eligible. */
export async function getInternshipTrackForStudent(
  studentId: string
): Promise<InternshipTrackDetail | null> {
  return prisma.internshipTrack.findFirst({
    where: { studentId },
    include: {
      project: true,
      tasks: { orderBy: { order: "asc" } },
      dailyReports: { orderBy: { reportDate: "desc" } },
    },
  });
}

/** Cheap existence check for nav/dashboard gating - no need to pull the full track just to decide whether to show a link. */
export async function hasInternshipTrack(studentId: string): Promise<boolean> {
  const track = await prisma.internshipTrack.findFirst({
    where: { studentId },
    select: { id: true },
  });
  return track != null;
}

/** Admin list - newest first, with just enough to render a table row. */
export async function getInternshipTracksForAdmin() {
  return prisma.internshipTrack.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      student: { select: { id: true, name: true, email: true } },
      project: {
        select: { title: true, finalStatus: true, finalSubmittedAt: true },
      },
      tasks: { select: { progress: true, isAddon: true } },
      dailyReports: { orderBy: { reportDate: "desc" }, take: 1, select: { reportDate: true } },
      _count: { select: { dailyReports: true } },
    },
  });
}

export async function getInternshipTrackForAdmin(trackId: string) {
  return prisma.internshipTrack.findUnique({
    where: { id: trackId },
    include: {
      student: { select: { id: true, name: true, email: true } },
      project: true,
      tasks: { orderBy: { order: "asc" } },
      dailyReports: { orderBy: { reportDate: "desc" } },
    },
  });
}
