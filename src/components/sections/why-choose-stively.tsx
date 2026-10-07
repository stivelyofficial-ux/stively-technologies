import type { LucideIcon } from "lucide-react";

import { Section } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/home/section-heading";
import { FeatureCards } from "@/components/biz/feature-cards";

export interface Reason {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface WhyChooseStivelyProps {
  heading?: string;
  reasons: Reason[];
}

/** "Why choose Stively" - a heading and a grid of reason cards on a muted band. */
function WhyChooseStively({ heading = "Why choose Stively", reasons }: WhyChooseStivelyProps) {
  return (
    <Section className="bg-muted/40 border-border/60 border-y py-16 md:py-20 lg:py-24">
      <Container className="flex flex-col gap-10 lg:gap-12">
        <SectionHeading eyebrow="Why Stively" title={heading} />
        <FeatureCards
          columns={reasons.length % 3 === 0 ? 3 : 2}
          items={reasons.map((reason) => ({
            title: reason.title,
            description: reason.description,
            icon: reason.icon,
          }))}
        />
      </Container>
    </Section>
  );
}

export { WhyChooseStively };
