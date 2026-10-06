import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { getFeaturedTestimonials } from "@/lib/queries/testimonials";
import { getFeaturedPortfolioItems } from "@/lib/queries/portfolio";
import { JsonLd } from "@/components/shared/json-ld";
import { Testimonials } from "@/components/sections/testimonials";
import { HomeHero } from "@/components/home/home-hero";
import { BuiltWith } from "@/components/home/built-with";
import { NicheCards } from "@/components/home/niche-cards";
import { ApproachPanel } from "@/components/home/approach-panel";
import { FeaturedWork } from "@/components/home/featured-work";
import { ClientResults } from "@/components/home/client-results";
import { ProcessDark } from "@/components/home/process-dark";
import { RiskReduction } from "@/components/home/risk-reduction";
import { PricingTeaser } from "@/components/home/pricing-teaser";
import { ServicesBento } from "@/components/home/services-bento";
import { TeamSection } from "@/components/home/team-section";
import { HomeFaq } from "@/components/home/home-faq";
import { TrainingStrip } from "@/components/home/training-strip";
import { FinalCta } from "@/components/home/final-cta";

const TITLE = "Stively: Custom Websites and Software for Growing Businesses";
// Kept under ~160 characters so Google and social previews don't truncate
// it mid-sentence - see the same discipline applied site-wide in Phase 5.
const DESCRIPTION =
  "Custom websites and software for growing businesses, built by a trained team. Fixed price, visible progress at every stage, and direct access to the people building it.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  // Explicit "images" below is required, not redundant with opengraph-image.tsx:
  // Next.js only auto-merges the generated image when a route has NO
  // page-level openGraph/twitter block. Once a page defines its own (as this
  // one does, for title/description/url), that object fully replaces the
  // parent's instead of merging field-by-field, silently dropping the image.
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: siteConfig.url,
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
 * Business-first company homepage (AD-042). Everything above the pricing
 * section speaks to businesses; training is only a nav link, a footer link
 * and one quiet strip near the bottom. Order: hero -> stack -> who we build
 * for -> approach -> portfolio concepts (labelled as concepts) -> client
 * results (renders only when real ones exist) -> process -> risk -> pricing
 * -> also available -> team (only when real) -> FAQ -> training strip -> ask.
 *
 * BRAND_PRINCIPLES #6 stands: no fabricated stats, client logos, testimonials
 * or team. Client results and team render nothing until real data is added in
 * src/config.
 */
export default async function HomePage() {
  const [testimonials, portfolioItems] = await Promise.all([
    getFeaturedTestimonials(),
    getFeaturedPortfolioItems(),
  ]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
          logo: `${siteConfig.url}/logo.png`,
          email: siteConfig.contactEmail,
          telephone: siteConfig.contactPhone,
          sameAs: [
            siteConfig.links.linkedin,
            siteConfig.links.instagram,
            siteConfig.links.facebook,
            ...(siteConfig.links.twitter ? [siteConfig.links.twitter] : []),
          ],
        }}
      />
      <HomeHero />
      <BuiltWith />
      <NicheCards />
      <ApproachPanel />
      <FeaturedWork items={portfolioItems} />
      <ClientResults />
      <ProcessDark />
      <RiskReduction />
      <PricingTeaser />
      <ServicesBento />
      {testimonials.length > 0 && <Testimonials testimonials={testimonials} />}
      <TeamSection compact />
      <HomeFaq />
      <TrainingStrip />
      <FinalCta />
    </>
  );
}
