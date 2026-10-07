import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/home/section-heading";

export interface HowItWorksStep {
  title: string;
  description: string;
}

export interface HowItWorksProps {
  /** Anchor id so a hero button can deep-link to this section. */
  id?: string;
  heading?: string;
  steps: HowItWorksStep[];
}

const LG_COLUMNS_CLASS: Record<number, string> = {
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
};

/** A short numbered sequence on a dark panel, matching the homepage process section. Number of steps decides the column count. */
function HowItWorks({ id = "how-it-works", heading = "How it works", steps }: HowItWorksProps) {
  return (
    <section id={id} className="py-10 md:py-14">
      <Container>
        <Reveal>
          <div className="bg-ink text-ink-foreground relative overflow-hidden rounded-[32px] px-7 py-14 sm:px-12 sm:py-16 lg:px-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 760px 420px at 0% 0%, oklch(0.541 0.216 265.75 / 0.28), transparent 60%)," +
                  "radial-gradient(ellipse 600px 420px at 100% 100%, oklch(0.62 0.18 300 / 0.16), transparent 60%)",
              }}
            />
            <div className="relative flex flex-col gap-12">
              <SectionHeading eyebrow="Process" title={heading} tone="inverse" />
              <ol
                className={cn(
                  "grid gap-10 sm:grid-cols-2 lg:gap-6",
                  LG_COLUMNS_CLASS[steps.length] ?? "lg:grid-cols-4"
                )}
              >
                {steps.map((step, index) => (
                  <li key={step.title} className="flex flex-col gap-4">
                    <span className="bg-primary flex size-10 items-center justify-center rounded-full font-mono text-sm font-semibold text-white shadow-[0_0_0_6px_oklch(0.541_0.216_265.75/0.18)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                      <p className="text-ink-muted-foreground text-sm leading-relaxed text-pretty">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export { HowItWorks };
