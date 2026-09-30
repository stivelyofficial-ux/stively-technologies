"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { isDatabaseConnectivityError } from "@/lib/is-database-error";
import { MAINTENANCE_HEADLINE, MAINTENANCE_BODY } from "@/lib/maintenance";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Swap for real error monitoring (e.g. Sentry) when that's added.
    console.error(error);
  }, [error]);

  // 2026-09-30: our Neon plan's monthly compute-hour allowance runs out
  // before the database is genuinely unreachable - real, current, and
  // worth a specific message rather than the generic one below, so a
  // visitor hitting this mid-outage gets an honest "we know, here's when"
  // instead of "something went wrong, try again" (which just looks broken).
  // Copy/ETA both read from src/lib/maintenance.ts's one real deadline.
  if (isDatabaseConnectivityError(error)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{MAINTENANCE_HEADLINE}</h1>
        <p className="text-muted-foreground max-w-md">{MAINTENANCE_BODY}</p>
        <Button onClick={reset}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="text-muted-foreground max-w-md">
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
