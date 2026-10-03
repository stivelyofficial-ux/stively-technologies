"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronUp, Circle, CircleDot } from "lucide-react";

import { cn } from "@/lib/utils";
import { setTaskProgress } from "../../actions/student-actions";

type Progress = "TODO" | "IN_PROGRESS" | "DONE";

export interface BoardTask {
  id: string;
  title: string;
  description: string | null;
  isAddon: boolean;
  progress: Progress;
}

const META: Record<Progress, { label: string; chip: string }> = {
  TODO: { label: "To do", chip: "bg-muted text-muted-foreground" },
  IN_PROGRESS: { label: "In progress", chip: "bg-primary/10 text-primary" },
  DONE: { label: "Done", chip: "bg-success/10 text-success" },
};

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "TODO", label: "To do" },
  { key: "IN_PROGRESS", label: "In progress" },
  { key: "DONE", label: "Done" },
] as const;

function StatusIcon({ progress }: { progress: Progress }) {
  if (progress === "DONE") return <Check className="size-4" aria-hidden="true" />;
  if (progress === "IN_PROGRESS")
    return <CircleDot className="text-primary size-6" aria-hidden="true" />;
  return <Circle className="text-muted-foreground size-6" aria-hidden="true" />;
}

/**
 * The intern's whole task list: core project tasks, then optional add-on
 * features. Status is self-managed and saved immediately (optimistic) -
 * no deadlines, no per-task review. Clicking the circle toggles done.
 */
function TaskBoard({ tasks }: { tasks: BoardTask[] }) {
  const router = useRouter();
  const [state, setState] = React.useState<Record<string, Progress>>(() =>
    Object.fromEntries(tasks.map((t) => [t.id, t.progress]))
  );
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]["key"]>("ALL");
  const [open, setOpen] = React.useState<string | null>(tasks.find((t) => !t.isAddon)?.id ?? null);
  const [error, setError] = React.useState<string | undefined>();

  const progressOf = (t: BoardTask) => state[t.id] ?? t.progress;
  const core = tasks.filter((t) => !t.isAddon);
  const coreDone = core.filter((t) => progressOf(t) === "DONE").length;
  const percent = core.length ? Math.round((coreDone / core.length) * 100) : 0;

  async function update(task: BoardTask, next: Progress) {
    const previous = progressOf(task);
    if (previous === next) return;
    setError(undefined);
    setState((s) => ({ ...s, [task.id]: next }));
    const result = await setTaskProgress({ taskId: task.id, progress: next });
    if (!result.success) {
      setState((s) => ({ ...s, [task.id]: previous }));
      setError(result.error);
      return;
    }
    router.refresh();
  }

  const counts = {
    ALL: tasks.length,
    TODO: tasks.filter((t) => progressOf(t) === "TODO").length,
    IN_PROGRESS: tasks.filter((t) => progressOf(t) === "IN_PROGRESS").length,
    DONE: tasks.filter((t) => progressOf(t) === "DONE").length,
  };

  const visible = (list: BoardTask[]) =>
    list.filter((t) => filter === "ALL" || progressOf(t) === filter);
  const groups = [
    { title: "Core project", hint: `${coreDone}/${core.length} done`, items: visible(core) },
    {
      title: "Add-on features",
      hint: "Optional extras on top of your project",
      items: visible(tasks.filter((t) => t.isAddon)),
    },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground text-3xl font-bold tracking-tight">Project tasks</h1>
          <p className="text-muted-foreground">
            {coreDone} of {core.length} core tasks done · tick them off whenever you finish - there
            are no daily deadlines.
          </p>
        </div>
        <div
          className="bg-muted border-border flex gap-1.5 rounded-full border p-1"
          role="tablist"
          aria-label="Filter tasks"
        >
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors",
                filter === f.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {f.label} <span className="opacity-70">{counts[f.key]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-muted h-2 overflow-hidden rounded-full" aria-hidden="true">
        <div
          className="bg-primary h-full rounded-full transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-8">
        {groups.length === 0 && (
          <p className="text-muted-foreground py-10 text-center text-sm">No tasks in this view.</p>
        )}
        {groups.map((group) => (
          <section key={group.title} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-foreground text-lg font-bold">{group.title}</h2>
              <span className="text-muted-foreground text-sm">{group.hint}</span>
            </div>
            {group.items.map((task) => {
              const progress = progressOf(task);
              const isOpen = open === task.id;
              return (
                <div
                  key={task.id}
                  className="bg-card border-border overflow-hidden rounded-2xl border"
                >
                  <div className="flex items-center gap-3.5 px-4 py-4">
                    <button
                      type="button"
                      onClick={() => update(task, progress === "DONE" ? "TODO" : "DONE")}
                      aria-label={progress === "DONE" ? "Mark as not done" : "Mark as done"}
                      className="flex shrink-0 items-center justify-center"
                    >
                      {progress === "DONE" ? (
                        <span className="bg-success text-success-foreground flex size-6 items-center justify-center rounded-full">
                          <Check className="size-4" aria-hidden="true" />
                        </span>
                      ) : (
                        <StatusIcon progress={progress} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : task.id)}
                      className="flex min-w-0 flex-1 flex-col gap-0.5 text-left"
                      aria-expanded={isOpen}
                    >
                      <span
                        className={cn(
                          "text-base font-semibold",
                          progress === "DONE" && "text-muted-foreground line-through"
                        )}
                      >
                        {task.title}
                      </span>
                      {task.isAddon && (
                        <span className="text-primary text-xs font-semibold">Add-on feature</span>
                      )}
                    </button>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap",
                        META[progress].chip
                      )}
                    >
                      {META[progress].label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : task.id)}
                      className="text-muted-foreground p-1"
                      aria-label={isOpen ? "Collapse task" : "Expand task"}
                    >
                      {isOpen ? (
                        <ChevronUp className="size-4" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="size-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {isOpen && (
                    <div className="flex flex-col gap-3.5 px-4 pb-4 pl-[58px]">
                      {task.description && (
                        <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
                          {task.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {(["TODO", "IN_PROGRESS", "DONE"] as const).map((key) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => update(task, key)}
                            className={cn(
                              "rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors",
                              progress === key
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-border text-foreground hover:border-primary/40"
                            )}
                          >
                            {META[key].label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}

export { TaskBoard };
