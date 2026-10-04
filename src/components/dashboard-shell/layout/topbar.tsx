"use client";

import type { Role } from "@prisma/client";

import { useDashboardTitle } from "@/components/dashboard-shell/layout/dashboard-title-context";
import { MobileSidebar } from "@/components/dashboard-shell/layout/mobile-sidebar";
import { SearchBar } from "@/components/dashboard-shell/search/search-bar";
import { NotificationDropdown } from "@/components/dashboard-shell/notifications/notification-dropdown";
import type { Notification } from "@/components/dashboard-shell/notifications/notification-data";
import { ThemeSwitch } from "@/components/dashboard-shell/theme/theme-switch";
import { ProfileDropdown } from "@/components/dashboard-shell/profile/profile-dropdown";
import { getNavigationForRole } from "@/config/navigation";

export interface TopbarProps {
  user: { name?: string | null; email?: string | null; role: Role };
  notifications: Notification[];
}

/**
 * The dynamic page title reads from DashboardTitleContext (see
 * dashboard-title-context.tsx) - every dashboard page sets it once via
 * `<SetPageTitle title="..." />` near the top of its content. Search,
 * notifications, theme, and profile are each self-contained components;
 * this file only lays them out, it owns none of their state. Resolves its
 * own navigation config from `user.role` (rather than receiving a computed
 * NavigationConfig prop) for the same RSC-serialization reason documented
 * on Sidebar - `icon` fields are functions, and only a plain role string
 * can safely cross from the Server Component that renders this Client
 * Component.
 */
function Topbar({ user, notifications }: TopbarProps) {
  const { title } = useDashboardTitle();
  const navigation = getNavigationForRole(user.role);

  return (
    <header className="border-border bg-background/90 sticky top-0 z-30 flex h-[76px] shrink-0 items-center gap-3.5 border-b px-4 backdrop-blur-md md:px-7">
      <MobileSidebar navigation={navigation} />

      <h1 className="text-foreground min-w-0 flex-1 truncate text-lg font-semibold md:text-xl">
        {title}
      </h1>

      <div className="flex items-center gap-1.5 md:gap-2.5">
        <div className="hidden md:block">
          <SearchBar />
        </div>
        <NotificationDropdown initialNotifications={notifications} />
        <ThemeSwitch />
        <ProfileDropdown user={user} />
      </div>
    </header>
  );
}

export { Topbar };
