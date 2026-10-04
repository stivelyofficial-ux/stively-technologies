import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { ThemeSwitch } from "@/components/dashboard-shell/theme/theme-switch";
import { ProfileDropdown } from "@/components/dashboard-shell/profile/profile-dropdown";
import type { Role } from "@prisma/client";

/** The course player's top bar: brand, back to My Learning, the course name, overall progress, theme and account. */
function PlayerHeader({
  courseTitle,
  percent,
  user,
}: {
  courseTitle: string;
  percent: number;
  user: { name?: string | null; email?: string | null; role: Role };
}) {
  return (
    <header className="border-border bg-background flex h-[60px] shrink-0 items-center gap-3 border-b px-3 sm:h-[68px] sm:gap-3.5 sm:px-5">
      <Logo />
      <span className="bg-border hidden h-7 w-px sm:block" aria-hidden="true" />
      <Link
        href="/student/learning"
        className="text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1.5 text-sm font-medium whitespace-nowrap transition-colors"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">My Learning</span>
        <span className="sr-only sm:hidden">Back to My Learning</span>
      </Link>
      <h1 className="text-foreground hidden min-w-0 flex-1 truncate text-[15px] font-semibold md:block">
        {courseTitle}
      </h1>
      <span className="flex-1 md:hidden" />
      <div className="flex items-center gap-2.5">
        <div className="text-muted-foreground hidden items-center gap-2.5 text-[13px] whitespace-nowrap sm:flex">
          <div className="bg-muted h-1.5 w-[120px] overflow-hidden rounded-full" aria-hidden="true">
            <div
              className="bg-primary h-full rounded-full transition-[width] duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <b className="text-foreground tabular-nums">{percent}%</b>
        </div>
        <span className="text-foreground text-[13px] font-bold tabular-nums sm:hidden">
          {percent}%
        </span>
        <ThemeSwitch />
        <ProfileDropdown user={user} />
      </div>
    </header>
  );
}

export { PlayerHeader };
