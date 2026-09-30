import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, ClipboardList, CalendarCheck, ExternalLink, CheckCircle2, Clock, RotateCcw } from "lucide-react";

import { requireRole } from "@/lib/session";
import { SetPageTitle } from "@/components/dashboard-shell/layout/dashboard-title-context";
import { EmptyState } from "@/components/sections/empty-state";
import { Container } from "@/components/shared/container";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getInternshipTrackForStudent } from "@/features/internships/server/queries";
import { DailyReportForm } from "@/features/internships/components/student/daily-report-form";
import { TaskSubmitButton } from "@/features/internships/components/student/task-submit-button";

export const metadata: Metadata = { title: "Internship" };

const TASK_STATUS_BADGE: Record<string, { label: string; variant: "success" | "default" | "warning" | "secondary" }> = {
  PENDING: { label: "Not started", variant: "secondary" },
  SUBMITTED: { label: "Submitted - awaiting review", variant: "default" },
  APPROVED: { label: "Approved", variant: "success" },
  CHANGES_REQUESTED: { label: "Changes requested", variant: "warning" },
};

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function StudentInternshipsPage() {
  const user = await requireRole("STUDENT");
  const track = await getInternshipTrackForStudent(user.id);

  if (!track) {
    return (
      <>
        <SetPageTitle title="Internship" />
        <Container className="py-8">
          <EmptyState
            icon={Briefcase}
            title="Your internship unlocks after you finish a course"
            description="Complete any training program - all lessons, all quizzes - and your internship track opens up automatically, right here."
            actionLabel="Browse training programs"
            actionHref="/training"
          />
        </Container>
      </>
    );
  }

  const approvedCount = track.tasks.filter((t) => t.status === "APPROVED").length;
  const todaysKey = toDateKey(new Date());
  const todaysReport = track.dailyReports.find((r) => toDateKey(r.reportDate) === todaysKey);

  return (
    <>
      <SetPageTitle title="Internship" />
      <Container className="flex flex-col gap-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-foreground font-display text-2xl font-semibold tracking-tight">{track.title}</h1>
            <p className="text-muted-foreground text-sm">
              {track.status === "COMPLETED" ? "Internship complete" : "Internship in progress"}
            </p>
          </div>
          <Badge variant={track.status === "COMPLETED" ? "success" : "default"} className="text-sm">
            {track.status === "COMPLETED" ? "Completed" : "Active"}
          </Badge>
        </div>

        {!track.project ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="bg-muted flex size-11 items-center justify-center rounded-full">
                <Clock className="text-muted-foreground size-5" aria-hidden="true" />
              </span>
              <p className="text-foreground font-medium">Your project hasn&apos;t been assigned yet</p>
              <p className="text-muted-foreground max-w-sm text-sm">
                Our team assigns a real project to every intern personally - you&apos;ll see it appear here, along
                with your first tasks, once that happens.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="text-primary size-4" aria-hidden="true" />
                  {track.project.title}
                </CardTitle>
                <CardDescription className="text-pretty whitespace-pre-line">{track.project.brief}</CardDescription>
              </CardHeader>
              {(track.project.instructions || track.project.resourceUrl) && (
                <CardContent className="flex flex-col gap-3">
                  {track.project.instructions && (
                    <p className="text-muted-foreground text-sm text-pretty whitespace-pre-line">
                      {track.project.instructions}
                    </p>
                  )}
                  {track.project.resourceUrl && (
                    <Link
                      href={track.project.resourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary inline-flex w-fit items-center gap-1.5 text-sm font-medium hover:underline"
                    >
                      Project resources
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </Link>
                  )}
                </CardContent>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="text-primary size-4" aria-hidden="true" />
                  Tasks
                </CardTitle>
                <CardDescription>
                  {approvedCount} of {track.tasks.length} approved
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {track.tasks.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No tasks assigned yet.</p>
                ) : (
                  track.tasks.map((task) => {
                    const badge = TASK_STATUS_BADGE[task.status];
                    return (
                      <div key={task.id} className="border-border/70 flex flex-col gap-2 rounded-lg border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-foreground text-sm font-medium">{task.title}</span>
                            {task.description && (
                              <span className="text-muted-foreground text-sm text-pretty">{task.description}</span>
                            )}
                          </div>
                          <Badge variant={badge.variant} className="shrink-0">
                            {task.status === "APPROVED" && <CheckCircle2 className="size-3" aria-hidden="true" />}
                            {badge.label}
                          </Badge>
                        </div>
                        {task.status === "CHANGES_REQUESTED" && task.feedback && (
                          <p className="text-warning bg-warning/10 rounded-md p-2 text-xs text-pretty">{task.feedback}</p>
                        )}
                        {(task.status === "PENDING" || task.status === "CHANGES_REQUESTED") && (
                          <div className="flex justify-end">
                            <TaskSubmitButton taskId={task.id} isRetry={task.status === "CHANGES_REQUESTED"} />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarCheck className="text-primary size-4" aria-hidden="true" />
                  Daily work report
                </CardTitle>
                <CardDescription>A short update on what you worked on - every day you&apos;re active on the project.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <DailyReportForm trackId={track.id} todaysContent={todaysReport?.content ?? ""} />

                {track.dailyReports.length > 0 && (
                  <div className="border-border/70 flex flex-col gap-3 border-t pt-4">
                    <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                      <RotateCcw className="size-3.5" aria-hidden="true" />
                      Past reports
                    </span>
                    <ul className="flex flex-col gap-3">
                      {track.dailyReports
                        .filter((r) => toDateKey(r.reportDate) !== todaysKey)
                        .slice(0, 14)
                        .map((report) => (
                          <li key={report.id} className="flex flex-col gap-0.5">
                            <span className="text-foreground text-xs font-medium">
                              {report.reportDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            <span className="text-muted-foreground text-sm text-pretty whitespace-pre-line">{report.content}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </Container>
    </>
  );
}
