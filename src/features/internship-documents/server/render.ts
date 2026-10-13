import "server-only";

import type { InternshipDocument } from "@prisma/client";

import { renderDocumentPdf } from "@/features/documents/server/render";
import { generateQrDataUrl } from "@/features/documents/components/qr-code";
import { documentVerificationUrl } from "../lib/documents";
import {
  ExperienceLetterDocument,
  OfferLetterDocument,
  RecommendationLetterDocument,
  type LetterData,
} from "../templates/letters";
import { CompletionCertificateDocument } from "../templates/completion-certificate";
import { SignedCompletionCertificateDocument } from "../templates/completion-certificate-signed";

/** Renders a document row to PDF bytes on demand - never stored, same as training certificates. */
export async function renderInternshipDocumentPdf(doc: InternshipDocument): Promise<Buffer> {
  const data: LetterData = {
    documentNumber: doc.documentNumber,
    issuedAt: doc.issuedAt,
    recipientName: doc.recipientName,
    program: doc.program,
    startDate: doc.startDate,
    endDate: doc.endDate,
    durationLabel: doc.durationLabel,
    reportingTo: doc.reportingTo,
    signatoryName: doc.signatoryName,
    signatoryTitle: doc.signatoryTitle,
  };

  switch (doc.kind) {
    case "OFFER_LETTER":
      return renderDocumentPdf(OfferLetterDocument({ data }));
    case "LETTER_OF_RECOMMENDATION":
      return renderDocumentPdf(RecommendationLetterDocument({ data }));
    case "EXPERIENCE_LETTER":
      return renderDocumentPdf(ExperienceLetterDocument({ data }));
    case "INTERNSHIP_CERTIFICATE": {
      const qrDataUrl = await generateQrDataUrl(documentVerificationUrl(doc.documentNumber));
      // Certificates with a named signatory use the redesigned layout; older ones keep the original artwork unchanged.
      return renderDocumentPdf(
        data.signatoryName
          ? SignedCompletionCertificateDocument({ data, qrDataUrl })
          : CompletionCertificateDocument({ data, qrDataUrl })
      );
    }
  }
}
