"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/intern", label: "Overview", exact: true },
  { href: "/intern/tasks", label: "Tasks", exact: false },
  { href: "/intern/reports", label: "Daily report", exact: false },
  { href: "/intern/submit", label: "Final submission", exact: false },
  { href: "/intern/documents", label: "Documents", exact: false },
] as const;

function InternNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Intern portal" className="-mb-px flex gap-1 overflow-x-auto">
      {ITEMS.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "border-b-2 px-4 pt-3 pb-3.5 text-base whitespace-nowrap transition-colors",
              active
                ? "border-primary text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground border-transparent font-medium"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export { InternNav };
