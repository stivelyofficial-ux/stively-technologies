"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitInternshipTask } from "../../actions/student-actions";

/**
 * Expands into the two-field submission form (Live URL + GitHub repo) that
 * every real project brief this program sends already requires as the
 * final deliverable (AD-036) - not a bare one-click "mark submitted" that
 * leaves the admin chasing a student for links separately.
 */
function TaskSubmitButton({ taskId, isRetry }: { taskId: string; isRetry: boolean }) {
  const [expanded, setExpanded] = React.useState(false);
  const [liveUrl, setLiveUrl] = React.useState("");
  const [repoUrl, setRepoUrl] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsPending(true);
    setError(undefined);
    const result = await submitInternshipTask({ taskId, liveUrl, repoUrl });
    setIsPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setExpanded(false);
  }

  if (!expanded) {
    return (
      <Button size="sm" variant="outline" onClick={() => setExpanded(true)}>
        <Check className="size-3.5" aria-hidden="true" />
        {isRetry ? "Resubmit" : "Submit task"}
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border-border/70 flex w-full flex-col gap-2.5 rounded-lg border p-3">
      <div className="flex flex-col gap-1">
        <Label htmlFor={`live-url-${taskId}`} className="text-xs">
          Live URL
        </Label>
        <Input
          id={`live-url-${taskId}`}
          type="url"
          value={liveUrl}
          onChange={(e) => setLiveUrl(e.target.value)}
          placeholder="https://your-project.vercel.app"
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`repo-url-${taskId}`} className="text-xs">
          GitHub repository URL
        </Label>
        <Input
          id={`repo-url-${taskId}`}
          type="url"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/you/project"
          required
        />
      </div>
      {error && (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" size="sm" variant="ghost" onClick={() => setExpanded(false)} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Check className="size-3.5" aria-hidden="true" />}
          {isRetry ? "Resubmit" : "Submit"}
        </Button>
      </div>
    </form>
  );
}

export { TaskSubmitButton };
