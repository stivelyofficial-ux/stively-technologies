import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { JsonLd } from "@/components/shared/json-ld";
import { PageHero } from "@/components/biz/page-hero";
import { HeroActions } from "@/components/biz/hero-actions";
import { PricingTiers } from "@/components/sections/pricing-tiers";
import { PRICING_TIERS } from "@/lib/pricing";
import { Section } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { CtaBand } from "@/components/biz/cta-band";

const TITLE = "Pricing";
const DESCRIPTION =
  "Three fixed starting points for websites, business platforms, and full custom software - scoped further once we understand your project.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/pricing" },
  // "images" explicit here - see the note in src/app/(marketing)/page.tsx's
  // metadata for why (a page-level openGraph/twitter block replaces the
  // parent's instead of merging, dropping the opengraph-image.tsx image).
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${siteConfig.url}/pricing`,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
    title: TITLE,
    description: DESCRIPTION,
  },
};

/**
 * No Prisma queries - static content, same precedent as About/Services
 * (see docs/phase-e-visual-ux-planning.md), so no loading.tsx is needed.
 */
export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
            {
              "@type": "ListItem",
              position: 2,
              name: "Pricing",
              item: `${siteConfig.url}/pricing`,
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Stively Software Development",
          offers: PRICING_TIERS.map((tier) => ({
            "@type": "Offer",
            name: tier.name,
            price: (tier.priceInPaise / 100).toFixed(0),
            priceCurrency: "INR",
            description: tier.description,
          })),
        }}
      />

      <PageHero
        eyebrow="Pricing"
        title="Three starting points, no pricing surprises"
        description="Every project is scoped individually once we understand what you need - these are the fixed points most engagements start from."
        actions={<HeroActions secondary={{ label: "See how we work", href: "/process" }} />}
      />

      <PricingTiers variant="full" />

      <Section className="py-10 md:py-14">
        <Container
          size="narrow"
          className="bg-muted/50 border-border/70 flex flex-col gap-3 rounded-[32px] border px-8 py-12 text-center"
        >
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-balance md:text-3xl">
            Every plan can flex
          </h2>
          <p className="text-muted-foreground text-pretty">
            The Platform tier is custom scope because no two applications are the same. Mobile apps
            and AI features are scoped and priced separately. Tell us what you&apos;re building and
            we&apos;ll scope it against one of these, or something in between.
          </p>
        </Container>
      </Section>

      <CtaBand
        heading="Not sure which tier fits?"
        description="A short call to talk through scope and get a straight answer - no obligation."
      />
    </>
  );
}
