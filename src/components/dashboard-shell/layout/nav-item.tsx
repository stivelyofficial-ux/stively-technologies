"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { NavItem as NavItemConfig } from "@/config/navigation";

export interface NavItemProps {
  item: NavItemConfig;
  /** Called after navigation - MobileSidebar passes this to close the drawer on selection; the desktop Sidebar omits it. */
  onNavigate?: () => void;
}

/**
 * Shared by both Sidebar (desktop) and MobileSidebar (drawer) so active-
 * state logic and markup exist in exactly one place. A nav item is
 * "active" on an exact match for the root dashboard link and a prefix
 * match otherwise, the same rule src/components/dashboard/sidebar.tsx's
 * CRM sidebar already established - kept consistent rather than inventing
 * a second convention.
 */
function NavItem({ item, onNavigate }: NavItemProps) {
  const pathname = usePathname();
  const isDashboardRoot = item.href.endsWith("/dashboard");
  const isActive = isDashboardRoot ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] outline-none",
        "transition-colors duration-150 ease-out",
        "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2",
        isActive
          ? "bg-primary/10 text-primary font-semibold"
          : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
      )}
    >
      <item.icon
        className={cn(
          "size-5 shrink-0 transition-colors duration-150",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}
        aria-hidden="true"
      />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge !== undefined && (
        <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export { NavItem };
