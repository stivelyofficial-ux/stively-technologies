"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ExternalLink, GitBranch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createInternshipTask, deleteInternshipTask, reviewInternshipTask } from "../../actions/admin-actions";
import type { InternshipTask } from "@prisma/client";

const STATUS_VARIANT: Record<string, "success" | "default" | "warning" | "secondary"> = {
  PENDING: "secondary",
  SUBMITTED: "default",
  APPROVED: "success",
  CHANGES_REQUESTED: "warning",
};

function AddTaskForm({ trackId }: { trackId: string }) {
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
    <form onSubmit={handleSubmit} className="border-border/70 flex flex-col gap-2 rounded-lg border border-dashed p-3">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" required />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="min-h-[60px]"
      />
      <Button type="submit" size="sm" loading={isPending} className="w-fit">
        Add task
      </Button>
    </form>
  );
}

function ReviewButtons({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);
  const [feedback, setFeedback] = React.useState("");
  const [showFeedback, setShowFeedback] = React.useState(false);

  async function act(status: "APPROVED" | "CHANGES_REQUESTED") {
    setIsPending(true);
    await reviewInternshipTask({ taskId, status, feedback });
    setIsPending(false);
    setShowFeedback(false);
    setFeedback("");
    router.refresh();
  }

  if (showFeedback) {
    return (
      <div className="flex flex-col gap-2">
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="What needs to change?"
          className="min-h-[60px] text-sm"
        />
        <div className="flex gap-2">
          <Button size="sm" variant="outline" loading={isPending} onClick={() => act("CHANGES_REQUESTED")}>
            Send back
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowFeedback(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" loading={isPending} onClick={() => act("APPROVED")}>
        Approve
      </Button>
      <Button size="sm" variant="outline" onClick={() => setShowFeedback(true)}>
        Request changes
      </Button>
    </div>
  );
}

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
              <span className="text-foreground text-sm font-medium">{task.title}</span>
              {task.description && <span className="text-muted-foreground text-sm">{task.description}</span>}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant={STATUS_VARIANT[task.status]}>{task.status}</Badge>
              {task.status === "PENDING" && (
                <Button size="icon" variant="ghost" className="size-7" onClick={() => handleDelete(task.id)} aria-label="Delete task">
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
          {(task.liveUrl || task.repoUrl) && (
            <div className="bg-muted/50 flex flex-wrap gap-x-4 gap-y-1 rounded-md p-2 text-xs">
              {task.liveUrl && (
                <Link
                  href={task.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary inline-flex items-center gap-1 font-medium hover:underline"
                >
                  <ExternalLink className="size-3" aria-hidden="true" />
                  Live URL
                </Link>
              )}
              {task.repoUrl && (
                <Link
                  href={task.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary inline-flex items-center gap-1 font-medium hover:underline"
                >
                  <GitBranch className="size-3" aria-hidden="true" />
                  GitHub repo
                </Link>
              )}
            </div>
          )}
          {task.feedback && <p className="text-warning bg-warning/10 rounded-md p-2 text-xs">{task.feedback}</p>}
          {task.status === "SUBMITTED" && <ReviewButtons taskId={task.id} />}
        </div>
      ))}
      <AddTaskForm trackId={trackId} />
    </div>
  );
}

export { TaskManager };
