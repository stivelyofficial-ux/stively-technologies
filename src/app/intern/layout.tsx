import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { requireUser } from "@/lib/session";
import { Logo } from "@/components/shared/logo";
import { ThemeSwitch } from "@/components/dashboard-shell/theme/theme-switch";
import { InternProfileMenu } from "@/features/internships/components/intern/intern-profile-menu";
import { NavigationProgress } from "@/components/dashboard-shell/layout/navigation-progress";
import { InternNav } from "@/features/internships/components/intern/intern-nav";

export const metadata: Metadata = {
  title: { default: "Intern Portal", template: "%s | Stively Intern Portal" },
  robots: { index: false, follow: false },
};

/**
 * The internship portal - deliberately its own standalone shell (not the
 * Student sidebar dashboard): a student who finishes the course steps out
 * of "learning" and into "working", and the chrome should say so. The
 * account is still a Student (course access, certificates and referrals
 * stay where they were); the "Student dashboard" link switches back.
 */
export default async function InternLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="bg-background min-h-dvh">
      <NavigationProgress />
      <header className="border-border bg-background/90 sticky top-0 z-30 border-b backdrop-blur-md print:hidden">
        <div className="mx-auto flex h-[72px] max-w-[1120px] items-center gap-4 px-6">
          {/* Logo is itself a link (to the main site) - a link can't contain a link, so the portal badge is its own sibling link. */}
          <div className="flex items-center gap-3">
            <Logo />
            <Link
              href="/intern"
              className="bg-primary/10 text-primary hidden rounded-full px-2.5 py-0.5 text-xs font-semibold sm:inline"
            >
              Intern Portal
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <Link
              href="/student/dashboard"
              className="text-muted-foreground hover:text-foreground hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors sm:flex"
            >
              <GraduationCap className="size-4" aria-hidden="true" />
              Student dashboard
            </Link>
            <ThemeSwitch />
            <InternProfileMenu user={user} />
          </div>
        </div>
        <div className="mx-auto max-w-[1120px] px-6">
          <InternNav />
        </div>
      </header>
      <main id="main-content" className="mx-auto max-w-[1120px] px-6 pt-10 pb-20">
        {children}
      </main>
    </div>
  );
}
