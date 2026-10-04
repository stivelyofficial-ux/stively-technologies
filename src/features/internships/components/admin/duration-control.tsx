"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { INTERNSHIP_DURATIONS } from "../../lib/durations";
import { setInternshipDuration } from "../../actions/admin-actions";

/** Correct a wrong duration choice - keeps the start date, recomputes the end date everywhere (portal, ID card, verification page). */
function DurationControl({ trackId, current }: { trackId: string; current: number | null }) {
  const router = useRouter();
  const [value, setValue] = React.useState<number>(current ?? 1);
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState<{ ok: boolean; text: string } | undefined>();

  async function save() {
    setPending(true);
    setMessage(undefined);
    const result = await setInternshipDuration({ trackId, durationMonths: value });
    setPending(false);
    if (!result.success) {
      setMessage({ ok: false, text: result.error });
      return;
    }
    setMessage({ ok: true, text: "Duration updated." });
    router.refresh();
  }

  return (
    <div className="border-border/70 flex flex-col gap-2 rounded-lg border border-dashed p-3">
      <span className="text-muted-foreground text-xs">
        Wrong duration chosen? Change it here - the start date stays, the end date is recalculated,
        and the intern gets a confirmation email.
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <div
          className="bg-muted flex gap-1 rounded-full p-1"
          role="radiogroup"
          aria-label="Internship duration"
        >
          {INTERNSHIP_DURATIONS.map((d) => (
            <button
              key={d.months}
              type="button"
              role="radio"
              aria-checked={value === d.months}
              onClick={() => setValue(d.months)}
              className={
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors " +
                (value === d.months ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")
              }
            >
              {d.label}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={save} loading={pending} disabled={pending || value === current}>
          Save duration
        </Button>
      </div>
      {message && (
        <p
          role={message.ok ? "status" : "alert"}
          className={"text-xs " + (message.ok ? "text-success" : "text-destructive")}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}

export { DurationControl };
