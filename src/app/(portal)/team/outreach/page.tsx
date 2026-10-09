import type { Metadata } from "next";

import { requireRole } from "@/lib/session";
import { SetPageTitle } from "@/components/dashboard-shell/layout/dashboard-title-context";
import {
  getOutreachQueue,
  getAwaitingReply,
} from "@/features/lead-intelligence/server/outreach-queries";
import { OutreachQueue } from "@/features/lead-intelligence/components/admin/outreach-queue";
import { getTeamMemberProfile } from "@/features/team-workspace/server/context";

export const metadata: Metadata = { title: "Outreach" };

export default async function TeamOutreachPage() {
  const user = await requireRole("TEAM_MEMBER");
  const profile = await getTeamMemberProfile(user.id);

  if (!profile) {
    return (
      <>
        <SetPageTitle title="Outreach" />
        <p className="text-muted-foreground p-6 text-sm">
          Your team profile isn&apos;t set up yet. Ask Abhijit to link it.
        </p>
      </>
    );
  }

  const [{ cards, stats }, awaitingReply] = await Promise.all([
    getOutreachQueue(),
    getAwaitingReply(profile.id),
  ]);

  return (
    <>
      <SetPageTitle title="Outreach" />
      <div className="flex flex-col gap-6 p-6">
        <p className="text-muted-foreground text-sm">
          Send the opening message to each business. WhatsApp opens with the message ready - tap
          send there, then come back for the next one.
        </p>
        <OutreachQueue cards={cards} stats={stats} awaitingReply={awaitingReply} teamMode />
      </div>
    </>
  );
}
