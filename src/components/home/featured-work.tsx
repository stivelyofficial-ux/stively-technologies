import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { PortfolioItem } from "@prisma/client";

import { Section } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { PORTFOLIO_CATEGORY_LABEL } from "@/components/sections/portfolio-showcase";
import { SectionHeading } from "./section-heading";

/**
 * Published PortfolioItem rows only. `clientName` null means a self-initiated
 * concept (no paying client) and is labelled as such on every card - the
 * homepage must never imply client work that does not exist. Renders nothing
 * when there are no rows.
 */
function FeaturedWork({ items }: { items: PortfolioItem[] }) {
  if (items.length === 0) return null;
  const allConcepts = items.every((item) => !item.clientName);

  return (
    <Section id="work" className="py-16 md:py-20 lg:py-24">
      <Container className="flex flex-col gap-12 lg:gap-14">
        <SectionHeading
          eyebrow="Our work"
          title={allConcepts ? "Portfolio concepts" : "Selected work"}
          description={
            allConcepts
              ? "Live demo sites we designed and built to show our standard. Client projects will be added here as they ship."
              : "Websites, web apps and custom solutions we have built."
          }
          action={
            <Button variant="outline" asChild>
              <Link href="/work">
                View all work <ArrowRight />
              </Link>
            </Button>
          }
        />

        <ul className="grid gap-6 md:grid-cols-3">
          {items.map((item, index) => {
            const href = item.slug ? `/work/${item.slug}` : "/work";
            const isConcept = !item.clientName;
            return (
              <li key={item.id}>
                <Reveal delay={index * 70} className="h-full">
                  <Link
                    href={href}
                    className="group border-border/70 bg-card relative flex h-full flex-col overflow-hidden rounded-3xl border shadow-[0_1px_2px_rgba(18,32,92,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-28px_rgba(18,32,92,0.5)]"
                  >
                    <div className="bg-muted relative aspect-[4/3.4] w-full overflow-hidden">
                      <Image
                        src={item.imageUrl}
                        alt={`${item.title} - cover`}
                        fill
                        sizes="(min-width: 1024px) 380px, (min-width: 768px) 33vw, 100vw"
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
                        <h3 className="font-display text-xl font-semibold tracking-tight">
                          {item.title}
                        </h3>
                        {isConcept && (
                          <p className="text-muted-foreground text-xs">
                            Self-initiated demo - not for a paying client.
                          </p>
                        )}
                        <p className="text-muted-foreground text-sm text-pretty">
                          <span className="text-foreground font-semibold">
                            What this demonstrates:{" "}
                          </span>
                          {item.tagline ?? item.summary}
                        </p>
                      </div>
                      {item.tags.length > 0 && (
                        <ul className="mt-auto flex flex-wrap gap-1.5 pt-1">
                          {item.tags.slice(0, 3).map((tag) => (
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
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}

export { FeaturedWork };
