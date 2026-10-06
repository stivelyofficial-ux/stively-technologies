import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Section } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { PricingGrid } from "@/components/shared/pricing-grid";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";

/** Homepage pricing: the shared grid (lib/pricing.ts) under a section heading. */
function PricingTeaser() {
  return (
    <Section id="pricing" className="py-16 md:py-20 lg:py-24">
      <Container className="flex flex-col gap-12 lg:gap-16">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple & transparent pricing"
          description="Every project is unique. These are real starting prices so you know the range before you talk to us."
          action={
            <Button variant="outline" asChild>
              <Link href="/pricing">
                See full pricing <ArrowRight />
              </Link>
            </Button>
          }
        />
        <PricingGrid />
      </Container>
    </Section>
  );
}

export { PricingTeaser };
