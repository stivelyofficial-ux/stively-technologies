import type { Metadata } from "next";
import { Award, Download, FileText, Lock, ScrollText, Briefcase, Eye } from "lucide-react";

import { siteConfig } from "@/config/site";
import { getInternContext } from "@/features/internships/server/access";
import { EmptyState } from "@/components/sections/empty-state";
import { ShareAchievement } from "@/features/sharing/components/share-achievement";
import {
  internshipDocumentCaption,
  linkedinCertificateUrl,
} from "@/features/sharing/lib/share-links";
import { getOrCreateReferralCode } from "@/features/referrals/server/queries";
import { courseReferralLink, DEFAULT_REFERRAL_SLUG } from "@/features/referrals/lib/shareable";
import { listTrackDocuments } from "@/features/internship-documents/server/issuance";
import {
  documentVerificationUrl,
  KIND_META,
  longDate,
  type InternshipDocumentKind,
} from "@/features/internship-documents/lib/documents";

export const metadata: Metadata = { title: "My documents" };

const ICONS: Record<InternshipDocumentKind, typeof FileText> = {
  OFFER_LETTER: FileText,
  INTERNSHIP_CERTIFICATE: Award,
  LETTER_OF_RECOMMENDATION: ScrollText,
  EXPERIENCE_LETTER: Briefcase,
};

const BTN =
  "inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary";

export default async function InternDocumentsPage() {
  const { user, track } = await getInternContext({ requireOnboarded: true });

  if (!track) {
    return (
      <EmptyState
        icon={FileText}
        title="Your documents unlock with your internship"
        description="Finish your course and start your internship - your offer letter appears here, and your completion certificate, recommendation and experience letters follow when your final project is approved."
        actionLabel="Go to my learning"
        actionHref="/student/learning"
      />
    );
  }

  const [issued, code] = await Promise.all([
    listTrackDocuments(track.id),
    getOrCreateReferralCode(user.id),
  ]);
  const courseUrl = courseReferralLink(siteConfig.productionUrl, DEFAULT_REFERRAL_SLUG, code);
  const byKind = new Map(issued.map((d) => [d.kind, d]));
  const kinds = (Object.keys(KIND_META) as InternshipDocumentKind[]).sort(
    (a, b) => KIND_META[a].order - KIND_META[b].order
  );

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <h1 className="text-foreground text-3xl font-bold tracking-tight">My documents</h1>
        <p className="text-muted-foreground">
          Your offer letter is issued when your internship starts. Finish your final project and,
          once it is approved, your completion certificate, letter of recommendation and experience
          letter are issued too. Every document carries a QR code anyone can scan to verify it.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {kinds.map((kind) => {
          const meta = KIND_META[kind];
          const Icon = ICONS[kind];
          const doc = byKind.get(kind);

          if (!doc || doc.status === "REVOKED") {
            return (
              <section
                key={kind}
                className="border-border bg-card flex items-center gap-4 rounded-2xl border border-dashed p-5 opacity-80 sm:p-6"
              >
                <span className="bg-muted text-muted-foreground flex size-11 shrink-0 items-center justify-center rounded-xl">
                  <Lock className="size-5" aria-hidden="true" />
                </span>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <h2 className="text-foreground text-lg font-bold">{meta.label}</h2>
                  <p className="text-muted-foreground text-sm">
                    {doc ? "This document was revoked." : meta.blurb.replace("Issued", "Unlocks")}
                  </p>
                </div>
              </section>
            );
          }

          const verifyUrl = documentVerificationUrl(doc.documentNumber);
          const pdf = `/api/internship-documents/${doc.documentNumber}/pdf`;
          return (
            <section
              key={kind}
              className="border-border bg-card flex flex-col gap-5 rounded-2xl border p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-4">
                  <span className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <h2 className="text-foreground text-lg font-bold">{meta.label}</h2>
                    <p className="text-muted-foreground text-sm">
                      Issued {longDate(doc.issuedAt)} ·{" "}
                      <span className="font-mono">{doc.documentNumber}</span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <a href={pdf} target="_blank" rel="noopener noreferrer" className={BTN}>
                    <Eye className="size-4" aria-hidden="true" />
                    View
                  </a>
                  <a href={`${pdf}?mode=download`} className={BTN}>
                    <Download className="size-4" aria-hidden="true" />
                    Download PDF
                  </a>
                </div>
              </div>

              <ShareAchievement
                title={`Share your ${meta.label.toLowerCase()}`}
                benefit="Your link opens a verified Stively page recruiters can check. Download the PDF to attach it to your LinkedIn post or profile."
                url={verifyUrl}
                caption={internshipDocumentCaption({
                  kind,
                  program: doc.program,
                  verifyUrl,
                  courseUrl,
                })}
                shortText={`${meta.label} from Stively Technologies - ${doc.program}.`}
                linkedinProfileUrl={
                  kind === "INTERNSHIP_CERTIFICATE"
                    ? linkedinCertificateUrl({
                        name: `${doc.program} - Completion Certificate`,
                        organizationName: "Stively Technologies",
                        issuedAt: doc.issuedAt,
                        certUrl: verifyUrl,
                        certId: doc.documentNumber,
                      })
                    : undefined
                }
              />
            </section>
          );
        })}
      </div>
    </div>
  );
}
