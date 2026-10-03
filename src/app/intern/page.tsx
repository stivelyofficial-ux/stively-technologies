import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, LineChart, CheckSquare, NotebookPen, Hourglass, Rocket } from "lucide-react";

import { getInternContext } from "@/features/internships/server/access";
import { EmptyState } from "@/components/sections/empty-state";
import { ProjectCard, ProjectPending } from "@/features/internships/components/intern/project-card";
import { computeTaskStats, daysUntil, formatLongDate } from "@/features/internships/lib/stats";

export const metadata: Metadata = { title: "Overview" };

const SUBMISSION_LABEL = {
  none: { text: "Not submitted", chip: "bg-muted text-muted-foreground", cta: "Go to submission" },
  SUBMITTED: { text: "Under review", chip: "bg-primary/10 text-primary", cta: "View status" },
  CHANGES_REQUESTED: {
    text: "Changes requested",
    chip: "bg-warning/15 text-foreground",
    cta: "Update submission",
  },
  APPROVED: { text: "Approved", chip: "bg-success/10 text-success", cta: "View status" },
} as const;

export default async function InternOverviewPage() {
  const { user, track } = await getInternContext({ requireOnboarded: true });

  if (!track) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Your internship unlocks after you finish a course"
        description="Complete all lessons and quizzes of your training program - your internship opens here automatically."
        actionLabel="Go to my learning"
        actionHref="/student/learning"
      />
    );
  }

  const stats = computeTaskStats(track.tasks);
  const daysLeft = daysUntil(track.endsAt);
  const upNext = track.tasks.filter((t) => t.progress !== "DONE" && !t.isAddon).slice(0, 3);
  const finalStatus = track.project?.finalStatus;
  const submission =
    finalStatus === "SUBMITTED" || finalStatus === "APPROVED" || finalStatus === "CHANGES_REQUESTED"
      ? SUBMISSION_LABEL[finalStatus]
      : SUBMISSION_LABEL.none;

  const cards = [
    {
      icon: LineChart,
      label: "Project progress",
      value: `${stats.percent}%`,
      sub: null,
      bar: stats.percent,
    },
    {
      icon: CheckSquare,
      label: "Tasks completed",
      value: `${stats.coreDone}`,
      suffix: ` / ${stats.coreTotal}`,
      sub:
        stats.addonTotal > 0
          ? `${stats.addonDone} of ${stats.addonTotal} add-ons done`
          : `${stats.coreInProgress} in progress`,
    },
    {
      icon: NotebookPen,
      label: "Daily reports",
      value: `${track.dailyReports.length}`,
      sub: "Optional - share when you like",
    },
    {
      icon: Hourglass,
      label: "Days left",
      value: daysLeft != null ? `${daysLeft}` : "-",
      sub: track.endsAt ? `Final deadline ${formatLongDate(track.endsAt)}` : "",
    },
  ];

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <h1 className="text-foreground text-3xl font-bold tracking-tight">
          Welcome, {user.name?.split(" ")[0] ?? "Intern"}
        </h1>
        <p className="text-muted-foreground">
          {track.title} ·{" "}
          {track.durationMonths ? `${track.durationMonths}-month internship` : "Internship"} ·{" "}
          {formatLongDate(track.startedAt)}
          {track.endsAt && ` to ${formatLongDate(track.endsAt)}`}
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ icon: Icon, label, value, suffix, sub, bar }) => (
          <li
            key={label}
            className="bg-card border-border flex flex-col gap-3 rounded-2xl border p-5"
          >
            <div className="text-muted-foreground flex items-center justify-between text-sm font-medium">
              {label}
              <Icon className="text-primary size-5" aria-hidden="true" />
            </div>
            <div className="text-foreground text-3xl font-bold">
              {value}
              {suffix && (
                <span className="text-muted-foreground text-lg font-medium">{suffix}</span>
              )}
            </div>
            {bar != null && (
              <div className="bg-muted h-2 overflow-hidden rounded-full" aria-hidden="true">
                <div className="bg-primary h-full rounded-full" style={{ width: `${bar}%` }} />
              </div>
            )}
            {sub && <div className="text-muted-foreground text-sm">{sub}</div>}
          </li>
        ))}
      </ul>

      {track.project ? (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <ProjectCard project={track.project} />
          <div className="flex flex-col gap-5">
            <div className="bg-card border-border flex flex-col gap-3.5 rounded-2xl border p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Up next</h3>
                <Link
                  href="/intern/tasks"
                  className="text-primary text-sm font-semibold hover:underline"
                >
                  All tasks →
                </Link>
              </div>
              {upNext.length === 0 ? (
                <p className="text-muted-foreground text-[15px]">
                  All core tasks done - head to Final submission when you&apos;re ready.
                </p>
              ) : (
                upNext.map((task) => (
                  <div
                    key={task.id}
                    className="bg-muted flex items-center gap-3 rounded-xl px-3.5 py-3"
                  >
                    <span
                      className={
                        "size-3 shrink-0 rounded-full " +
                        (task.progress === "IN_PROGRESS" ? "bg-primary" : "bg-muted-foreground/40")
                      }
                    />
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-[15px] font-semibold">{task.title}</span>
                      <span className="text-muted-foreground text-xs">
                        {task.progress === "IN_PROGRESS" ? "In progress" : "To do"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="bg-card border-border flex flex-col gap-3 rounded-2xl border p-6">
              <div className="flex items-center gap-2.5">
                <Rocket className="text-primary size-[22px]" aria-hidden="true" />
                <h3 className="text-lg font-bold">Final submission</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Build the whole project, then submit once with your live URL and GitHub repository.
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span
                  className={"rounded-full px-3 py-1.5 text-[13px] font-bold " + submission.chip}
                >
                  {submission.text}
                </span>
                <Link
                  href="/intern/submit"
                  className="border-border hover:border-primary hover:text-primary rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
                >
                  {submission.cta}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ProjectPending />
      )}
    </div>
  );
}
