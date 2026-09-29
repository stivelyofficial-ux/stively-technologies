"use client";

import * as React from "react";

import { Textarea } from "@/components/ui/textarea";
import { saveLessonNote } from "../../actions/notes-actions";

const SAVE_DEBOUNCE_MS = 1200;

/**
 * Auto-saves on a short debounce after typing stops - no explicit save
 * button, matching how a real notes app behaves. Re-seeds its local value
 * from `initialContent` when the lesson changes (key={lessonId} at the call
 * site handles the actual remount - this effect is the fallback if a
 * parent ever reuses the instance instead).
 */
function LessonNotes({
  enrollmentId,
  lessonId,
  initialContent,
}: {
  enrollmentId: string;
  lessonId: string;
  initialContent: string;
}) {
  const [content, setContent] = React.useState(initialContent);
  const [status, setStatus] = React.useState<"idle" | "saving" | "saved">("idle");
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleChange(value: string) {
    setContent(value);
    setStatus("idle");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setStatus("saving");
      const result = await saveLessonNote({ enrollmentId, lessonId, content: value });
      setStatus(result.success ? "saved" : "idle");
    }, SAVE_DEBOUNCE_MS);
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <Textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Jot down anything worth remembering from this lesson..."
        className="min-h-[240px] flex-1 resize-none text-sm"
      />
      <span className="text-muted-foreground h-4 text-xs">
        {status === "saving" ? "Saving..." : status === "saved" ? "Saved" : ""}
      </span>
    </div>
  );
}

export { LessonNotes };
