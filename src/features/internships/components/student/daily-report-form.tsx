"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitDailyReport } from "../../actions/student-actions";

/** Explicit submit, not auto-save like the lesson-notes editor - a daily report is a deliberate "here's today's update" action a student should consciously send, not a draft that silently saves as they type. */
function DailyReportForm({ trackId, todaysContent }: { trackId: string; todaysContent: string }) {
  const [content, setContent] = React.useState(todaysContent);
  const [isPending, setIsPending] = React.useState(false);
  const [status, setStatus] = React.useState<"idle" | "error" | "saved">("idle");
  const [error, setError] = React.useState<string | undefined>();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsPending(true);
    setStatus("idle");
    setError(undefined);
    const result = await submitDailyReport({ trackId, content });
    setIsPending(false);
    if (result.success) {
      setStatus("saved");
    } else {
      setStatus("error");
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setStatus("idle");
        }}
        placeholder="What did you work on today? What's blocking you, if anything?"
        className="min-h-[100px] resize-none text-sm"
        required
      />
      <div className="flex items-center justify-between">
        <span className="text-xs">
          {status === "saved" && <span className="text-success">Saved for today</span>}
          {status === "error" && <span className="text-destructive">{error}</span>}
        </span>
        <Button type="submit" size="sm" loading={isPending}>
          {todaysContent ? "Update today's report" : "Submit today's report"}
        </Button>
      </div>
    </form>
  );
}

export { DailyReportForm };
