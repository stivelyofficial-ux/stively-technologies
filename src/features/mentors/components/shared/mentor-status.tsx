"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { isMentorActive, MENTOR_HOURS } from "../../lib/active-hours";

/**
 * "Active now" / "Away" next to a mentor's contact button. Purely
 * informational: the WhatsApp button always works, the mentor just replies
 * during 9 AM - 5 PM IST. Recomputed every minute so a page left open flips
 * on time.
 */
function MentorStatus({ className }: { className?: string }) {
  const [active, setActive] = React.useState(() => isMentorActive());
  React.useEffect(() => {
    const id = window.setInterval(() => setActive(isMentorActive()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span
      suppressHydrationWarning
      className={cn("text-muted-foreground inline-flex items-center gap-1.5 text-xs", className)}
    >
      <span
        aria-hidden="true"
        className={cn("size-2 rounded-full", active ? "bg-success" : "bg-muted-foreground/50")}
      />
      <span className={cn("font-semibold", active && "text-success")}>
        {active ? "Active now" : "Not active right now"}
      </span>
      <span>
        · replies {MENTOR_HOURS.label}
        {active ? "" : " - you can still message"}
      </span>
    </span>
  );
}

export { MentorStatus };
