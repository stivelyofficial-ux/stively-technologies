import { Badge } from "@/components/ui/badge";
import { formatLongDate } from "../../lib/stats";

export interface HistoryProject {
  id: string;
  sequence: number;
  title: string;
  finalStatus: "PENDING" | "SUBMITTED" | "APPROVED" | "CHANGES_REQUESTED" | "NOT_ELIGIBLE" | null;
  finalSubmittedAt: Date | null;
  finalReviewedAt: Date | null;
  finalLiveUrl: string | null;
  finalRepoUrl: string | null;
  tasks?: { progress: string; isAddon: boolean }[];
}

const STATUS: Record<
  string,
  { label: string; variant: "success" | "warning" | "destructive" | "secondary" }
> = {
  APPROVED: { label: "Approved", variant: "success" },
  SUBMITTED: { label: "Under review", variant: "secondary" },
  CHANGES_REQUESTED: { label: "Changes requested", variant: "warning" },
  NOT_ELIGIBLE: { label: "Not eligible", variant: "destructive" },
};

/** Every project in an internship, oldest first. The last one is the current project. Read-only; shared by the admin, mentor and intern views. */
function ProjectHistory({
  projects,
  showLinks = true,
}: {
  projects: HistoryProject[];
  showLinks?: boolean;
}) {
  if (projects.length === 0) return null;
  return (
    <ol className="flex flex-col gap-3">
      {projects.map((project, index) => {
        const status = project.finalStatus ? STATUS[project.finalStatus] : null;
        const core = project.tasks?.filter((t) => !t.isAddon) ?? [];
        const done = core.filter((t) => t.progress === "DONE").length;
        const isCurrent = index === projects.length - 1;
        return (
          <li
            key={project.id}
            className="border-border/70 flex flex-col gap-1.5 rounded-xl border p-3.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-foreground text-sm font-semibold">
                Project {project.sequence}: {project.title}
                {isCurrent && projects.length > 1 && (
                  <span className="text-muted-foreground ml-2 text-xs font-normal">current</span>
                )}
              </span>
              {status ? (
                <Badge variant={status.variant}>{status.label}</Badge>
              ) : (
                <Badge variant="secondary">In progress</Badge>
              )}
            </div>
            <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {core.length > 0 && (
                <span>
                  {done}/{core.length} tasks
                </span>
              )}
              {project.finalSubmittedAt && (
                <span>Submitted {formatLongDate(project.finalSubmittedAt)}</span>
              )}
              {project.finalReviewedAt && (
                <span>Reviewed {formatLongDate(project.finalReviewedAt)}</span>
              )}
              {showLinks && project.finalLiveUrl && (
                <a
                  href={project.finalLiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Live site
                </a>
              )}
              {showLinks && project.finalRepoUrl && (
                <a
                  href={project.finalRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Repository
                </a>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export { ProjectHistory };
