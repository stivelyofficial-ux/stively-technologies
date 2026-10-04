import type { Metadata } from "next";
import { Briefcase } from "lucide-react";

import { getInternContext } from "@/features/internships/server/access";
import { buildInternIdCardData } from "@/features/internships/server/id-card";
import { EmptyState } from "@/components/sections/empty-state";
import {
  InternIdCardBack,
  InternIdCardFront,
} from "@/features/internships/components/intern/id-card";
import { PrintButton } from "@/features/internships/components/intern/print-button";
import { InternShare } from "@/features/internships/components/intern/intern-share";

export const metadata: Metadata = { title: "My ID card" };

export default async function InternIdCardPage() {
  const { user, track } = await getInternContext({ requireOnboarded: true });

  if (!track) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Your ID card unlocks with your internship"
        description="Finish your course and start your internship - your Intern ID card appears here."
        actionLabel="Go to my learning"
        actionHref="/student/learning"
      />
    );
  }

  const data = await buildInternIdCardData(user, track);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground text-3xl font-bold tracking-tight">My ID card</h1>
          <p className="text-muted-foreground">
            Your Stively Intern ID{" "}
            <span className="text-foreground font-mono font-semibold">{data.internId}</span>. Anyone
            can scan the QR code to confirm you are a Stively intern.
          </p>
        </div>
        <PrintButton label="Print / save as PDF" />
      </div>

      <div className="flex flex-wrap justify-center gap-8 lg:justify-start">
        <InternIdCardFront data={data} />
        <InternIdCardBack data={data} />
      </div>

      <InternShare userId={user.id} track={track} />
    </div>
  );
}
