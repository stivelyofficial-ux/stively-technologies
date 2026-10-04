import { siteConfig } from "@/config/site";
import { programCode } from "@/features/internships/lib/id-card";

export type InternshipDocumentKind =
  "OFFER_LETTER" | "INTERNSHIP_CERTIFICATE" | "LETTER_OF_RECOMMENDATION" | "EXPERIENCE_LETTER";

interface KindMeta {
  /** Short code inside the document number (STV-FEI-<code>-2026-00005). */
  code: string;
  /** What the intern sees. */
  label: string;
  /** One line on when/why it is issued. */
  blurb: string;
  /** Sort order in the Documents list. */
  order: number;
}

export const KIND_META: Record<InternshipDocumentKind, KindMeta> = {
  OFFER_LETTER: {
    code: "OL",
    label: "Offer Letter",
    blurb: "Issued when your internship started.",
    order: 1,
  },
  INTERNSHIP_CERTIFICATE: {
    code: "IC",
    label: "Internship Completion Certificate",
    blurb: "Issued when your final project is approved.",
    order: 2,
  },
  LETTER_OF_RECOMMENDATION: {
    code: "LOR",
    label: "Letter of Recommendation",
    blurb: "Issued when your final project is approved.",
    order: 3,
  },
  EXPERIENCE_LETTER: {
    code: "EXP",
    label: "Experience Letter",
    blurb: "Issued when your final project is approved.",
    order: 4,
  },
};

/** What a started internship earns, and what completing it earns. */
export const KINDS_ON_START: InternshipDocumentKind[] = ["OFFER_LETTER"];
export const KINDS_ON_COMPLETION: InternshipDocumentKind[] = [
  "INTERNSHIP_CERTIFICATE",
  "LETTER_OF_RECOMMENDATION",
  "EXPERIENCE_LETTER",
];

/** STV-FEI-OL-2026-00005 - derived from the track's running number, so the same track + kind can never get two numbers. */
export function formatDocumentNumber(params: {
  kind: InternshipDocumentKind;
  program: string;
  sequence: number;
  issuedAt: Date;
}): string {
  const { kind, program, sequence, issuedAt } = params;
  return `STV-${programCode(program)}-${KIND_META[kind].code}-${issuedAt.getFullYear()}-${String(sequence).padStart(5, "0")}`;
}

/** Public URL the document's QR code and share links point to. Always the live site. */
export function documentVerificationUrl(documentNumber: string): string {
  return `${siteConfig.productionUrl}/verify/document/${documentNumber}`;
}

/** "2 Months" / "3 Weeks" - honest about the real period, not the originally chosen one. */
export function durationLabel(start: Date, end: Date): string {
  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000));
  if (days >= 28) {
    const months = Math.max(1, Math.round(days / 30));
    return `${months} Month${months === 1 ? "" : "s"}`;
  }
  const weeks = Math.max(1, Math.round(days / 7));
  return `${weeks} Week${weeks === 1 ? "" : "s"}`;
}

/** 01 October 2026 */
export function longDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

/** 01 OCT 2026 */
export function shortDate(d: Date): string {
  return d
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    })
    .toUpperCase();
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}
