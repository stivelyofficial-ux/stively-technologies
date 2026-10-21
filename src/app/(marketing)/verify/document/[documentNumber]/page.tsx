import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";

import { Section } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicProjectWorkList } from "@/features/internships/components/shared/public-project-work";
import { getPublicInternshipDocument } from "@/features/internship-documents/server/verify-queries";

interface VerifyDocumentPageProps {
  params: Promise<{ documentNumber: string }>;
}

export async function generateMetadata({ params }: VerifyDocumentPageProps): Promise<Metadata> {
  const { documentNumber } = await params;
  const doc = await getPublicInternshipDocument(decodeURIComponent(documentNumber));
  const title = doc ? `${doc.recipientName} - ${doc.kindLabel}` : `Verify ${documentNumber}`;
  const description = doc
    ? `${doc.kindLabel} issued by Stively Technologies to ${doc.recipientName} for the ${doc.program}.`
    : "Check a Stively internship document.";
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/** The page an internship document's QR code and share link point at. Public and read-only. */
export default async function VerifyDocumentPage({ params }: VerifyDocumentPageProps) {
  const { documentNumber } = await params;
  const doc = await getPublicInternshipDocument(decodeURIComponent(documentNumber));
  const valid = doc?.status === "ISSUED";

  return (
    <Section className="flex min-h-[70vh] items-center">
      <Container className="flex justify-center">
        <Card className="w-full max-w-lg">
          <CardContent className="flex flex-col items-center gap-5 py-10 text-center">
            <span className="text-primary font-display text-lg font-semibold tracking-wide">
              STIVELY
            </span>

            {!doc ? (
              <>
                <span className="bg-muted flex size-14 items-center justify-center rounded-full">
                  <XCircle className="text-muted-foreground size-7" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h1 className="font-display text-foreground text-xl font-semibold">
                    DOCUMENT NOT FOUND
                  </h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    This reference could not be verified. Check the reference number printed on the
                    document.
                  </p>
                </div>
              </>
            ) : (
              <>
                <span
                  className={`flex size-14 items-center justify-center rounded-full ${valid ? "bg-success/10" : "bg-destructive/10"}`}
                >
                  {valid ? (
                    <CheckCircle2 className="text-success size-7" aria-hidden="true" />
                  ) : (
                    <XCircle className="text-destructive size-7" aria-hidden="true" />
                  )}
                </span>
                <div className="flex flex-col gap-1.5">
                  <h1 className="font-display text-foreground text-xl font-semibold">
                    {valid ? "VERIFIED STIVELY DOCUMENT" : "DOCUMENT REVOKED"}
                  </h1>
                  <Badge variant={valid ? "success" : "secondary"} className="mx-auto">
                    {doc.kindLabel}
                  </Badge>
                </div>
                <dl className="grid w-full grid-cols-[110px_1fr] gap-x-4 gap-y-2.5 text-left text-sm">
                  <dt className="text-muted-foreground">Issued to</dt>
                  <dd className="text-foreground font-semibold">{doc.recipientName}</dd>
                  <dt className="text-muted-foreground">Reference</dt>
                  <dd className="text-foreground font-mono font-semibold">{doc.documentNumber}</dd>
                  <dt className="text-muted-foreground">Program</dt>
                  <dd className="text-foreground font-semibold">{doc.program}</dd>
                  <dt className="text-muted-foreground">Period</dt>
                  <dd className="text-foreground font-semibold">
                    {formatDate(doc.startDate)}
                    {doc.endDate ? ` – ${formatDate(doc.endDate)}` : ""}
                  </dd>
                  <dt className="text-muted-foreground">Issued on</dt>
                  <dd className="text-foreground font-semibold">{formatDate(doc.issuedAt)}</dd>
                  <dt className="text-muted-foreground">Issued by</dt>
                  <dd className="text-foreground font-semibold">Stively Technologies</dd>
                </dl>
                <PublicProjectWorkList projects={doc.projects} />
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </Section>
  );
}
