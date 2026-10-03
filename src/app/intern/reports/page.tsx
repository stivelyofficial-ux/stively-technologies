import type { Metadata } from "next";
import { Briefcase, NotebookPen } from "lucide-react";

import { getInternContext } from "@/features/internships/server/access";
import { EmptyState } from "@/components/sections/empty-state";
import { DailyReportForm } from "@/features/internships/components/student/daily-report-form";

export const metadata: Metadata = { title: "Daily report" };

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function InternReportsPage() {
  const { track } = await getInternContext({ requireOnboarded: true });

  if (!track) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Your internship unlocks after you finish a course"
        description="Complete all lessons and quizzes of your training program - daily reports open here."
        actionLabel="Go to my learning"
        actionHref="/student/learning"
      />
    );
  }

  const todaysKey = toDateKey(new Date());
  const todaysReport = track.dailyReports.find((r) => toDateKey(r.reportDate) === todaysKey);
  const history = track.dailyReports
    .filter((r) => toDateKey(r.reportDate) !== todaysKey)
    .slice(0, 30);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <h1 className="text-foreground text-3xl font-bold tracking-tight">Daily report</h1>
        <p className="text-muted-foreground">
          Share what you worked on, what&apos;s next and anything blocking you. It&apos;s optional
          and there&apos;s no cut-off - write one whenever it helps your project lead follow along.
        </p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="bg-card border-border flex flex-col gap-4 rounded-2xl border p-7">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </h2>
            <span
              className={
                "rounded-full px-3 py-1 text-[13px] font-bold " +
                (todaysReport ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")
              }
            >
              {todaysReport ? "Written" : "Not written"}
            </span>
          </div>
          <DailyReportForm trackId={track.id} todaysContent={todaysReport?.content ?? ""} />
        </div>

        <div className="flex flex-col gap-3.5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-bold">Report history</h2>
            <span className="text-muted-foreground text-sm">
              {track.dailyReports.length} written
            </span>
          </div>
          {history.length === 0 ? (
            <div className="bg-muted border-border text-muted-foreground flex flex-col items-center gap-2.5 rounded-2xl border border-dashed p-8 text-center text-[15px]">
              <NotebookPen className="text-primary size-8" aria-hidden="true" />
              Your earlier reports will appear here.
            </div>
          ) : (
            history.map((report) => (
              <div
                key={report.id}
                className="bg-card border-border flex flex-col gap-2 rounded-2xl border px-5 py-4"
              >
                <span className="text-[15px] font-bold">
                  {report.reportDate.toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="text-sm leading-relaxed text-pretty whitespace-pre-line">
                  {report.content}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
