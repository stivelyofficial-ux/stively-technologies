import "server-only";

import type { CertificateStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
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
    },
  });
  if (!doc) return null;
  return { ...doc, kindLabel: KIND_META[doc.kind].label };
}
