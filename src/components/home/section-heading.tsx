import * as React from "react";

import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/shared/eyebrow";

/**
 * One heading grammar for every homepage section: mono eyebrow, a large
 * tight title, one supporting line, and an optional action pinned to the
 * right on wide screens. Keeping this in one place is what makes the page's
 * vertical rhythm consistent instead of eight slightly different headers.
 */
function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  tone = "default",
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  action?: React.ReactNode;
  tone?: "default" | "inverse";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end",
        className
      )}
    >
      <div className="flex max-w-2xl flex-col gap-4">
        <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        <h2
          className={cn(
            "font-display text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]",
            tone === "inverse" ? "text-ink-foreground" : "text-foreground"
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              "max-w-xl text-base text-pretty sm:text-lg",
              tone === "inverse" ? "text-ink-muted-foreground" : "text-muted-foreground"
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export { SectionHeading };
