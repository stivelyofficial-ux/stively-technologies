import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";

import { Section } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPublicInternByInternId } from "@/features/internships/server/verify-queries";

interface VerifyInternPageProps {
  params: Promise<{ internId: string }>;
}

export async function generateMetadata({ params }: VerifyInternPageProps): Promise<Metadata> {
  const { internId } = await params;
  return { title: `Verify Intern ${internId}`, robots: { index: false, follow: false } };
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/** The page an Intern ID card's QR code points at. Public and read-only - confirms an intern, reveals nothing private. */
export default async function VerifyInternPage({ params }: VerifyInternPageProps) {
  const { internId } = await params;
  const intern = await getPublicInternByInternId(decodeURIComponent(internId));

  return (
    <Section className="flex min-h-[70vh] items-center">
      <Container className="flex justify-center">
        <Card className="w-full max-w-lg">
          <CardContent className="flex flex-col items-center gap-5 py-10 text-center">
            <span className="text-primary font-display text-lg font-semibold tracking-wide">
              STIVELY
            </span>

            {!intern ? (
              <>
                <span className="bg-muted flex size-14 items-center justify-center rounded-full">
                  <XCircle className="text-muted-foreground size-7" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h1 className="font-display text-foreground text-xl font-semibold">
                    INTERN NOT FOUND
                  </h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    This Intern ID could not be verified. Check the ID printed on the card.
                  </p>
                </div>
              </>
            ) : (
              <>
                <span className="bg-success/10 flex size-14 items-center justify-center rounded-full">
                  <CheckCircle2 className="text-success size-7" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h1 className="font-display text-foreground text-xl font-semibold">
                    VERIFIED STIVELY INTERN
                  </h1>
                  <Badge
                    variant={
                      intern.status === "ACTIVE" && !intern.expired ? "success" : "secondary"
                    }
                    className="mx-auto"
                  >
                    {intern.status === "COMPLETED"
                      ? "Internship completed"
                      : intern.status === "PAUSED"
                        ? "Paused"
                        : intern.expired
                          ? "Validity ended"
                          : "Active"}
                  </Badge>
                </div>
                <dl className="grid w-full grid-cols-[110px_1fr] gap-x-4 gap-y-2.5 text-left text-sm">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="text-foreground font-semibold">{intern.name}</dd>
                  <dt className="text-muted-foreground">Intern ID</dt>
                  <dd className="text-foreground font-mono font-semibold">{intern.internId}</dd>
                  <dt className="text-muted-foreground">Program</dt>
                  <dd className="text-foreground font-semibold">{intern.program}</dd>
                  {intern.validTill && (
                    <>
                      <dt className="text-muted-foreground">Valid till</dt>
                      <dd className="text-foreground font-semibold">
                        {formatDate(intern.validTill)}
                      </dd>
                    </>
                  )}
                  <dt className="text-muted-foreground">Issued by</dt>
                  <dd className="text-foreground font-semibold">Stively Technologies</dd>
                </dl>
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </Section>
  );
}
