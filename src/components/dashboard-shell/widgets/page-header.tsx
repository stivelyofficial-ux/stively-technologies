import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** Right-aligned action(s), usually a Button or a status chip. */
  action?: React.ReactNode;
  className?: string;
}

/** The page title block every dashboard page opens with - one H1 per page, 28/32px bold, with an optional one-line description and an optional action on the right. */
function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="flex min-w-0 flex-col gap-1.5">
        <h1 className="text-foreground text-[28px] font-bold tracking-tight sm:text-[32px]">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-base text-pretty">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export { PageHeader };
