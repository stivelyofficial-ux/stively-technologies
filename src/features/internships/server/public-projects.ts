import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { readProjectDetails } from "../lib/stats";

/** A delivered project shown on a public verification page. */
export interface PublicProjectWork {
  title: string;
  client: string | null;
  role: string | null;
  stack: string[];
  liveUrl: string | null;
}

/**
 * The approved projects behind a verification page, oldest first. Public, so
 * only what a recruiter needs: what was built, for whom, in which role, with
 * what, and where to see it. Never feedback, notes, repo links or review data.
 */
export async function listPublicProjectWork(
  trackWhere: Prisma.InternshipTrackWhereInput
): Promise<PublicProjectWork[]> {
  const projects = await prisma.internshipProject.findMany({
    where: { finalStatus: "APPROVED", track: trackWhere },
    orderBy: [{ createdAt: "asc" }, { sequence: "asc" }],
    select: { title: true, finalLiveUrl: true, details: true },
  });
  return projects.map((project) => {
    const details = readProjectDetails(project.details);
    return {
      title: project.title,
      client: details.client ?? null,
      role: details.role ?? null,
      stack: Array.isArray(details.stack) ? details.stack.filter((s) => typeof s === "string") : [],
      // Only ever link out to a real web address.
      liveUrl:
        project.finalLiveUrl && /^https?:\/\//.test(project.finalLiveUrl)
          ? project.finalLiveUrl
          : null,
    };
  });
}
