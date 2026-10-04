import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { requireRole } from "@/lib/session";
import { SetPageTitle } from "@/components/dashboard-shell/layout/dashboard-title-context";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/sections/empty-state";
import { getMentorByUserId } from "@/features/mentors/server/queries";
import { getMentorInternTracks } from "@/features/internships/server/mentor-access";
import { computeTaskStats, daysUntil, formatLongDate } from "@/features/internships/lib/stats";

export const metadata: Metadata = { title: "My Interns" };

const SUBMISSION = {
  SUBMITTED: { label: "Needs your review", variant: "default" },
  CHANGES_REQUESTED: { label: "Changes requested", variant: "warning" },
  APPROVED: { label: "Approved", variant: "success" },
  NOT_ELIGIBLE: { label: "Not eligible", variant: "destructive" },
} as const;

export default async function MentorInternsPage() {
  const user = await requireRole("MENTOR");
  const mentor = await getMentorByUserId(user.id);
  const tracks = mentor ? await getMentorInternTracks(mentor.id) : [];
  // Awaiting review first, then the rest by start date (already ordered).
  const sorted = [...tracks].sort(
    (a, b) =>
      Number(b.project?.finalStatus === "SUBMITTED") -
      Number(a.project?.finalStatus === "SUBMITTED")
  );

  return (
    <>
      <SetPageTitle title="My Interns" />
      <Container className="flex flex-col gap-6 py-8">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-2xl font-semibold tracking-tight">My Interns</h2>
          <p className="text-muted-foreground text-sm">
            Interns assigned to you. Open one to see their project and progress, and to review their
            final submission.
          </p>
        </div>

        {sorted.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No interns yet"
            description="Students assigned to you appear here once they start their internship."
          />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {sorted.map((track) => {
              const stats = computeTaskStats(track.tasks);
              const status = track.project?.finalStatus;
              const badge = status ? SUBMISSION[status as keyof typeof SUBMISSION] : null;
              const daysLeft = daysUntil(track.endsAt);
              const lastReport = track.dailyReports[0]?.reportDate;
              return (
                <li key={track.id}>
                  <Link
                    href={`/mentor/interns/${track.id}`}
                    className="border-border bg-card hover:border-primary flex h-full flex-col gap-3 rounded-2xl border p-5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-col">
                        <span className="text-foreground truncate text-lg font-semibold">
                          {track.student.name ?? track.student.email}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {track.project?.title ?? "Project not assigned yet"}
                        </span>
                      </div>
                      {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
                    </div>
                    <div className="bg-muted h-2 overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${stats.percent}%` }}
                      />
                    </div>
                    <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      <span>{stats.percent}% done</span>
                      <span>
                        {stats.coreDone}/{stats.coreTotal} tasks
                      </span>
                      {track.endsAt && (
                        <span>
                          Ends {formatLongDate(track.endsAt)}
                          {daysLeft != null ? ` (${daysLeft}d left)` : ""}
                        </span>
                      )}
                      <span>Last report: {lastReport ? formatLongDate(lastReport) : "none"}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </>
  );
}
