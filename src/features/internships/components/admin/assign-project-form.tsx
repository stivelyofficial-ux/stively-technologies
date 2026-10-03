"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { assignInternshipProject } from "../../actions/admin-actions";
import type { InternshipProject } from "@prisma/client";

function AssignProjectForm({
  trackId,
  existing,
}: {
  trackId: string;
  existing: InternshipProject | null;
}) {
  const router = useRouter();
  const [title, setTitle] = React.useState(existing?.title ?? "");
  const [brief, setBrief] = React.useState(existing?.brief ?? "");
  const [instructions, setInstructions] = React.useState(existing?.instructions ?? "");
  const [resourceUrl, setResourceUrl] = React.useState(existing?.resourceUrl ?? "");
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsPending(true);
    setError(undefined);
    const result = await assignInternshipProject({
      trackId,
      title,
      brief,
      instructions,
      resourceUrl,
    });
    setIsPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="project-title">Project title</Label>
        <Input
          id="project-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="project-brief">Brief - what they&apos;re building</Label>
        <Textarea
          id="project-brief"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          required
          className="min-h-[100px]"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="project-instructions">Instructions (optional)</Label>
        <Textarea
          id="project-instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="min-h-[80px]"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="project-resource">Resource URL (optional - Figma, repo, etc.)</Label>
        <Input
          id="project-resource"
          value={resourceUrl}
          onChange={(e) => setResourceUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Button type="submit" loading={isPending} className="w-fit">
        {existing ? "Update project" : "Assign project"}
      </Button>
    </form>
  );
}

export { AssignProjectForm };
