"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { isDatabaseConnectivityError } from "@/lib/is-database-error";
import { MAINTENANCE_HEADLINE, MAINTENANCE_BODY } from "@/lib/maintenance";

/** Scoped to the course player - a hiccup on one lesson keeps the student inside the player with a retry, not on a blank generic error page. */
export default function PlayerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isDb = isDatabaseConnectivityError(error);
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-foreground text-xl font-semibold tracking-tight">
        {isDb ? MAINTENANCE_HEADLINE : "Something went wrong"}
      </h1>
      <p className="text-muted-foreground max-w-md text-sm text-pretty">
        {isDb
          ? MAINTENANCE_BODY
          : "That's on us, not you. Try again, and if it keeps happening, reach out at team@stively.com."}
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/student/learning">Back to My Learning</Link>
        </Button>
      </div>
    </div>
  );
}
