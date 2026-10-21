import "server-only";

import { prisma } from "@/lib/prisma";
import { listPublicProjectWork, type PublicProjectWork } from "@/features/internships/server/public-projects";

export interface PublicCertificateView {
  certificateNumber: string;
  recipientName: string;
  courseName: string;
  completionDate: Date;
  issuedAt: Date | null;
  status: "ISSUED" | "REVOKED";
  /** Approved internship projects the recipient delivered, oldest first. */
  projects: PublicProjectWork[];
}

/**
 * The only certificate lookup exposed to anonymous traffic - deliberately
 * returns the minimum needed for the public /verify/[certificateId] page.
 * No enrollmentId, no internal id, no recipientEmail: none of that is
 * "public verification information," and leaking a real email address off
 * a scannable QR code would be a genuine privacy issue.
 */
export async function getPublicCertificateByNumber(certificateNumber: string): Promise<PublicCertificateView | null> {
  const certificate = await prisma.certificate.findUnique({
    where: { certificateNumber },
    select: {
      certificateNumber: true,
      recipientName: true,
      courseName: true,
      completionDate: true,
      issuedAt: true,
      status: true,
      enrollment: { select: { studentId: true } },
    },
  });
  if (!certificate || (certificate.status !== "ISSUED" && certificate.status !== "REVOKED")) return null;

  const { enrollment, ...rest } = certificate;
  // Only a valid certificate vouches for the holder's work.
  const projects =
    certificate.status === "ISSUED" ? await listPublicProjectWork({ studentId: enrollment.studentId }) : [];
  return { ...rest, status: certificate.status as "ISSUED" | "REVOKED", projects };
}
