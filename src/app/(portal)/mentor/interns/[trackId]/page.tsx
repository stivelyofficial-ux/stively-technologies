import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireRole } from "@/lib/session";
import { SetPageTitle } from "@/components/dashboard-shell/layout/dashboard-title-context";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getMentorByUserId } from "@/features/mentors/server/queries";
import { mentorCanAccessTrack } from "@/features/internships/server/mentor-access";
import { getInternshipTrackForAdmin } from "@/features/internships/server/queries";
import { computeTaskStats, formatLongDate } from "@/features/internships/lib/stats";
import { FinalSubmissionReview } from "@/features/internships/components/admin/final-submission-review";

export const metadata: Metadata = { title: "Intern" };

const PROGRESS_LABEL = { TODO: "To do", IN_PROGRESS: "In progress", DONE: "Done" } as const;

export default async function MentorInternDetailPage({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = await params;
  const user = await requireRole("MENTOR");
  const mentor = await getMentorByUserId(user.id);
  // Not-found for both "doesn't exist" and "not your intern" - a mentor can't probe other mentors' interns.
  if (!mentor || !(await mentorCanAccessTrack(mentor.id, trackId))) notFound();
  const track = await getInternshipTrackForAdmin(trackId);
  if (!track) notFound();

  const stats = computeTaskStats(track.tasks);
  const summary = [
    { label: "Project progress", value: `${stats.percent}%` },
    { label: "Core tasks done", value: `${stats.coreDone} / ${stats.coreTotal}` },
    { label: "Add-ons done", value: `${stats.addonDone} / ${stats.addonTotal}` },
    { label: "Daily reports", value: `${track.dailyReports.length}` },
  ];

  return (
    <>
      <SetPageTitle title={track.student.name ?? "Intern"} />
      <Container className="flex flex-col gap-6 py-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/mentor/interns"
            aria-label="Back to My Interns"
            className="hover:bg-accent flex size-9 items-center justify-center rounded-full"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              {track.student.name ?? "Unnamed"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {track.student.email} · {track.title}
            </p>
          </div>
          <Badge variant={track.status === "COMPLETED" ? "success" : "default"} className="ml-auto">
            {track.status}
          </Badge>
        </div>

        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {summary.map((item) => (
            <li key={item.label}>
              <Card>
                <CardContent className="flex flex-col gap-1 py-4">
                  <span className="text-foreground text-lg font-semibold tabular-nums">
                    {item.value}
                  </span>
                  <span className="text-muted-foreground text-xs">{item.label}</span>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Final submission</CardTitle>
            </CardHeader>
            <CardContent>
              {track.project ? (
                <FinalSubmissionReview trackId={track.id} project={track.project} />
              ) : (
                <p className="text-muted-foreground text-sm">No project has been assigned yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {track.project ? `Project ${track.project.sequence}: ${track.project.title}` : "Project"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              {track.project ? (
                <>
                  <p className="text-pretty whitespace-pre-line">{track.project.brief}</p>
                  {track.project.instructions && (
                    <p className="text-muted-foreground text-pretty whitespace-pre-line">
                      {track.project.instructions}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">Not assigned yet.</p>
              )}
              {track.endsAt && (
                <p className="text-muted-foreground">
                  Final deadline {formatLongDate(track.endsAt)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tasks and add-ons</CardTitle>
          </CardHeader>
          <CardContent>
            {track.tasks.length === 0 ? (
              <p className="text-muted-foreground text-sm">No tasks yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {track.tasks.map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-foreground">
                      {task.title}
                      {task.isAddon && <span className="text-muted-foreground"> · add-on</span>}
                    </span>
                    <Badge variant={task.progress === "DONE" ? "success" : "secondary"}>
                      {PROGRESS_LABEL[task.progress as keyof typeof PROGRESS_LABEL] ??
                        task.progress}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily reports</CardTitle>
          </CardHeader>
          <CardContent>
            {track.dailyReports.length === 0 ? (
              <p className="text-muted-foreground text-sm">No reports written yet.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {track.dailyReports.map((report) => (
                  <li key={report.id} className="border-border/70 border-b pb-3 last:border-0">
                    <span className="text-foreground text-xs font-medium">
                      {formatLongDate(report.reportDate)}
                    </span>
                    <p className="text-muted-foreground text-sm whitespace-pre-line">
                      {report.content}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
