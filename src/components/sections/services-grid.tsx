import { siteConfig } from "@/config/site";
import { Section } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { JsonLd } from "@/components/shared/json-ld";
import { SectionHeading } from "@/components/home/section-heading";
import { FeatureCards } from "@/components/biz/feature-cards";
import { SERVICES } from "@/lib/services-data";

/**
 * The /services grid. Reads from the same SERVICES list the homepage uses
 * (single source of truth) and emits the Service/OfferCatalog structured
 * data for search engines.
 */
function ServicesGrid() {
  return (
    <Section className="py-16 md:py-20 lg:py-24">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: "Software Development",
          provider: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
          areaServed: "Worldwide",
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Software Development Services",
            itemListElement: SERVICES.map((service) => ({
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: service.title,
                description: service.description,
              },
            })),
          },
        }}
      />
      <Container className="flex flex-col gap-12 lg:gap-14">
        <SectionHeading
          eyebrow="What we build"
          title="Software, built the way an in-house team would build it"
          description="Six capability areas, backed by a team trained on real projects, not a freelancer roster."
        />
        <FeatureCards items={SERVICES} />
      </Container>
    </Section>
  );
}

export { ServicesGrid };
