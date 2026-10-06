import Link from "next/link";
import { ArrowUpRight, Armchair, Dumbbell, Rocket, Stethoscope } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { NICHES, type Niche } from "@/config/niches";
import { Section } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "./section-heading";

const ICONS: Record<Niche["icon"], LucideIcon> = {
  stethoscope: Stethoscope,
  dumbbell: Dumbbell,
  armchair: Armchair,
  rocket: Rocket,
};

/** "Who we build for" - specific niches instead of "everything for everyone". Driven by config/niches.ts. */
function NicheCards() {
  return (
    <Section className="py-14 md:py-18 lg:py-20">
      <Container className="flex flex-col gap-10 lg:gap-12">
        <SectionHeading
          eyebrow="Who we build for"
          title="Built for businesses like yours"
          description="We focus on a few kinds of business so we can do them well."
        />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {NICHES.map((niche, index) => {
            const Icon = ICONS[niche.icon];
            return (
              <li key={niche.title}>
                <Reveal delay={index * 60} className="h-full">
                  <Link
                    href={niche.href}
                    className="group border-border/70 bg-card hover:border-primary/30 relative flex h-full flex-col gap-4 rounded-3xl border p-6 shadow-[0_1px_2px_rgba(18,32,92,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(43,89,230,0.35)]"
                  >
                    <span className="bg-primary/10 text-primary group-hover:bg-primary flex size-12 items-center justify-center rounded-2xl transition-colors duration-300 group-hover:text-white">
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-display text-lg font-semibold tracking-tight">
                        {niche.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
                        {niche.outcome}
                      </p>
                    </div>
                    <ArrowUpRight
                      className="text-muted-foreground group-hover:text-primary absolute top-6 right-6 size-5 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}

export { NicheCards };
