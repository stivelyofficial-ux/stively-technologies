import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/container";

/**
 * Opening section for the business pages (Services, Process, About, Contact,
 * Pricing, Work, case studies...). Same visual language as the homepage hero -
 * soft blue/violet wash, faint engineering grid, mono eyebrow pill, tight
 * display type - but with compact, consistent spacing so the headline sits
 * right under the navbar instead of floating in empty space.
 *
 * Deliberately separate from the shared HeroSection (training and course
 * pages still use that one unchanged).
 */
function PageHero({
  id,
  eyebrow,
  title,
  description,
  actions,
  visual,
  breadcrumbs,
  meta,
  compact = false,
  className,
}: {
  /** Anchor id, e.g. for a sticky CTA bar that watches the hero. */
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Optional right-hand visual (screenshot, scene). Hero is single-column when absent. */
  visual?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  /** Small chips under the description (badges, tags). */
  meta?: React.ReactNode;
  /** Less space below - for heroes followed straight by an image or panel. */
  compact?: boolean;
  className?: string;
}) {
  return (
    <section id={id} className={cn("relative isolate overflow-hidden", className)}>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 900px 520px at 6% -10%, oklch(0.541 0.216 265.75 / 0.10), transparent 60%)," +
            "radial-gradient(ellipse 800px 520px at 96% 10%, oklch(0.62 0.18 300 / 0.11), transparent 60%)",
        }}
      />
      <div aria-hidden="true" className="home-grid absolute inset-0 -z-10" />

      <Container
        className={cn(
          compact
            ? "pt-10 pb-6 md:pt-14 md:pb-8 lg:pt-16"
            : "pt-10 pb-12 md:pt-14 md:pb-16 lg:pt-16 lg:pb-20",
          visual && "grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12"
        )}
      >
        <div className="flex flex-col items-start gap-5">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb">
              <ol className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm">
                {breadcrumbs.map((crumb, i) => (
                  <li key={crumb.label} className="flex items-center gap-1.5">
                    {i > 0 && <ChevronRight className="size-3.5" aria-hidden="true" />}
                    {crumb.href ? (
                      <Link href={crumb.href} className="hover:text-foreground transition-colors">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-foreground font-medium">{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {eyebrow && (
            <span className="border-primary/15 bg-primary/[0.07] text-primary inline-flex items-center gap-2.5 rounded-full border px-4 py-2 font-mono text-[11px] font-semibold tracking-[0.18em] uppercase">
              <span className="bg-primary size-1.5 rounded-full" />
              {eyebrow}
            </span>
          )}

          <h1 className="font-display text-[clamp(2.25rem,4.6vw,4rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-balance">
            {title}
          </h1>

          {description && (
            <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed text-pretty sm:text-xl">
              {description}
            </p>
          )}

          {meta && <div className="flex flex-wrap items-center gap-2">{meta}</div>}

          {actions && (
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">{actions}</div>
          )}
        </div>

        {visual && <div className="min-w-0">{visual}</div>}
      </Container>
    </section>
  );
}

export { PageHero };
