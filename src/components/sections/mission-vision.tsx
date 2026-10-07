import { Section } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";

/** Mission and vision as two large cards - the first on the dark ink surface, the second light, so the pair reads as one deliberate composition. */
function MissionVision() {
  return (
    <Section className="py-10 md:py-14">
      <Container className="grid gap-6 md:grid-cols-2">
        <Reveal className="h-full">
          <article className="bg-ink text-ink-foreground relative flex h-full flex-col gap-4 overflow-hidden rounded-[32px] p-8 sm:p-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 520px 320px at 100% 0%, oklch(0.541 0.216 265.75 / 0.35), transparent 60%)",
              }}
            />
            <h2 className="text-ink-muted-foreground relative font-mono text-[11px] font-semibold tracking-[0.2em] uppercase">
              Our mission
            </h2>
            <p className="font-display relative text-2xl leading-snug font-semibold tracking-[-0.02em] text-pretty sm:text-3xl">
              Give businesses a software partner they can actually trust - a trained, evaluated
              team, a transparent process, and review on every project before it ships.
            </p>
          </article>
        </Reveal>
        <Reveal delay={90} className="h-full">
          <article className="border-primary/15 from-primary/[0.08] to-card relative flex h-full flex-col gap-4 overflow-hidden rounded-[32px] border bg-linear-to-br p-8 sm:p-12">
            <h2 className="text-primary relative font-mono text-[11px] font-semibold tracking-[0.2em] uppercase">
              Our vision
            </h2>
            <p className="font-display text-foreground relative text-2xl leading-snug font-semibold tracking-[-0.02em] text-pretty sm:text-3xl">
              To be the software partner businesses choose over a traditional agency or a freelancer
              gamble - because the work is reliable, the process is visible, and someone
              accountable always stands behind it.
            </p>
          </article>
        </Reveal>
      </Container>
    </Section>
  );
}

export { MissionVision };
