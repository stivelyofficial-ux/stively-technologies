import type { Metadata } from "next";

import { requireRole } from "@/lib/session";
import {
  getOutreachQueue,
  getAwaitingReply,
} from "@/features/lead-intelligence/server/outreach-queries";
import { LeadIntelligenceSubnav } from "@/features/lead-intelligence/components/admin/lead-intelligence-subnav";
import { OutreachQueue } from "@/features/lead-intelligence/components/admin/outreach-queue";

export const metadata: Metadata = { title: "Outreach" };

export default async function OutreachPage() {
  await requireRole("ADMIN", "SUPER_ADMIN");

  const [{ cards, stats }, awaitingReply] = await Promise.all([
    getOutreachQueue(),
    getAwaitingReply(),
  ]);

  return (
    <div className="flex flex-col gap-8 p-6">
      <LeadIntelligenceSubnav active="Outreach" />

      <div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">Outreach</h1>
        <p className="text-muted-foreground text-sm">
          Personalised WhatsApp openers for discovered businesses: a free sample site for those
          without one, a fix offer for weak sites.
        </p>
      </div>

      <OutreachQueue cards={cards} stats={stats} awaitingReply={awaitingReply} />
    </div>
  );
}
