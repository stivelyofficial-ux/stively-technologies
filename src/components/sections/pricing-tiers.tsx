import Link from "next/link";

import { Section } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { PricingGrid } from "@/components/shared/pricing-grid";
import { Button } from "@/components/ui/button";

export interface PricingTiersProps {
  /** "teaser" (muted background, links out to /pricing) vs "full" (the dedicated page). */
  variant?: "teaser" | "full";
}

/** Heading + the shared PricingGrid (lib/pricing.ts is the single source for tiers and prices). */
function PricingTiers({ variant = "full" }: PricingTiersProps) {
  const isTeaser = variant === "teaser";

  return (
    <Section background={isTeaser ? "muted" : "default"}>
      <Container className="flex flex-col gap-12">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-3">
            <Eyebrow>Pricing</Eyebrow>
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-balance md:text-4xl">
              Straightforward pricing
            </h2>
            <p className="text-muted-foreground max-w-md">
              Three starting points. Your fixed estimate comes after a free discovery call.
            </p>
          </div>
          {isTeaser && (
            <Button variant="outline" asChild className="shrink-0">
              <Link href="/pricing">See full pricing</Link>
            </Button>
          )}
        </div>
        <PricingGrid />
      </Container>
    </Section>
  );
}

export { PricingTiers };
