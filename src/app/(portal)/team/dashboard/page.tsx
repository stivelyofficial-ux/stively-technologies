import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Search } from "lucide-react";

import { requireRole } from "@/lib/session";
import { SetPageTitle } from "@/components/dashboard-shell/layout/dashboard-title-context";
import { DashboardCard } from "@/components/dashboard-shell/widgets/dashboard-card";
import { Button } from "@/components/ui/button";
import {
  getOutreachQueue,
  getMyOutreachStats,
} from "@/features/lead-intelligence/server/outreach-queries";
import { getDiscoverQuota } from "@/features/lead-intelligence/server/discover-quota";
import { getTeamMemberProfile } from "@/features/team-workspace/server/context";

export const metadata: Metadata = { title: "Team Dashboard" };

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <DashboardCard padding="compact" className="gap-1">
      <span className="text-foreground text-3xl font-semibold tabular-nums">{value}</span>
      <span className="text-muted-foreground text-sm">{label}</span>
    </DashboardCard>
  );
}

export default async function TeamDashboardPage() {
  const user = await requireRole("TEAM_MEMBER");
  const profile = await getTeamMemberProfile(user.id);
  const firstName = user.name?.split(" ")[0];

  if (!profile) {
    return (
      <>
        <SetPageTitle title="Team Dashboard" />
        <div className="p-6">
          <DashboardCard>
            <p className="text-foreground text-sm font-medium">
              Your team profile isn&apos;t set up yet.
            </p>
            <p className="text-muted-foreground text-sm">
              Ask Abhijit to link it, and your outreach tools will appear here.
            </p>
          </DashboardCard>
        </div>
      </>
    );
  }

  const [{ stats }, mine, quota] = await Promise.all([
    getOutreachQueue(),
    getMyOutreachStats(profile.id),
    getDiscoverQuota(user.id, user.role),
  ]);

  return (
    <>
      <SetPageTitle title="Team Dashboard" />
      <div className="flex flex-col gap-8 p-6">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Welcome{firstName ? `, ${firstName}` : ""}
          </h2>
          <p className="text-muted-foreground text-sm">
            Your job today: send the opening message to businesses in the queue.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Sent today" value={mine.sentToday} />
          <Stat label="Sent, last 7 days" value={mine.sentLast7Days} />
          <Stat label="Replies, last 7 days" value={mine.repliesLast7Days} />
          <Stat label="Waiting in queue" value={stats.queued} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <DashboardCard className="items-start">
            <MessageCircle className="text-primary size-6" aria-hidden="true" />
            <div>
              <h3 className="text-foreground font-semibold">Send messages</h3>
              <p className="text-muted-foreground text-sm">
                {stats.queued} business{stats.queued === 1 ? "" : "es"} ready: {stats.noWebsite}{" "}
                without a website, {stats.weakWebsite} with a weak one.
              </p>
            </div>
            <Button asChild>
              <Link href="/team/outreach">Open outreach queue</Link>
            </Button>
          </DashboardCard>

          <DashboardCard className="items-start">
            <Search className="text-primary size-6" aria-hidden="true" />
            <div>
              <h3 className="text-foreground font-semibold">Find more businesses</h3>
              <p className="text-muted-foreground text-sm">
                {quota.remaining} of {quota.limit} searches left today. Found today:{" "}
                {mine.foundToday}.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/team/discover">Discover businesses</Link>
            </Button>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
