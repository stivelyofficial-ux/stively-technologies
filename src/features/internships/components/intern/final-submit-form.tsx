"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitFinalProject } from "../../actions/student-actions";

/** The single final-submission form: live URL + GitHub repo (+ optional note). Asks for a second tap because it can only be sent once (unless a mentor asks for changes). */
function FinalSubmitForm({ isResubmit }: { isResubmit: boolean }) {
  const router = useRouter();
  const [liveUrl, setLiveUrl] = React.useState("");
  const [repoUrl, setRepoUrl] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [confirm, setConfirm] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setIsPending(true);
    setError(undefined);
    const result = await submitFinalProject({ liveUrl, repoUrl, notes });
    setIsPending(false);
    if (!result.success) {
      setError(result.error);
      setConfirm(false);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="final-live-url" className="text-[15px] font-semibold">
          Live project URL
        </Label>
        <Input
          id="final-live-url"
          type="url"
          value={liveUrl}
          onChange={(e) => {
            setLiveUrl(e.target.value);
            setConfirm(false);
          }}
          placeholder="https://your-project.vercel.app"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="final-repo-url" className="text-[15px] font-semibold">
          GitHub repository URL
        </Label>
        <Input
          id="final-repo-url"
          type="url"
          value={repoUrl}
          onChange={(e) => {
            setRepoUrl(e.target.value);
            setConfirm(false);
          }}
          placeholder="https://github.com/you/stivelyshop"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="final-notes" className="text-[15px] font-semibold">
          Notes for reviewer <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          id="final-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Test login, known issues, anything you're proud of..."
          className="min-h-[88px]"
        />
      </div>
      {confirm && (
        <p
          role="status"
          className="text-foreground bg-warning/15 rounded-lg p-3 text-sm text-pretty"
        >
          This is your final submission and it can&apos;t be edited after sending
          {isResubmit ? "" : " unless a mentor asks for changes"}. Tap again to confirm.
        </p>
      )}
      {error && (
        <p role="alert" className="text-destructive text-sm font-medium">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" loading={isPending} className="w-fit">
        {confirm
          ? "Yes, submit my final project"
          : isResubmit
            ? "Resubmit final project"
            : "Submit final project"}
      </Button>
    </form>
  );
}

export { FinalSubmitForm };
