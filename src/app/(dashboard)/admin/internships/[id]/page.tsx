import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireRole } from "@/lib/session";
import { getInternshipTrackForAdmin } from "@/features/internships/server/queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AssignProjectForm } from "@/features/internships/components/admin/assign-project-form";
import { TaskManager } from "@/features/internships/components/admin/task-manager";

interface AdminInternshipDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AdminInternshipDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const track = await getInternshipTrackForAdmin(id);
  return { title: track ? `${track.student.name ?? track.student.email} - Internship` : "Internship" };
}

export default async function AdminInternshipDetailPage({ params }: AdminInternshipDetailPageProps) {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const { id } = await params;
  const track = await getInternshipTrackForAdmin(id);
  if (!track) notFound();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/internships" aria-label="Back to Internships">
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        </Button>
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">{track.student.name ?? "Unnamed"}</h1>
          <p className="text-muted-foreground text-sm">
            {track.student.email} · {track.title}
          </p>
        </div>
        <Badge variant={track.status === "COMPLETED" ? "success" : "default"} className="ml-auto">
          {track.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{track.project ? "Project" : "Assign a project"}</CardTitle>
          </CardHeader>
          <CardContent>
            <AssignProjectForm trackId={track.id} existing={track.project} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskManager trackId={track.id} tasks={track.tasks} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily reports</CardTitle>
        </CardHeader>
        <CardContent>
          {track.dailyReports.length === 0 ? (
            <p className="text-muted-foreground text-sm">No reports submitted yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {track.dailyReports.map((report) => (
                <li key={report.id} className="border-border/70 border-b pb-3 last:border-0">
                  <span className="text-foreground text-xs font-medium">
                    {report.reportDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <p className="text-muted-foreground text-sm whitespace-pre-line">{report.content}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
