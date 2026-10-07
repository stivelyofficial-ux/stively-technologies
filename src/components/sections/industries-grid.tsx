import { Rocket, ShoppingCart, GraduationCap, Landmark, HeartPulse, Building2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Section } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/home/section-heading";

export interface Industry {
  icon: LucideIcon;
  label: string;
}

const DEFAULT_INDUSTRIES: Industry[] = [
  { icon: Rocket, label: "Startups & SaaS" },
  { icon: ShoppingCart, label: "E-commerce & Retail" },
  { icon: GraduationCap, label: "Education & EdTech" },
  { icon: Landmark, label: "FinTech" },
  { icon: HeartPulse, label: "Healthcare" },
  { icon: Building2, label: "Enterprise" },
];

export interface IndustriesGridProps {
  eyebrow?: string;
  heading?: string;
  /** Defaults to the site-wide 6 - a service page can pass its own, more relevant list instead. */
  industries?: Industry[];
}

/**
 * Framed as "industries we build for" (positioning), not "industries we've
 * served" (a track-record claim we can't back yet) - deliberate tense
 * choice, kept true on every list passed in here.
 */
function IndustriesGrid({
  eyebrow = "Where we work",
  heading = "Industries we build for",
  industries = DEFAULT_INDUSTRIES,
}: IndustriesGridProps) {
  return (
    <Section className="bg-muted/40 border-border/60 border-y py-16 md:py-20 lg:py-24">
      <Container className="flex flex-col gap-10 lg:gap-12">
        <SectionHeading eyebrow={eyebrow} title={heading} />
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {industries.map((industry, index) => (
            <li key={industry.label}>
              <Reveal delay={Math.min(index, 5) * 50} className="h-full">
                <div className="border-border/70 bg-card hover:border-primary/30 flex h-full flex-col items-center gap-4 rounded-3xl border p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-24px_rgba(43,89,230,0.35)]">
                  <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
                    <industry.icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className="text-foreground text-sm font-semibold">{industry.label}</span>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export { IndustriesGrid };
