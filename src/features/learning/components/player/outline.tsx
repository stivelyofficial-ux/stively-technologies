"use client";

import * as React from "react";
import Link from "next/link";
import { Check, ChevronDown, ChevronUp, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { useOutline } from "./player-shell";

export interface OutlineLesson {
  id: string;
  title: string;
  href: string;
  locked: boolean;
  active: boolean;
  completed: boolean;
  /** One dot per learning item (watch / read / quiz). */
  dots: ("done" | "current" | "todo")[];
  minutes: number | null;
}

export interface OutlineModule {
  id: string;
  number: number;
  title: string;
  doneLessons: number;
  totalLessons: number;
  minutes: number;
  complete: boolean;
  active: boolean;
  comingSoon: boolean;
  lessons: OutlineLesson[];
}

export interface OutlineProps {
  modules: OutlineModule[];
  doneSteps: number;
  totalSteps: number;
  percent: number;
  /** Where the learner goes after the last module - the intern portal, once the whole course is done. */
  trailer: { unlocked: boolean };
}

const dotColor = { done: "bg-success", current: "bg-primary", todo: "bg-border" } as const;

/** The course outline: modules accordion with locked / done / current lesson rows. Plain data in, so the page does all the (server-side) lock and progress maths. */
function Outline({ modules, doneSteps, totalSteps, percent, trailer }: OutlineProps) {
  const { close } = useOutline();
  const [open, setOpen] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(modules.map((m) => [m.id, m.active]))
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-border flex flex-col gap-2.5 border-b px-5 pt-3 pb-4">
        <div className="flex items-baseline justify-between">
          <span className="text-muted-foreground text-sm">
            {doneSteps} of {totalSteps} steps done
          </span>
          <span className="text-sm font-bold tabular-nums">{percent}%</span>
        </div>
        <div
          className="bg-muted h-1.5 overflow-hidden rounded-full"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Course progress"
        >
          <div
            className="bg-primary h-full rounded-full transition-[width] duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <nav
        aria-label="Course content"
        className="min-h-0 flex-1 overflow-y-auto px-2.5 pt-2.5 pb-8"
      >
        {modules.map((m) => {
          const isOpen = !!open[m.id];
          return (
            <div key={m.id} className="flex flex-col">
              <button
                type="button"
                onClick={() => setOpen((s) => ({ ...s, [m.id]: !isOpen }))}
                aria-expanded={isOpen}
                className="hover:bg-muted flex w-full items-center gap-3 rounded-xl px-2.5 py-3.5 text-left transition-colors"
              >
                <span
                  className={cn(
                    "flex size-[34px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold",
                    m.complete
                      ? "bg-success/15 text-success"
                      : m.active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {m.complete ? <Check className="size-4" aria-hidden="true" /> : m.number}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-foreground text-[15px] leading-snug font-semibold">
                    {m.title}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {m.comingSoon
                      ? "Coming soon"
                      : `${m.doneLessons} of ${m.totalLessons} lessons${m.minutes > 0 ? ` · ${m.minutes} min` : ""}`}
                  </span>
                </span>
                {isOpen ? (
                  <ChevronUp className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
                ) : (
                  <ChevronDown
                    className="text-muted-foreground size-4 shrink-0"
                    aria-hidden="true"
                  />
                )}
              </button>

              {isOpen && (
                <ul className="flex flex-col gap-0.5 pr-1 pb-2.5 pl-[26px]">
                  {m.comingSoon && (
                    <li className="text-muted-foreground px-3.5 py-2.5 text-sm">
                      Added free once it&apos;s recorded.
                    </li>
                  )}
                  {m.lessons.map((l) => {
                    const body = (
                      <span
                        className={cn(
                          "flex items-center gap-3 rounded-r-xl border-l-2 px-3.5 py-2.5 transition-colors",
                          l.active
                            ? "border-primary bg-primary/10"
                            : "hover:bg-muted border-transparent",
                          l.locked && "opacity-60"
                        )}
                      >
                        {l.locked ? (
                          <Lock
                            className="text-muted-foreground size-[18px] shrink-0"
                            aria-hidden="true"
                          />
                        ) : l.completed ? (
                          <Check className="text-success size-[18px] shrink-0" aria-hidden="true" />
                        ) : (
                          <span
                            className={cn(
                              "size-[18px] shrink-0 rounded-full border-2",
                              l.active ? "border-primary" : "border-muted-foreground/40"
                            )}
                            aria-hidden="true"
                          />
                        )}
                        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                          <span
                            className={cn(
                              "text-sm leading-snug",
                              l.active
                                ? "text-primary font-semibold"
                                : "text-foreground font-medium"
                            )}
                          >
                            {l.title}
                          </span>
                          {l.dots.length > 0 && (
                            <span className="flex gap-1" aria-hidden="true">
                              {l.dots.map((d, i) => (
                                <span
                                  key={i}
                                  className={cn("h-1 w-[22px] rounded-full", dotColor[d])}
                                />
                              ))}
                            </span>
                          )}
                        </span>
                        {l.minutes != null && (
                          <span className="text-muted-foreground text-xs whitespace-nowrap">
                            {l.minutes} min
                          </span>
                        )}
                      </span>
                    );
                    return (
                      <li key={l.id}>
                        {l.locked ? (
                          <span
                            aria-disabled="true"
                            title="Complete the previous lesson and its quiz to unlock this."
                          >
                            {body}
                          </span>
                        ) : (
                          <Link
                            href={l.href}
                            onClick={close}
                            aria-current={l.active ? "page" : undefined}
                            className="block"
                          >
                            {body}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}

        <div className="border-border mt-3 border-t px-1 pt-3">
          {trailer.unlocked ? (
            <Link
              href="/intern"
              onClick={close}
              className="text-foreground hover:bg-muted flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold"
            >
              Start your internship
            </Link>
          ) : (
            <span
              aria-disabled="true"
              title="Complete every module to unlock this."
              className="text-muted-foreground flex items-center gap-2.5 px-3 py-2.5 text-sm"
            >
              <Lock className="size-4" aria-hidden="true" />
              Internship - after all modules
            </span>
          )}
        </div>
      </nav>
    </div>
  );
}

export { Outline };
