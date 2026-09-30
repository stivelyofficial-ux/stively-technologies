"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { isDatabaseConnectivityError } from "@/lib/is-database-error";
import { MAINTENANCE_HEADLINE, MAINTENANCE_BODY } from "@/lib/maintenance";

/**
 * Scoped to (marketing) specifically - a route segment's error.tsx catches
 * throws from ITS children while the segment's own layout.tsx (Navbar +
 * Footer, in this case) keeps rendering normally around it. Without this,
 * one DB-dependent page throwing (the /offerings catalog, a course detail
 * page, /work) fell through to the ROOT src/app/error.tsx instead, which
 * wipes out Navbar/Footer too - a visitor on a page that genuinely needs
 * live data couldn't even navigate back to the (working) homepage. This
 * keeps the rest of the site reachable: only the one page that actually
 * needed the database shows the maintenance card, everything else -
 * including the nav to get there - stays live.
 */
export default function MarketingError({
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
      <Container className="flex min-h-[50vh] flex-col items-center justify-center gap-4 py-16 text-center">
        <h1 className="text-foreground font-display text-2xl font-semibold tracking-tight">{MAINTENANCE_HEADLINE}</h1>
        <p className="text-muted-foreground max-w-md text-pretty">{MAINTENANCE_BODY}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to homepage</Link>
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="flex min-h-[50vh] flex-col items-center justify-center gap-4 py-16 text-center">
      <h1 className="text-foreground font-display text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="text-muted-foreground max-w-md">
        That&apos;s on us, not you. Try again, and if it keeps happening, reach out at{" "}
        <a href="mailto:team@stively.com" className="text-primary underline underline-offset-4">
          team@stively.com
        </a>
        .
      </p>
      <Button onClick={reset}>Try again</Button>
    </Container>
  );
}
