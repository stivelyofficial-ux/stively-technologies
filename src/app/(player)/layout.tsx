import type { Metadata } from "next";

import { requireUser } from "@/lib/session";
import { NavigationProgress } from "@/components/dashboard-shell/layout/navigation-progress";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * The course player's own chrome - deliberately NOT the dashboard shell. A
 * lesson is a focused, full-height workspace (header, course outline, the
 * lesson, study tools) so the app sidebar would only compete with it. The
 * URL is unchanged (/student/learning/...), so every existing link and
 * bookmark keeps working; this route group just swaps the wrapper. Each page
 * still runs its own requireRole - this is the defense-in-depth gate.
 */
export default async function PlayerLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <div className="bg-background text-foreground flex h-dvh flex-col overflow-hidden">
      <NavigationProgress />
      {children}
    </div>
  );
}
