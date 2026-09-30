"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { submitInternshipTask } from "../../actions/student-actions";

function TaskSubmitButton({ taskId, isRetry }: { taskId: string; isRetry: boolean }) {
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  async function handleSubmit() {
    setIsPending(true);
    setError(undefined);
    const result = await submitInternshipTask(taskId);
    setIsPending(false);
    if (!result.success) setError(result.error);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button size="sm" variant="outline" onClick={handleSubmit} disabled={isPending}>
        {isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Check className="size-3.5" aria-hidden="true" />}
        {isRetry ? "Resubmit" : "Mark submitted"}
      </Button>
      {error && <span className="text-destructive text-xs">{error}</span>}
    </div>
  );
}

export { TaskSubmitButton };
