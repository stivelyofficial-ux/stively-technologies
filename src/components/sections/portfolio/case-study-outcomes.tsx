import { Container } from "@/components/shared/container";

interface Outcome {
  label: string;
  value: string;
}

/** Business-outcome stat tiles - only rendered by the caller when `outcomes` is non-empty. Real metrics only, never a placeholder. */
function CaseStudyOutcomes({ outcomes }: { outcomes: Outcome[] }) {
  return (
    <Container>
      <div className="bg-ink text-ink-foreground relative overflow-hidden rounded-[32px] px-8 py-12 sm:px-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 600px 360px at 100% 0%, oklch(0.541 0.216 265.75 / 0.35), transparent 60%)",
          }}
        />
        <div className="relative flex flex-col gap-8">
          <span className="text-ink-muted-foreground font-mono text-[11px] font-semibold tracking-[0.2em] uppercase">
            Business outcomes
          </span>
          <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {outcomes.map((outcome) => (
              <div key={outcome.label} className="flex flex-col-reverse gap-1">
                <dt className="text-ink-muted-foreground text-sm">{outcome.label}</dt>
                <dd className="font-display text-4xl font-semibold tracking-[-0.03em]">
                  {outcome.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Container>
  );
}

export { CaseStudyOutcomes };
