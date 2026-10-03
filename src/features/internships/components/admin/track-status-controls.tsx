"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { updateInternshipTrackStatus } from "../../actions/admin-actions";

type Status = "ACTIVE" | "COMPLETED" | "PAUSED";

/** Pause / resume / complete an internship. Completing is the admin's call after the final submission is approved. */
function TrackStatusControls({ trackId, status }: { trackId: string; status: Status }) {
  const router = useRouter();
  const [pending, setPending] = React.useState<Status | undefined>();
  const [error, setError] = React.useState<string | undefined>();

  async function change(next: Status) {
    setPending(next);
    setError(undefined);
    const result = await updateInternshipTrackStatus(trackId, next);
    setPending(undefined);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  const options: { to: Status; label: string; variant: "primary" | "outline" }[] =
    status === "ACTIVE"
      ? [
          { to: "COMPLETED", label: "Mark internship completed", variant: "primary" },
          { to: "PAUSED", label: "Pause", variant: "outline" },
        ]
      : status === "PAUSED"
        ? [{ to: "ACTIVE", label: "Resume", variant: "primary" }]
        : [{ to: "ACTIVE", label: "Reopen", variant: "outline" }];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Button
            key={o.to}
            size="sm"
            variant={o.variant}
            loading={pending === o.to}
            disabled={pending != null}
            onClick={() => change(o.to)}
          >
            {o.label}
          </Button>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  );
}

export { TrackStatusControls };
