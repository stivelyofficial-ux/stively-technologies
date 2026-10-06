import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireRole } from "@/lib/session";
import { getInternshipTrackForAdmin } from "@/features/internships/server/queries";
import { computeTaskStats, daysUntil, formatLongDate } from "@/features/internships/lib/stats";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AssignProjectForm } from "@/features/internships/components/admin/assign-project-form";
import { AssignTemplateButtons } from "@/features/internships/components/admin/assign-template-button";
import { PROJECT_TEMPLATES } from "@/features/internships/lib/project-templates";
import { FinalSubmissionReview } from "@/features/internships/components/admin/final-submission-review";
import { TaskManager } from "@/features/internships/components/admin/task-manager";
import { DurationControl } from "@/features/internships/components/admin/duration-control";
import { listTrackDocuments } from "@/features/internship-documents/server/issuance";
import { KIND_META } from "@/features/internship-documents/lib/documents";
import { TrackStatusControls } from "@/features/internships/components/admin/track-status-controls";

interface AdminInternshipDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: AdminInternshipDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const track = await getInternshipTrackForAdmin(id);
  return {
    title: track ? `${track.student.name ?? track.student.email} - Internship` : "Internship",
  };
}

export default async function AdminInternshipDetailPage({
  params,
}: AdminInternshipDetailPageProps) {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const { id } = await params;
  const track = await getInternshipTrackForAdmin(id);
  if (!track) notFound();

  const documents = await listTrackDocuments(track.id);
  const stats = computeTaskStats(track.tasks);
  const daysLeft = daysUntil(track.endsAt);
  const lastReport = track.dailyReports[0]?.reportDate;

  const facts: [string, string][] = [
    [
      "Duration",
      track.durationMonths
        ? `${track.durationMonths} month${track.durationMonths > 1 ? "s" : ""}`
        : "Not chosen yet",
    ],
    ["Started", track.onboardedAt ? formatLongDate(track.startedAt) : "Has not started"],
    [
      "Ends",
      track.endsAt
        ? `${formatLongDate(track.endsAt)}${daysLeft != null ? ` (${daysLeft} days left)` : ""}`
        : "-",
    ],
    [
      "Stipend terms",
      track.termsAcceptedAt
        ? `Accepted ${formatLongDate(track.termsAcceptedAt)} (version ${track.termsVersion ?? "?"})`
        : "Not accepted yet",
    ],
    ["Last daily report", lastReport ? formatLongDate(lastReport) : "None yet"],
  ];

  const summary = [
    { label: "Project progress", value: `${stats.percent}%` },
    { label: "Core tasks done", value: `${stats.coreDone} / ${stats.coreTotal}` },
    { label: "Add-ons done", value: `${stats.addonDone} / ${stats.addonTotal}` },
    { label: "Daily reports", value: `${track.dailyReports.length}` },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/internships" aria-label="Back to Internships">
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        </Button>
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            {track.student.name ?? "Unnamed"}
          </h1>
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
            <CardTitle>Internship</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <dl className="grid grid-cols-[130px_1fr] gap-x-3 gap-y-2 text-sm">
              {facts.map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
            {track.onboardedAt && (
              <DurationControl trackId={track.id} current={track.durationMonths} />
            )}
            <TrackStatusControls trackId={track.id} status={track.status} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Final submission</CardTitle>
          </CardHeader>
          <CardContent>
            {track.project ? (
              <FinalSubmissionReview trackId={track.id} project={track.project} />
            ) : (
              <p className="text-muted-foreground text-sm">Assign a project first.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{track.project ? "Project" : "Assign a project"}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <AssignTemplateButtons
              trackId={track.id}
              templates={PROJECT_TEMPLATES.map((t) => ({
                key: t.key,
                title: t.title,
                taskCount: t.tasks.length,
              }))}
            />
            <AssignProjectForm trackId={track.id} existing={track.project} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks and add-ons</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskManager trackId={track.id} tasks={track.tasks} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nothing issued yet. The offer letter is issued when the intern starts; the completion
              certificate, recommendation and experience letters when the final project is reviewed
              (approved or not eligible) or the internship is marked completed.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {documents.map((doc) => (
                <li key={doc.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-foreground font-medium">
                    {KIND_META[doc.kind].label}{" "}
                    <span className="text-muted-foreground font-mono text-xs">{doc.documentNumber}</span>
                  </span>
                  <a
                    href={`/api/internship-documents/${doc.documentNumber}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-semibold hover:underline"
                  >
                    View PDF
                  </a>
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
    </div>
  );
}
