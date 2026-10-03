"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { assignProjectTemplate } from "../../actions/admin-actions";

export interface TemplateOption {
  key: string;
  title: string;
  taskCount: number;
}

/** One-click assignment of a ready-made project + its dated tasks. Replaces the brief and task list. */
function AssignTemplateButtons({
  trackId,
  templates,
}: {
  trackId: string;
  templates: TemplateOption[];
}) {
  const router = useRouter();
  const [pendingKey, setPendingKey] = React.useState<string | undefined>();
  const [error, setError] = React.useState<string | undefined>();

  async function assign(templateKey: string) {
    setPendingKey(templateKey);
    setError(undefined);
    const result = await assignProjectTemplate({ trackId, templateKey });
    setPendingKey(undefined);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="border-border/70 flex flex-col gap-2 rounded-lg border border-dashed p-3">
      <span className="text-muted-foreground text-xs">
        Or use a ready-made project - replaces the brief and the task list with a dated plan:
      </span>
      <div className="flex flex-wrap gap-2">
        {templates.map((t) => (
          <Button
            key={t.key}
            type="button"
            size="sm"
            variant="outline"
            loading={pendingKey === t.key}
            onClick={() => assign(t.key)}
          >
            {t.title} ({t.taskCount} tasks)
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

export { AssignTemplateButtons };
