import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="border-border bg-card flex flex-col items-center gap-4 rounded-2xl border px-6 py-14 text-center">
      <div className="bg-primary/10 flex size-14 items-center justify-center rounded-full">
        <Icon className="text-primary size-7" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-foreground text-xl font-bold">{title}</h3>
        {description && <p className="text-muted-foreground max-w-sm text-sm">{description}</p>}
      </div>
      {actionLabel && actionHref && (
        <Button variant="outline" asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}

export { EmptyState };
