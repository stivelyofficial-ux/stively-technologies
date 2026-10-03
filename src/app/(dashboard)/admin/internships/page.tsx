import type { Metadata } from "next";
import Link from "next/link";
import { Rocket, Users, ClipboardCheck, Hourglass, CheckCircle2 } from "lucide-react";

import { requireRole } from "@/lib/session";
import { getInternshipTracksForAdmin } from "@/features/internships/server/queries";
import { computeTaskStats, daysUntil, formatLongDate } from "@/features/internships/lib/stats";
import { EmptyState } from "@/components/sections/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Internships" };

type Filter = "all" | "review" | "active" | "pending" | "done";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "review", label: "Needs review" },
  { key: "active", label: "In progress" },
  { key: "pending", label: "Not started" },
  { key: "done", label: "Completed" },
];

const SUBMISSION_BADGE = {
  SUBMITTED: { label: "Awaiting review", variant: "default" },
  CHANGES_REQUESTED: { label: "Changes requested", variant: "warning" },
  APPROVED: { label: "Approved", variant: "success" },
} as const;

export default async function AdminInternshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const { filter: rawFilter } = await searchParams;
  const filter: Filter = FILTERS.some((f) => f.key === rawFilter) ? (rawFilter as Filter) : "all";
  const tracks = await getInternshipTracksForAdmin();

  const rows = tracks.map((track) => ({ track, stats: computeTaskStats(track.tasks) }));
  const needsReview = rows.filter((r) => r.track.project?.finalStatus === "SUBMITTED");
  const notStarted = rows.filter((r) => !r.track.onboardedAt);
  const inProgress = rows.filter((r) => r.track.onboardedAt && r.track.status !== "COMPLETED");
  const completed = rows.filter((r) => r.track.status === "COMPLETED");

  const visible =
    filter === "review"
      ? needsReview
      : filter === "active"
        ? inProgress
        : filter === "pending"
          ? notStarted
          : filter === "done"
            ? completed
            : rows;

  const counts: Record<Filter, number> = {
    all: rows.length,
    review: needsReview.length,
    active: inProgress.length,
    pending: notStarted.length,
    done: completed.length,
  };

  const summary = [
    { icon: Users, label: "Total interns", value: rows.length },
    { icon: ClipboardCheck, label: "Awaiting your review", value: needsReview.length },
    { icon: Hourglass, label: "Not started yet", value: notStarted.length },
    { icon: CheckCircle2, label: "Completed", value: completed.length },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">Internships</h1>
        <p className="text-muted-foreground text-sm">
          A track is created the moment a student finishes a course. They choose a duration and
          accept the stipend terms, then work through their project - open any intern to assign a
          project, review their final submission and follow their progress.
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summary.map(({ icon: Icon, label, value }) => (
          <li key={label}>
            <Card>
              <CardContent className="flex flex-col gap-1.5 py-4">
                <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="text-foreground text-lg font-semibold tabular-nums">{value}</span>
                <span className="text-muted-foreground text-xs">{label}</span>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <nav aria-label="Filter interns" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/admin/internships" : `/admin/internships?filter=${f.key}`}
            aria-current={filter === f.key ? "page" : undefined}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              filter === f.key
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label} <span className="opacity-70">{counts[f.key]}</span>
          </Link>
        ))}
      </nav>

      {visible.length === 0 ? (
        <EmptyState
          icon={Rocket}
          title={rows.length === 0 ? "No internship tracks yet" : "Nobody in this view"}
          description={
            rows.length === 0
              ? "These appear automatically once a student completes a training program."
              : "Try another filter."
          }
        />
      ) : (
        <div className="border-border overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-left text-xs">
              <tr>
                <th className="px-4 py-2.5 font-medium">Intern</th>
                <th className="px-4 py-2.5 font-medium">Project</th>
                <th className="px-4 py-2.5 font-medium">Progress</th>
                <th className="px-4 py-2.5 font-medium">Duration</th>
                <th className="px-4 py-2.5 font-medium">Last report</th>
                <th className="px-4 py-2.5 font-medium">Final submission</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {visible.map(({ track, stats }) => {
                const submission = track.project?.finalStatus
                  ? SUBMISSION_BADGE[track.project.finalStatus as keyof typeof SUBMISSION_BADGE]
                  : null;
                const daysLeft = daysUntil(track.endsAt);
                const lastReport = track.dailyReports[0]?.reportDate;
                return (
                  <tr key={track.id} className="hover:bg-accent/40">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/internships/${track.id}`}
                        className="text-primary font-medium hover:underline"
                      >
                        {track.student.name ?? "Unnamed"}
                      </Link>
                      <div className="text-muted-foreground text-xs">{track.student.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      {track.project ? (
                        <span className="text-foreground">{track.project.title}</span>
                      ) : (
                        <span className="text-warning font-medium">Not assigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {stats.coreTotal === 0 ? (
                        <span className="text-muted-foreground">-</span>
                      ) : (
                        <div className="flex w-32 flex-col gap-1">
                          <span className="text-foreground text-xs tabular-nums">
                            {stats.coreDone}/{stats.coreTotal} tasks · {stats.percent}%
                          </span>
                          <div
                            className="bg-muted h-1.5 overflow-hidden rounded-full"
                            aria-hidden="true"
                          >
                            <div
                              className="bg-primary h-full rounded-full"
                              style={{ width: `${stats.percent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {track.onboardedAt && track.durationMonths ? (
                        <div className="flex flex-col">
                          <span className="text-foreground">{track.durationMonths} mo</span>
                          <span className="text-muted-foreground text-xs">
                            {track.endsAt && `ends ${formatLongDate(track.endsAt)}`}
                            {daysLeft != null && ` (${daysLeft}d left)`}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="secondary">Not started</Badge>
                      )}
                    </td>
                    <td className="text-muted-foreground px-4 py-3">
                      {lastReport ? (
                        <>
                          {formatLongDate(lastReport)}
                          <div className="text-xs">{track._count.dailyReports} total</div>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {submission ? (
                        <Badge variant={submission.variant}>{submission.label}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Not submitted</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          track.status === "COMPLETED"
                            ? "success"
                            : track.status === "PAUSED"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {track.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
