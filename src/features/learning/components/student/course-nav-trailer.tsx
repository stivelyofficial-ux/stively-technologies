import Link from "next/link";
import { GraduationCap, Lock } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The sidebar's one entry after every module - not a fabricated "final
 * assessment/capstone" row (no Module-scoped assessment or capstone model
 * exists yet), just the one real thing there is to link to once a course
 * is finished: the actual /student/internships page. That page is
 * honestly "coming soon" (see its own comment - internship management is
 * explicitly future work), so gating this link behind real completion and
 * calling it "Intern portal" doesn't promise anything the destination
 * doesn't already say itself.
 */
function CourseNavTrailer({ unlocked }: { unlocked: boolean }) {
  return (
    <div className="border-border/70 mt-2 border-t px-2 pt-2">
      <span className="text-muted-foreground flex items-center gap-1.5 px-3 pt-1 pb-1.5 font-mono text-[11px] tracking-widest uppercase">
        <GraduationCap className="size-3.5" aria-hidden="true" />
        After all modules
      </span>
      {unlocked ? (
        <Link
          href="/student/internships"
          className="text-foreground hover:bg-accent flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150"
        >
          Intern portal
        </Link>
      ) : (
        <span
          aria-disabled="true"
          title="Complete every module to unlock this."
          className={cn("text-muted-foreground/70 flex items-center gap-2.5 rounded-md px-3 py-2 text-sm")}
        >
          <Lock className="size-4 shrink-0" aria-hidden="true" />
          Intern portal
        </span>
      )}
    </div>
  );
}

export { CourseNavTrailer };
