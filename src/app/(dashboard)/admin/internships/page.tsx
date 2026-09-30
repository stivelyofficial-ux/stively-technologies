import type { Metadata } from "next";
import Link from "next/link";
import { Rocket } from "lucide-react";

import { requireRole } from "@/lib/session";
import { getInternshipTracksForAdmin } from "@/features/internships/server/queries";
import { EmptyState } from "@/components/sections/empty-state";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Internships" };

export default async function AdminInternshipsPage() {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const tracks = await getInternshipTracksForAdmin();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">Internships</h1>
        <p className="text-muted-foreground text-sm">
          A track is created automatically the moment a student finishes a course - assign a project and tasks here.
        </p>
      </div>

      {tracks.length === 0 ? (
        <EmptyState
          icon={Rocket}
          title="No internship tracks yet"
          description="These appear automatically once a student completes a training program."
        />
      ) : (
        <div className="border-border overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-left text-xs">
              <tr>
                <th className="px-4 py-2.5 font-medium">Student</th>
                <th className="px-4 py-2.5 font-medium">Track</th>
                <th className="px-4 py-2.5 font-medium">Project</th>
                <th className="px-4 py-2.5 font-medium">Tasks</th>
                <th className="px-4 py-2.5 font-medium">Reports</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {tracks.map((track) => (
                <tr key={track.id} className="hover:bg-accent/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/internships/${track.id}`} className="text-primary hover:underline">
                      {track.student.name ?? "Unnamed"}
                    </Link>
                    <div className="text-muted-foreground text-xs">{track.student.email}</div>
                  </td>
                  <td className="text-foreground px-4 py-3">{track.title}</td>
                  <td className="px-4 py-3">
                    {track.project ? track.project.title : <span className="text-muted-foreground">Not assigned</span>}
                  </td>
                  <td className="text-muted-foreground px-4 py-3">{track._count.tasks}</td>
                  <td className="text-muted-foreground px-4 py-3">{track._count.dailyReports}</td>
                  <td className="px-4 py-3">
                    <Badge variant={track.status === "COMPLETED" ? "success" : track.status === "PAUSED" ? "secondary" : "default"}>
                      {track.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
