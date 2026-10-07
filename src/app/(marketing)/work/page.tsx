import type { Metadata } from "next";
import { Briefcase } from "lucide-react";

import { siteConfig } from "@/config/site";
import { getAllPublishedPortfolioItems } from "@/lib/queries/portfolio";
import { JsonLd } from "@/components/shared/json-ld";
import { PageHero } from "@/components/biz/page-hero";
import { HeroActions } from "@/components/biz/hero-actions";
import { WorkGrid } from "@/components/sections/work-grid";
import { CtaBand } from "@/components/biz/cta-band";
import { EmptyState } from "@/components/sections/empty-state";
import { Section } from "@/components/shared/section";
import { Container } from "@/components/shared/container";

const TITLE = "Our Work";
const DESCRIPTION =
  "Live demo sites Stively designed and built to show its standard. Client projects will be added here as they ship.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/work" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${siteConfig.url}/work`,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default async function WorkPage() {
  const items = await getAllPublishedPortfolioItems();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
            { "@type": "ListItem", position: 2, name: "Our Work", item: `${siteConfig.url}/work` },
          ],
        }}
      />
      {items.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: items.map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: item.title,
              url: item.liveUrl ?? `${siteConfig.url}/work`,
            })),
          }}
        />
      )}

      <PageHero
        eyebrow="Our work"
        title="Portfolio concepts"
        description="Live demo sites we designed and built to show our standard - each one is labelled as a concept unless it was made for a paying client. Client projects will be added here as they ship."
        actions={<HeroActions secondary={null} />}
      />

      <Section className="py-8 md:py-12">
        <Container>
          {items.length > 0 ? (
            <WorkGrid items={items} />
          ) : (
            <EmptyState
              icon={Briefcase}
              title="Our work is coming to this page soon"
              description="We're putting together a showcase to feature here. In the meantime, get in touch and we'll walk you through how we work."
              actionLabel="Get in touch"
              actionHref="/start-project"
            />
          )}
        </Container>
      </Section>

      <CtaBand
        heading="Like what you see?"
        description="Tell us about your project - we will give you a straight answer on scope, timeline, and fit."
      />
    </>
  );
}
