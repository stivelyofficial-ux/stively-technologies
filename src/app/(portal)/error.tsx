"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { isDatabaseConnectivityError } from "@/lib/is-database-error";
import { MAINTENANCE_HEADLINE, MAINTENANCE_BODY } from "@/lib/maintenance";

/**
 * Scoped to (portal) (Student/Mentor/Client/Company/Intern/Team) - same
 * reasoning as (marketing)/error.tsx: without this, a transient DB hiccup
 * on any one page (a lesson failing to load mid-video, a brief Neon
 * connection blip) fell through to the ROOT src/app/error.tsx, replacing
 * the entire dashboard shell (sidebar, nav, everything) with a generic
 * "Something went wrong" - a student watching a lecture lost their whole
 * nav just to retry one page. This keeps the shell intact and gives a real,
 * specific message for a DB blip instead of the generic one.
 */
export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  if (isDatabaseConnectivityError(error)) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-foreground text-xl font-semibold tracking-tight">{MAINTENANCE_HEADLINE}</h1>
        <p className="text-muted-foreground max-w-md text-pretty text-sm">{MAINTENANCE_BODY}</p>
        <Button onClick={reset}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-foreground text-xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="text-muted-foreground max-w-md text-sm">
        That&apos;s on us, not you. Try again, and if it keeps happening, reach out at{" "}
        <a href="mailto:team@stively.com" className="text-primary underline underline-offset-4">
          team@stively.com
        </a>
        .
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
