"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export interface RecommendedOffering {
  id: string;
  href: string;
  type: string;
  title: string;
  description: string;
  price: string;
  was: string | null;
  meta: string;
}

/** "Recommended for you" - a filterable grid of real, published offerings. Filter chips are derived from the types actually present. */
function RecommendedOfferings({ offerings }: { offerings: RecommendedOffering[] }) {
  const types = React.useMemo(
    () => ["All", ...Array.from(new Set(offerings.map((o) => o.type)))],
    [offerings]
  );
  const [filter, setFilter] = React.useState("All");
  const shown = offerings.filter((o) => filter === "All" || o.type === filter);

  if (offerings.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3.5">
        <div className="flex flex-col gap-1">
          <h2 className="text-[22px] font-bold">Recommended for you</h2>
          <p className="text-muted-foreground text-sm">
            Picked for students, based on what you&apos;re learning
          </p>
        </div>
        {types.length > 2 && (
          <div
            className="bg-muted border-border flex gap-1.5 overflow-x-auto rounded-full border p-1"
            role="tablist"
            aria-label="Filter offerings"
          >
            {types.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={filter === t}
                onClick={() => setFilter(t)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-colors",
                  filter === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((o) => (
          <Link
            key={o.id}
            href={o.href}
            className="bg-card border-border hover:border-primary/50 flex flex-col overflow-hidden rounded-2xl border transition-shadow hover:shadow-lg"
          >
            <div className="flex px-5 pt-5">
              <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs font-semibold">
                {o.type}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2 px-5 pt-3 pb-4">
              <span className="text-foreground text-lg leading-snug font-bold">{o.title}</span>
              <span className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                {o.description}
              </span>
            </div>
            <div className="border-border flex items-center justify-between gap-2.5 border-t px-5 py-3.5">
              <span className="flex items-baseline gap-2">
                <span className="text-foreground text-lg font-bold">{o.price}</span>
                {o.was && (
                  <span className="text-muted-foreground text-[13px] line-through">{o.was}</span>
                )}
              </span>
              <span className="text-muted-foreground text-[13px]">{o.meta}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export { RecommendedOfferings };
