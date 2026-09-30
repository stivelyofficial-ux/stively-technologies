import type { Metadata } from "next";
import { MousePointerClick, UserPlus, Wallet, CheckCircle2, Gift } from "lucide-react";

import { requireUser } from "@/lib/session";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/utils";
import { SetPageTitle } from "@/components/dashboard-shell/layout/dashboard-title-context";
import { Container } from "@/components/shared/container";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOrCreateReferralCode, getReferralStatsForUser, getReferralsForUser } from "@/features/referrals/server/queries";
import { ReferralLinkCard } from "@/features/referrals/components/referral-link-card";

export const metadata: Metadata = { title: "Referrals" };

const STATUS_BADGE: Record<string, { label: string; variant: "success" | "default" | "warning" | "secondary" }> = {
  SIGNED_UP: { label: "Signed up", variant: "secondary" },
  CONVERTED: { label: "Earned - pending payout", variant: "warning" },
  PAID: { label: "Paid", variant: "success" },
  REJECTED: { label: "Rejected", variant: "default" },
};

/**
 * Open to any signed-in user, any role (see AD-035) - deliberately just
 * requireUser(), not requireRole(), since this isn't a role-specific
 * capability. Lives outside any one role's own route prefix for that
 * reason; PROTECTED_ROUTES grants every (portal)-layout role access.
 */
export default async function ReferralsPage() {
  const user = await requireUser();
  const [code, stats, referrals] = await Promise.all([
    getOrCreateReferralCode(user.id),
    getReferralStatsForUser(user.id),
    getReferralsForUser(user.id),
  ]);

  const link = `${siteConfig.url}/?ref=${code}`;

  const statCards = [
    { icon: MousePointerClick, label: "Link clicks", value: stats.clicks.toLocaleString("en-IN") },
    { icon: UserPlus, label: "Signed up", value: stats.signedUp.toLocaleString("en-IN") },
    { icon: Gift, label: "Converted", value: stats.converted.toLocaleString("en-IN") },
    { icon: Wallet, label: "Pending payout", value: formatPrice(stats.pendingAmount) },
    { icon: CheckCircle2, label: "Paid out", value: formatPrice(stats.paidAmount) },
  ] as const;

  return (
    <>
      <SetPageTitle title="Referrals" />
      <Container className="flex flex-col gap-6 py-8">
        <div>
          <h1 className="text-foreground font-display text-2xl font-semibold tracking-tight">Refer & earn</h1>
          <p className="text-muted-foreground text-sm">
            Share your link. When someone you refer enrolls in a course, you earn a reward once they pay.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your referral link</CardTitle>
            <CardDescription>Anyone who signs up through this link gets attributed to you.</CardDescription>
          </CardHeader>
          <CardContent>
            <ReferralLinkCard link={link} />
          </CardContent>
        </Card>

        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {statCards.map(({ icon: Icon, label, value }) => (
            <li key={label}>
              <Card>
                <CardContent className="flex flex-col gap-1.5 py-4">
                  <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-foreground font-display text-lg font-semibold tabular-nums">{value}</span>
                  <span className="text-muted-foreground text-xs">{label}</span>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>

        <Card>
          <CardHeader>
            <CardTitle>Your referrals</CardTitle>
            <CardDescription>Every person who signed up through your link.</CardDescription>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <p className="text-muted-foreground text-sm">No referrals yet - share your link to get started.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {referrals.map((referral) => {
                  const badge = STATUS_BADGE[referral.status];
                  return (
                    <li key={referral.id} className="border-border/70 flex items-center justify-between gap-3 rounded-lg border p-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-foreground text-sm font-medium">{referral.referredUserName}</span>
                        <span className="text-muted-foreground text-xs">
                          {referral.offeringTitle ?? "Not enrolled yet"} &middot;{" "}
                          {referral.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {referral.rewardAmount != null && (
                          <span className="text-foreground text-sm font-semibold tabular-nums">
                            {formatPrice(referral.rewardAmount)}
                          </span>
                        )}
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
