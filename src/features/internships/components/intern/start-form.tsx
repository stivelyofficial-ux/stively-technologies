"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { INTERNSHIP_DURATIONS } from "../../lib/durations";
import { startInternship } from "../../actions/student-actions";

/** Terms arrive as a prop so the page decides which version is shown. */
function StartInternshipForm({ termsText }: { termsText: string }) {
  const router = useRouter();
  const [months, setMonths] = React.useState<number>(INTERNSHIP_DURATIONS[0].months);
  const [accepted, setAccepted] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!accepted) {
      setError("Please accept the stipend terms to continue.");
      return;
    }
    setIsPending(true);
    setError(undefined);
    const result = await startInternship({ durationMonths: months, acceptTerms: true });
    if (!result.success) {
      setIsPending(false);
      setError(result.error);
      return;
    }
    router.replace("/intern");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-3">
        <legend className="text-foreground mb-1 text-sm font-semibold">
          How long do you want to intern?
        </legend>
        <div
          className="grid gap-3 sm:grid-cols-3"
          role="radiogroup"
          aria-label="Internship duration"
        >
          {INTERNSHIP_DURATIONS.map((d) => {
            const selected = months === d.months;
            return (
              <button
                key={d.months}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setMonths(d.months)}
                className={
                  "flex flex-col gap-1 rounded-xl border p-4 text-left transition-colors " +
                  (selected
                    ? "border-primary bg-primary/5 ring-primary ring-1"
                    : "border-border hover:border-primary/40")
                }
              >
                <span className="text-foreground text-base font-semibold">{d.label}</span>
                <span className="text-muted-foreground text-xs text-pretty">{d.blurb}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-3">
        <details className="border-border rounded-xl border">
          <summary className="text-foreground cursor-pointer px-4 py-3 text-sm font-semibold">
            Read the internship stipend terms
          </summary>
          <pre className="text-muted-foreground max-h-72 overflow-y-auto border-t px-4 py-3 font-sans text-xs leading-relaxed whitespace-pre-wrap">
            {termsText}
          </pre>
        </details>
        <label htmlFor="intern-terms" className="flex items-start gap-2.5 text-sm">
          <Checkbox
            id="intern-terms"
            checked={accepted}
            onCheckedChange={(v) => setAccepted(v === true)}
            className="mt-0.5"
          />
          <span className="text-muted-foreground">
            I have read and accept the stipend terms. I understand my certificate, offer letter and
            experience letter don&apos;t depend on them - only the paid stipend does.
          </span>
        </label>
      </div>

      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" loading={isPending} className="w-full sm:w-fit">
        Start my internship
      </Button>
    </form>
  );
}

export { StartInternshipForm };
