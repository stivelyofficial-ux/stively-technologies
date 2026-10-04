import Link from "next/link";
import { Award, Briefcase, Download, Eye, FileText, ScrollText } from "lucide-react";

import { listTrackDocuments } from "../server/issuance";
import { KIND_META, longDate, type InternshipDocumentKind } from "../lib/documents";

const ICONS: Record<InternshipDocumentKind, typeof FileText> = {
  OFFER_LETTER: FileText,
  INTERNSHIP_CERTIFICATE: Award,
  LETTER_OF_RECOMMENDATION: ScrollText,
  EXPERIENCE_LETTER: Briefcase,
};

const BTN =
  "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary";

/** "My documents" block for the intern overview: every document the intern owns, with view/download. Renders nothing until one is issued. */
async function DocumentsSummary({ trackId }: { trackId: string }) {
  const docs = (await listTrackDocuments(trackId)).filter((d) => d.status === "ISSUED");
  if (docs.length === 0) return null;

  return (
    <section
      aria-label="My documents"
      className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-foreground text-lg font-bold">My documents</h2>
        <Link
          href="/intern/documents"
          className="text-primary text-sm font-semibold hover:underline"
        >
          All documents &amp; sharing →
        </Link>
      </div>
      <ul className="flex flex-col gap-3">
        {docs.map((doc) => {
          const Icon = ICONS[doc.kind];
          const pdf = `/api/internship-documents/${doc.documentNumber}/pdf`;
          return (
            <li
              key={doc.id}
              className="border-border/70 flex flex-wrap items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="text-foreground font-semibold">{KIND_META[doc.kind].label}</span>
                  <span className="text-muted-foreground text-xs">
                    Issued {longDate(doc.issuedAt)} · {doc.documentNumber}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={pdf} target="_blank" rel="noopener noreferrer" className={BTN}>
                  <Eye className="size-4" aria-hidden="true" />
                  View
                </a>
                <a href={`${pdf}?mode=download`} className={BTN}>
                  <Download className="size-4" aria-hidden="true" />
                  Download
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export { DocumentsSummary };
