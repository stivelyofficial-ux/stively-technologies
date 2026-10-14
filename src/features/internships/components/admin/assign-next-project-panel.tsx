"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { assignNextProject } from "../../actions/admin-actions";
import type { TemplateOption } from "./assign-template-button";

/**
 * Shown on an intern's admin page once their current project is reviewed and
 * the internship still has time left. Giving the next project is always the
 * admin's decision for that one intern - nothing here runs automatically. The
 * end date never moves: the new project lives inside the same period, with its
 * own brief and its own task list.
 */
function AssignNextProjectPanel({
  trackId,
  nextNumber,
  daysLeft,
  templates,
}: {
  trackId: string;
  nextNumber: number;
  daysLeft: number | null;
  templates: TemplateOption[];
}) {
  const router = useRouter();
  const [pendingKey, setPendingKey] = React.useState<string | undefined>();
  const [customOpen, setCustomOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [brief, setBrief] = React.useState("");
  const [instructions, setInstructions] = React.useState("");
  const [resourceUrl, setResourceUrl] = React.useState("");
  const [tasks, setTasks] = React.useState("");
  const [isCustomPending, setIsCustomPending] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  async function run(payload: Record<string, unknown>, setBusy: (busy: boolean) => void) {
    setBusy(true);
    setError(undefined);
    const result = await assignNextProject({ trackId, ...payload });
    setBusy(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleTemplate(templateKey: string) {
    await run({ templateKey }, (busy) => setPendingKey(busy ? templateKey : undefined));
  }

  async function handleCustom(event: React.FormEvent) {
    event.preventDefault();
    await run({ title, brief, instructions, resourceUrl, tasks }, setIsCustomPending);
  }

  return (
    <div className="border-primary/30 bg-primary/5 flex flex-col gap-4 rounded-2xl border p-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-foreground text-base font-semibold">
          Project finished - assign project {nextNumber}?
        </h3>
        <p className="text-muted-foreground text-sm">
          The internship end date does not change
          {daysLeft != null ? ` (${daysLeft} days left)` : ""}. The new project gets its own brief
          and task list, and the finished one stays in the history. If this intern is done, mark the
          internship Completed above instead - that issues the certificate and letters.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {templates.map((t) => (
          <Button
            key={t.key}
            type="button"
            size="sm"
            variant="outline"
            loading={pendingKey === t.key}
            onClick={() => handleTemplate(t.key)}
          >
            {t.title} ({t.taskCount} tasks)
          </Button>
        ))}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setCustomOpen((open) => !open)}
        >
          {customOpen ? "Hide custom project" : "Write a custom project"}
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>

      {customOpen && (
        <form onSubmit={handleCustom} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="next-title">Project title</Label>
            <Input
              id="next-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="next-brief">Brief - what they&apos;re building</Label>
            <Textarea
              id="next-brief"
              rows={4}
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="next-tasks">Tasks - one per line</Label>
            <Textarea
              id="next-tasks"
              rows={5}
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              placeholder={"Set up the project\nBuild the layout\nConnect the data"}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="next-instructions">Instructions (optional)</Label>
              <Textarea
                id="next-instructions"
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="next-resource">Resource link (optional)</Label>
              <Input
                id="next-resource"
                type="url"
                value={resourceUrl}
                onChange={(e) => setResourceUrl(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" size="sm" loading={isCustomPending} className="self-start">
            Assign project {nextNumber}
          </Button>
        </form>
      )}

      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  );
}

export { AssignNextProjectPanel };
