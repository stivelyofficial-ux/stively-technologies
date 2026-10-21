import "server-only";

import type { CertificateStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { listPublicProjectWork, type PublicProjectWork } from "@/features/internships/server/public-projects";
import { KIND_META, type InternshipDocumentKind } from "../lib/documents";

export interface PublicInternshipDocument {
  documentNumber: string;
  kind: InternshipDocumentKind;
  kindLabel: string;
  recipientName: string;
  program: string;
  startDate: Date;
  endDate: Date | null;
  issuedAt: Date;
  status: CertificateStatus;
  /** Approved projects the holder delivered during the internship, oldest first. */
  projects: PublicProjectWork[];
}

/**
 * What a document's QR code / share link resolves to. Public, so only what a
 * recruiter needs to confirm it is genuine: who, which program, which dates,
 * and whether it is still valid - never an email, phone or internal id.
 */
export async function getPublicInternshipDocument(
  documentNumber: string
): Promise<PublicInternshipDocument | null> {
  const doc = await prisma.internshipDocument.findUnique({
    where: { documentNumber: documentNumber.trim().toUpperCase() },
    select: {
      documentNumber: true,
      kind: true,
      recipientName: true,
      program: true,
      startDate: true,
      endDate: true,
      issuedAt: true,
      status: true,
      trackId: true,
    },
  });
  if (!doc) return null;
  const { trackId, ...rest } = doc;
  const projects = await listPublicProjectWork({ id: trackId });
  return { ...rest, kindLabel: KIND_META[doc.kind].label, projects };
}
