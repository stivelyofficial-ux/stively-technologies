import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Rocket } from "lucide-react";

import { getInternContext } from "@/features/internships/server/access";
import { StartInternshipForm } from "@/features/internships/components/intern/start-form";
import { STIPEND_TERMS_TEXT } from "@/features/internships/lib/stipend-terms";

export const metadata: Metadata = { title: "Start your internship" };

export default async function StartInternshipPage() {
  const { track } = await getInternContext();
  if (!track) redirect("/intern");
  if (track.onboardedAt) redirect("/intern");

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-full">
          <Rocket className="size-5" aria-hidden="true" />
        </span>
        <h1 className="text-foreground font-display text-2xl font-semibold tracking-tight">
          Congratulations - you&apos;ve unlocked your internship
        </h1>
        <p className="text-muted-foreground text-sm text-pretty">
          Choose how long you want to intern and confirm the terms. Your internship starts today:
          you&apos;ll get a real client-style project with day-by-day tasks, and your work is
          reviewed by a mentor.
        </p>
      </div>
      <StartInternshipForm termsText={STIPEND_TERMS_TEXT} />
    </div>
  );
}
