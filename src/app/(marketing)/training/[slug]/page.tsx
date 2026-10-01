import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getProgramBySlug, getAllProgramSlugs } from "@/lib/queries/programs";
import { getTestimonialsByProgramId } from "@/lib/queries/testimonials";
import { siteConfig } from "@/config/site";
import { JsonLd } from "@/components/shared/json-ld";
import { ProgramHero } from "@/components/sections/program-hero";
import { StickyEnrollBar } from "@/components/sections/sticky-enroll-bar";
import { ProgramOutcomes } from "@/components/sections/program-outcomes";
import { ProgramCurriculum } from "@/components/sections/program-curriculum";
import { ProgramTestimonials } from "@/components/sections/program-testimonials";
import { ProgramPricingRecap } from "@/components/sections/program-pricing-recap";
import { CTASection } from "@/components/sections/cta-section";

interface ProgramPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Statically generates every published program at build time, per the
 * Phase B/D pattern. Slugs published after the last build still work -
 * Next.js falls back to on-demand rendering for params not in this list
 * (dynamicParams defaults to true), which is what src/app/(marketing)/
 * training/[slug]/loading.tsx exists to cover.
 */
export async function generateStaticParams() {
  const slugs = await getAllProgramSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProgramPageProps): Promise<Metadata> {
  const { slug } = await params;

  // getProgramBySlug deliberately doesn't catch-and-degrade (see its own
  // comment - a real DB failure must surface as an error, not look like a
  // deleted program) - correct for the page body, but generateMetadata runs
  // in a separate Next.js phase (marketing)/error.tsx never sees, so an
  // uncaught throw here produces Next's own generic 500 page instead of our
  // maintenance card. Caught here only, with a generic-but-honest fallback
  // title - the page body below still throws through to the real error
  // boundary as intended.
  let program: Awaited<ReturnType<typeof getProgramBySlug>>;
  try {
    program = await getProgramBySlug(slug);
  } catch (error) {
    console.error("generateMetadata (training/[slug]) failed:", error);
    return { title: "Training Program" };
  }

  if (!program) {
    return { title: "Program not found" };
  }

  return {
    title: program.seoTitle ?? program.title,
    description: program.seoDescription ?? program.shortDescription,
    alternates: { canonical: `/training/${program.slug}` },
    // Falls back to the generated /opengraph-image when a program has no
    // featuredImageUrl - a page-level openGraph/twitter block replaces the
    // root layout's instead of merging, so it must supply its own image
    // rather than relying on opengraph-image.tsx being auto-attached.
    openGraph: {
      title: program.seoTitle ?? program.title,
      description: program.seoDescription ?? program.shortDescription,
      url: `${siteConfig.url}/training/${program.slug}`,
      images: [program.featuredImageUrl ?? "/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      images: [program.featuredImageUrl ?? "/opengraph-image"],
      title: program.seoTitle ?? program.title,
      description: program.seoDescription ?? program.shortDescription,
    },
  };
}

export default async function ProgramDetailPage({ params }: ProgramPageProps) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);

  if (!program) {
    notFound();
  }

  const testimonials = await getTestimonialsByProgramId(program.id);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: program.title,
          description: program.shortDescription,
          provider: {
            "@type": "Organization",
            name: siteConfig.name,
            sameAs: siteConfig.url,
          },
          offers: {
            "@type": "Offer",
            price: (program.price / 100).toString(),
            priceCurrency: program.currency,
          },
        }}
      />

      <ProgramHero program={program} />
      <StickyEnrollBar program={program} />
      <ProgramOutcomes program={program} />
      <ProgramCurriculum program={program} />
      <ProgramTestimonials testimonials={testimonials} />
      <ProgramPricingRecap program={program} />

      <CTASection
        heading="Ready to start?"
        description={`Enroll in ${program.title} and start building toward something real.`}
        actionLabel="Enroll now"
        actionHref={`/signup?callbackUrl=/training/${program.slug}`}
        inverted
      />
    </>
  );
}
