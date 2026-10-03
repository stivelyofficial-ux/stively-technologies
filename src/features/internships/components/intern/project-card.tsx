import Link from "next/link";
import { Briefcase, FileText, ExternalLink } from "lucide-react";

import type { InternshipProject } from "@prisma/client";
import { readProjectDetails } from "../../lib/stats";

/** The assigned project: facts, short description, stack, and the full brief behind a native disclosure (no JS). */
function ProjectCard({ project }: { project: InternshipProject }) {
  const details = readProjectDetails(project.details);
  const rows: [string, string | undefined][] = [
    ["Client", details.client],
    ["Role", details.role],
    ["Reports to", details.reportsTo],
    ["Stipend", details.stipend],
  ];

  return (
    <div className="bg-card border-border flex flex-col gap-5 rounded-2xl border p-7">
      <div className="flex items-center gap-2.5">
        <Briefcase className="text-primary size-6" aria-hidden="true" />
        <h2 className="text-foreground text-xl font-bold">{project.title}</h2>
      </div>

      {rows.some(([, v]) => v) && (
        <dl className="grid grid-cols-[110px_1fr] gap-x-4 gap-y-2.5 text-sm">
          {rows
            .filter(([, v]) => v)
            .map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-foreground font-medium">{value}</dd>
              </div>
            ))}
        </dl>
      )}

      <p className="text-muted-foreground text-[15px] leading-relaxed text-pretty whitespace-pre-line">
        {project.brief}
      </p>

      {details.stack && details.stack.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {details.stack.map((item) => (
            <li
              key={item}
              className="bg-muted border-border rounded-full border px-3 py-1.5 text-[13px] font-semibold"
            >
              {item}
            </li>
          ))}
        </ul>
      )}

      {project.resourceUrl && (
        <Link
          href={project.resourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="border-border text-foreground hover:border-primary hover:text-primary inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
        >
          <ExternalLink className="size-4" aria-hidden="true" />
          Project resources
        </Link>
      )}

      {project.instructions && (
        <details className="group border-border rounded-xl border">
          <summary className="text-foreground flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold">
            <FileText className="text-primary size-[18px]" aria-hidden="true" />
            Full project brief
            <span className="text-primary ml-auto text-xs group-open:hidden">Read</span>
            <span className="text-primary ml-auto hidden text-xs group-open:inline">Hide</span>
          </summary>
          <p className="text-muted-foreground border-t px-4 py-4 text-sm leading-relaxed whitespace-pre-line">
            {project.instructions}
          </p>
        </details>
      )}
    </div>
  );
}

function ProjectPending() {
  return (
    <div className="bg-card border-border flex flex-col items-center gap-2 rounded-2xl border px-6 py-14 text-center">
      <p className="text-foreground font-semibold">Your project is being assigned</p>
      <p className="text-muted-foreground max-w-sm text-sm">
        Our team assigns your project personally - it will appear here, with its task list, as soon
        as it&apos;s ready.
      </p>
    </div>
  );
}

export { ProjectCard, ProjectPending };
