import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Reveal } from "@/components/shared/reveal";

export interface FeatureCardItem {
  title: string;
  description: string;
  icon?: LucideIcon;
}

/**
 * Icon cards in a responsive grid - the one card style used across the
 * business pages (what we build, why choose us, industries, values...).
 */
function FeatureCards({
  items,
  columns = 3,
  className,
}: {
  items: FeatureCardItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "grid gap-5 sm:grid-cols-2",
        columns === 3 && "lg:grid-cols-3",
        columns === 4 && "lg:grid-cols-4",
        className
      )}
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <li key={item.title}>
            <Reveal delay={Math.min(index, 5) * 55} className="h-full">
              <div className="border-border/70 bg-card hover:border-primary/30 flex h-full flex-col gap-4 rounded-3xl border p-7 shadow-[0_1px_2px_rgba(18,32,92,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(43,89,230,0.35)]">
                {Icon && (
                  <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                )}
                <div className="flex flex-col gap-2">
                  <h3 className="font-display text-lg font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-[15px] leading-relaxed text-pretty">
                    {item.description}
                  </p>
                </div>
              </div>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}

export { FeatureCards };
