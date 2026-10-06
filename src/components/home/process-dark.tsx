import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";

/** Same five stages the /process page documents - one real sequence, said once. */
const STEPS = [
  {
    title: "Discovery",
    text: "A conversation about what you actually need, before anything is scoped or promised.",
    gets: ["A free 20-minute call", "Honest advice, even if it is not us"],
  },
  {
    title: "Proposal",
    text: "A clear plan, timeline and fixed estimate you approve before work starts.",
    gets: ["Fixed estimate", "Scope document", "Timeline"],
  },
  {
    title: "Development",
    text: "Built in visible stages with regular check-ins - not a black box until launch.",
    gets: ["Progress you can see", "Regular check-ins"],
  },
  {
    title: "QA & launch",
    text: "Reviewed and tested against real usage before it reaches your users.",
    gets: ["Testing on real devices", "Launch support"],
  },
  {
    title: "Support",
    text: "We stay involved after launch - software needs upkeep, not a one-time handoff.",
    gets: ["Support period included", "Maintenance if you want it"],
  },
] as const;

function ProcessDark() {
  return (
    <section id="how-we-work" className="py-6 md:py-10">
      <Container>
        <Reveal>
          <div className="bg-ink text-ink-foreground relative overflow-hidden rounded-[32px] px-7 py-14 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 760px 420px at 0% 0%, oklch(0.541 0.216 265.75 / 0.28), transparent 60%)," +
                  "radial-gradient(ellipse 600px 420px at 100% 100%, oklch(0.62 0.18 300 / 0.16), transparent 60%)",
              }}
            />
            <div className="relative flex flex-col gap-14">
              <SectionHeading
                tone="inverse"
                eyebrow="How we work"
                title="Our development process"
                description="Simple, transparent and result-driven - the same five stages every time."
                action={
                  <Button variant="outline-inverse" asChild>
                    <Link href="/start-project">
                      Start a project <ArrowRight />
                    </Link>
                  </Button>
                }
              />

              <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
                {/* connector line, desktop only */}
                <span
                  aria-hidden="true"
                  className="from-primary via-brand-iris to-brand-teal absolute top-[19px] right-[8%] left-[4%] hidden h-px bg-linear-to-r opacity-60 lg:block"
                />
                {STEPS.map((step, i) => (
                  <li key={step.title} className="relative flex flex-col gap-4">
                    <span className="bg-primary relative z-10 flex size-10 items-center justify-center rounded-full font-mono text-sm font-semibold text-white shadow-[0_0_0_6px_oklch(0.541_0.216_265.75/0.18)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                      <p className="text-ink-muted-foreground text-sm leading-relaxed text-pretty">
                        {step.text}
                      </p>
                      <ul className="mt-2 flex flex-col gap-1.5 text-[13px]">
                        {step.gets.map((item) => (
                          <li key={item} className="text-ink-foreground/90 flex items-start gap-2">
                            <span
                              aria-hidden="true"
                              className="bg-brand-teal mt-[7px] size-1 shrink-0 rounded-full"
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
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

export { ProcessDark };
