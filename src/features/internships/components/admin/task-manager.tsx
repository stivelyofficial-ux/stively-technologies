"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createInternshipTask, deleteInternshipTask } from "../../actions/admin-actions";
import type { InternshipTask } from "@prisma/client";

const PROGRESS_LABEL = { TODO: "To do", IN_PROGRESS: "In progress", DONE: "Done" } as const;
const PROGRESS_VARIANT = { TODO: "secondary", IN_PROGRESS: "default", DONE: "success" } as const;

function AddAddonForm({ trackId }: { trackId: string }) {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsPending(true);
    await createInternshipTask({ trackId, title, description });
    setIsPending(false);
    setTitle("");
    setDescription("");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-border/70 flex flex-col gap-2 rounded-lg border border-dashed p-3"
    >
      <span className="text-muted-foreground text-xs">
        Add-on feature - an optional extra on top of the assigned project. The intern sees it in
        their task list and ticks it off at their own pace.
      </span>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add-on feature title, e.g. Wishlist"
        required
      />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What should it do? (optional)"
        className="min-h-[60px]"
      />
      <Button type="submit" size="sm" loading={isPending} className="w-fit">
        Add add-on feature
      </Button>
    </form>
  );
}

/** Admin view of the roadmap: the intern's own progress is read-only here; admins only attach add-ons or remove a task nobody has started. */
function TaskManager({ trackId, tasks }: { trackId: string; tasks: InternshipTask[] }) {
  const router = useRouter();

  async function handleDelete(taskId: string) {
    await deleteInternshipTask(taskId);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <div key={task.id} className="border-border/70 flex flex-col gap-2 rounded-lg border p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-foreground text-sm font-medium">
                {task.title}
                {task.isAddon && (
                  <span className="text-primary ml-2 text-[11px] font-semibold">ADD-ON</span>
                )}
              </span>
              {task.description && (
                <span className="text-muted-foreground text-sm">{task.description}</span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant={PROGRESS_VARIANT[task.progress]}>
                {PROGRESS_LABEL[task.progress]}
              </Badge>
              {task.progress === "TODO" && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7"
                  onClick={() => handleDelete(task.id)}
                  aria-label="Delete task"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
      <AddAddonForm trackId={trackId} />
    </div>
  );
}

export { TaskManager };
