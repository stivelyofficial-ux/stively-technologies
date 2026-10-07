import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";

/** Renders `summary` as the case-study's Overview section - always present, since `summary` is a required field on every PortfolioItem. */
function CaseStudyOverview({
  summary,
  clientName,
}: {
  summary: string;
  clientName: string | null;
}) {
  return (
    <Container className="grid gap-6 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-16">
      <div className="flex flex-col gap-3">
        <Eyebrow>Overview</Eyebrow>
        {clientName && <p className="text-muted-foreground text-sm">Built for {clientName}</p>}
      </div>
      <p className="text-foreground text-xl leading-relaxed text-pretty whitespace-pre-line">
        {summary}
      </p>
    </Container>
  );
}

export { CaseStudyOverview };
