import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getPrimaryMentorForStudent } from "@/features/internships/server/mentor-access";
import {
  durationLabel,
  formatDocumentNumber,
  KINDS_ON_COMPLETION,
  KINDS_ON_START,
  type InternshipDocumentKind,
} from "../lib/documents";

/**
 * Issues the documents for a track, idempotently: (trackId, kind) is unique
 * and the number is derived from the track's sequence, so calling this twice
 * (a double click, a retried request) never creates a second document.
 * Failures are logged, never thrown - a paperwork hiccup must not undo the
 * action that triggered it (starting the internship, approving a project);
 * the missing document is simply issued on the next trigger or by an admin.
 */
/** Who signs the documents. Omit for the original founder sign-off. */
export interface DocumentSignatory {
  name: string;
  title: string;
}

async function issueKinds(
  trackId: string,
  kinds: InternshipDocumentKind[],
  completion: boolean,
  signatory?: DocumentSignatory
) {
  const track = await prisma.internshipTrack.findUnique({
    where: { id: trackId },
    select: {
      sequence: true,
      title: true,
      startedAt: true,
      endsAt: true,
      durationMonths: true,
      onboardedAt: true,
      studentId: true,
      student: { select: { name: true } },
    },
  });
  if (!track || !track.onboardedAt) return;

  // Completion documents are dated today; the offer letter is dated when the internship actually started (matters when backfilling interns who began before this system existed).
  const now = completion ? new Date() : (track.onboardedAt ?? new Date());
  const recipientName = track.student.name?.trim() || "Stively Intern";
  const mentor = await getPrimaryMentorForStudent(track.studentId);
  const reportingTo = mentor?.user.name ? `${mentor.user.name}, Stively` : null;
  const plannedEnd = track.endsAt;
  // Completion documents state the period actually worked: if the intern finished early, the end date is today, not the original deadline.
  const endDate = completion
    ? plannedEnd && plannedEnd.getTime() < now.getTime()
      ? plannedEnd
      : now
    : plannedEnd;
  const label =
    completion || !track.durationMonths
      ? durationLabel(track.startedAt, endDate ?? now)
      : `${track.durationMonths} Month${track.durationMonths === 1 ? "" : "s"}`;

  for (const kind of kinds) {
    try {
      const existing = await prisma.internshipDocument.findUnique({
        where: { trackId_kind: { trackId, kind } },
        select: { id: true },
      });
      if (existing) continue;
      await prisma.internshipDocument.create({
        data: {
          trackId,
          kind,
          documentNumber: formatDocumentNumber({
            kind,
            program: track.title,
            sequence: track.sequence,
            issuedAt: now,
          }),
          recipientName,
          program: track.title,
          startDate: track.startedAt,
          endDate,
          durationLabel: label,
          reportingTo,
          signatoryName: signatory?.name ?? null,
          signatoryTitle: signatory?.title ?? null,
          issuedAt: now,
        },
      });
    } catch (error) {
      // Lost a race with a concurrent issue - the document exists, which is the goal.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") continue;
      console.error(`issueInternshipDocuments: ${kind} for track ${trackId} failed:`, error);
    }
  }
}

/** Offer letter - the moment the internship starts. */
export function issueStartDocuments(trackId: string, signatory?: DocumentSignatory) {
  return issueKinds(trackId, KINDS_ON_START, false, signatory);
}

/** Completion certificate + letter of recommendation + experience letter - when the final project is approved. */
export function issueCompletionDocuments(trackId: string, signatory?: DocumentSignatory) {
  return issueKinds(trackId, KINDS_ON_COMPLETION, true, signatory);
}

export async function listTrackDocuments(trackId: string) {
  return prisma.internshipDocument.findMany({
    where: { trackId },
    orderBy: { issuedAt: "asc" },
  });
}
