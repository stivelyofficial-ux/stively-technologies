import { ExternalLink } from "lucide-react";

import type { PublicProjectWork } from "../../server/public-projects";

/** "Project work delivered" block for the public verification pages. Renders nothing when there is no approved project. */
function PublicProjectWorkList({ projects }: { projects: PublicProjectWork[] }) {
  if (projects.length === 0) return null;
  return (
    <div className="border-border/70 flex w-full flex-col gap-3 border-t pt-5 text-left">
      <h2 className="text-foreground text-sm font-semibold">Project work delivered</h2>
      <ul className="flex flex-col gap-3">
        {projects.map((project) => (
          <li key={project.title} className="bg-muted/40 flex flex-col gap-1 rounded-xl p-3.5">
            <span className="text-foreground text-sm font-semibold">{project.title}</span>
            {(project.client || project.role) && (
              <span className="text-muted-foreground text-xs">
                {[project.client, project.role].filter(Boolean).join(" · ")}
              </span>
            )}
            {project.stack.length > 0 && (
              <span className="text-muted-foreground text-xs">{project.stack.join(", ")}</span>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary mt-1 inline-flex items-center gap-1 text-xs font-medium hover:underline"
              >
                View live project
                <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export { PublicProjectWorkList };
