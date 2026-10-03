import "server-only";

import { prisma } from "@/lib/prisma";
import { formatInternId, parseInternId } from "../lib/id-card";

export interface PublicInternVerification {
  internId: string;
  name: string;
  program: string;
  validTill: Date | null;
  status: "ACTIVE" | "COMPLETED" | "PAUSED";
  expired: boolean;
}

/**
 * What the ID card's QR code resolves to. Public and unauthenticated, so it
 * returns only what a person scanning the card needs to confirm it is real:
 * name, program, validity - never an email, phone or internal id. Only an
 * intern who has actually started (onboarded) can be verified.
 */
export async function getPublicInternByInternId(
  rawId: string
): Promise<PublicInternVerification | null> {
  const sequence = parseInternId(rawId);
  if (sequence == null) return null;
  const track = await prisma.internshipTrack.findUnique({
    where: { sequence },
    select: {
      sequence: true,
      title: true,
      status: true,
      endsAt: true,
      onboardedAt: true,
      student: { select: { name: true } },
    },
  });
  if (!track || !track.onboardedAt) return null;
  // The printed ID must match what we'd generate (rejects a right number with the wrong program code).
  if (formatInternId(track.sequence, track.title) !== rawId.trim().toUpperCase()) return null;
  return {
    internId: formatInternId(track.sequence, track.title),
    name: track.student.name ?? "Stively Intern",
    program: track.title,
    validTill: track.endsAt,
    status: track.status,
    expired: track.endsAt != null && track.endsAt.getTime() < Date.now(),
  };
}
