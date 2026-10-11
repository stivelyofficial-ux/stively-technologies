import type { InternshipTask } from "@prisma/client";

import { formatIstDate, istDayDiff } from "@/lib/ist";

/** Progress is measured on the core project tasks; add-on features are a bonus and counted separately. */
export function computeTaskStats(tasks: Pick<InternshipTask, "progress" | "isAddon">[]) {
  const core = tasks.filter((t) => !t.isAddon);
  const addons = tasks.filter((t) => t.isAddon);
  const coreDone = core.filter((t) => t.progress === "DONE").length;
  const coreInProgress = core.filter((t) => t.progress === "IN_PROGRESS").length;
  return {
    coreTotal: core.length,
    coreDone,
    coreInProgress,
    addonTotal: addons.length,
    addonDone: addons.filter((t) => t.progress === "DONE").length,
    percent: core.length ? Math.round((coreDone / core.length) * 100) : 0,
  };
}

/** Whole India calendar days from today to the end date (0 once it has passed). */
export function daysUntil(end: Date | null, now: Date = new Date()): number | null {
  if (!end) return null;
  return Math.max(0, istDayDiff(now, end));
}

/** "11 Oct 2026", always as the India calendar date regardless of the server's time zone. */
export function formatLongDate(date: Date): string {
  return formatIstDate(date);
}

export interface ProjectDetails {
  client?: string;
  role?: string;
  reportsTo?: string;
  stipend?: string;
  stack?: string[];
}

export function readProjectDetails(value: unknown): ProjectDetails {
  if (!value || typeof value !== "object") return {};
  return value as ProjectDetails;
}
