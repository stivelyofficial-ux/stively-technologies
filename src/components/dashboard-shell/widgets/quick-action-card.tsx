import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface QuickActionCardProps {
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
  className?: string;
}

/**
 * A shortcut tile: icon, title, one-line description, and an arrow. Used by
 * every role's "quick actions" grid and the student Support card. The hover
 * is a border and background shift only - no movement.
 */
function QuickActionCard({
  label,
  description,
  icon: Icon,
  href,
  className,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group border-border bg-card hover:border-primary hover:bg-muted flex items-center gap-3.5 rounded-2xl border p-[18px] transition-colors duration-200 ease-out",
        "focus-visible:ring-ring focus-visible:ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        className
      )}
    >
      <Icon className="text-primary size-[26px] shrink-0" aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-foreground text-[15px] font-semibold">{label}</p>
        <p className="text-muted-foreground text-[13px] text-pretty">{description}</p>
      </div>
      <ArrowUpRight className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
    </Link>
  );
}

export { QuickActionCard };
