import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import type { PortfolioItem, PortfolioCategory } from "@prisma/client";

import { Section } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";

export const PORTFOLIO_CATEGORY_LABEL: Record<PortfolioCategory, string> = {
  WEBSITE: "Website",
  WEB_APP: "Web App",
  ECOMMERCE: "E-commerce",
  MOBILE_APP: "Mobile App",
  BRANDING: "Branding",
  OTHER: "Project",
};

export interface PortfolioShowcaseProps {
  items: PortfolioItem[];
}

/**
 * Homepage teaser for the real, shipped work shown on /work - the concrete
 * proof ServicesGrid's own comment says doesn't exist yet ("no fabricated
 * case studies... none exist yet to show honestly"). Renders nothing when
 * `items` is empty (caller already gates on this, matching the Testimonials
 * section's exact pattern), so an unpopulated showcase never appears as a
 * broken or empty section.
 *
 * Each card's cover image sits in a fixed aspect-video box so the grid
 * never shifts layout as images load (CLS), and next/image handles WebP/AVIF
 * negotiation + lazy loading below the fold automatically - no custom
 * image-loading logic needed.
 */
function PortfolioShowcase({ items }: PortfolioShowcaseProps) {
  return (
    <Section background="muted">
      <Container className="flex flex-col gap-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex max-w-2xl flex-col gap-3">
            <Eyebrow>Our work</Eyebrow>
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-balance md:text-4xl">
              Portfolio concepts
            </h2>
            <p className="text-muted-foreground text-lg text-pretty">
              Live demo sites we designed and built to show our standard. Client projects will be
              added here as they ship.
            </p>
          </div>
          <Button variant="outline" asChild className="shrink-0">
            <Link href="/work">
              View all work
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Reveal key={item.id} delay={index * 60} className="h-full">
              <PortfolioCard item={item} />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/**
 * `clientName` doubles as the Portfolio-Concept/Client-Project distinction -
 * null means a self-initiated concept piece (no real client to name), a
 * real value means actual client work. No separate boolean/enum needed for
 * that one bit, it already falls out of the field's existing meaning.
 */
function PortfolioCard({ item }: { item: PortfolioItem }) {
  const isConcept = !item.clientName;
  const href = item.slug ? `/work/${item.slug}` : (item.liveUrl ?? "/work");
  const external = !item.slug && !!item.liveUrl;

  const body = (
    <>
      <div className="bg-muted relative aspect-[4/3.2] w-full overflow-hidden">
        <Image
          src={item.imageUrl}
          alt={`Cover image for ${item.title}`}
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <span className="absolute top-4 left-4 flex flex-wrap gap-1.5">
          <span className="bg-ink text-ink-foreground rounded-full px-3 py-1 text-xs font-semibold">
            {isConcept ? "Portfolio Concept" : "Client Project"}
          </span>
          <span className="bg-card/90 text-foreground rounded-full px-3 py-1 text-xs font-semibold backdrop-blur">
            {PORTFOLIO_CATEGORY_LABEL[item.category]}
          </span>
        </span>
        <span className="bg-card/90 text-foreground absolute top-4 right-4 flex size-9 items-center justify-center rounded-full opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-display text-xl font-semibold tracking-tight">{item.title}</h3>
          {(item.industry || item.clientName) && (
            <p className="text-muted-foreground text-xs">
              {item.clientName ? item.clientName : `${item.industry} - self-initiated demo`}
            </p>
          )}
          <p className="text-muted-foreground line-clamp-3 text-sm text-pretty">
            {item.tagline ?? item.summary}
          </p>
        </div>
        {item.tags.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {item.tags.slice(0, 4).map((tag) => (
              <li
                key={tag}
                className="border-border/80 text-muted-foreground rounded-full border px-2.5 py-1 text-[11px] font-medium"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );

  const className =
    "group border-border/70 bg-card relative flex h-full flex-col overflow-hidden rounded-3xl border shadow-[0_1px_2px_rgba(18,32,92,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-28px_rgba(18,32,92,0.5)]";

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {body}
    </a>
  ) : (
    <Link href={href} className={className}>
      {body}
    </Link>
  );
}

export { PortfolioShowcase, PortfolioCard };
