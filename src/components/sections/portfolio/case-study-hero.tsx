import Image from "next/image";
import type { PortfolioItem } from "@prisma/client";
import { ArrowUpRight } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/biz/page-hero";
import { PORTFOLIO_CATEGORY_LABEL } from "@/components/sections/portfolio-showcase";

/**
 * The case-study opening: breadcrumb, concept/client + category chips, title,
 * tagline, "Visit live site", then the cover image in a rounded frame. Concepts
 * are labelled as such - this page must never imply a paying client that does
 * not exist.
 */
function CaseStudyHero({ item }: { item: PortfolioItem }) {
  const isConcept = !item.clientName;

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: "Work", href: "/work" }, { label: item.title }]}
        eyebrow={item.industry ?? "Our work"}
        title={item.title}
        description={item.tagline ?? undefined}
        meta={
          <>
            <span className="bg-ink text-ink-foreground rounded-full px-3 py-1 text-xs font-semibold">
              {isConcept ? "Portfolio Concept" : "Client Project"}
            </span>
            <span className="border-border bg-card text-foreground rounded-full border px-3 py-1 text-xs font-semibold">
              {PORTFOLIO_CATEGORY_LABEL[item.category]}
            </span>
            {isConcept && (
              <span className="text-muted-foreground text-xs">
                Self-initiated demo - not for a paying client
              </span>
            )}
          </>
        }
        actions={
          item.liveUrl ? (
            <Button size="lg" asChild>
              <a href={item.liveUrl} target="_blank" rel="noopener noreferrer">
                Visit live site
                <ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
          ) : undefined
        }
        compact
      />
      <Container>
        <div className="border-border/70 bg-muted relative aspect-video w-full overflow-hidden rounded-[28px] border shadow-[0_40px_80px_-40px_rgba(18,32,92,0.5)]">
          <Image
            src={item.imageUrl}
            alt={`Cover image for ${item.title}`}
            fill
            priority
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="object-cover object-top"
          />
        </div>
      </Container>
    </>
  );
}

export { CaseStudyHero };
