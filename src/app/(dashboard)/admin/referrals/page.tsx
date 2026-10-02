import type { Metadata } from "next";
import { MousePointerClick, Users, Wallet, CheckCircle2 } from "lucide-react";

import { requireRole } from "@/lib/session";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import {
  getReferralsForAdmin,
  getReferralSummaryForAdmin,
  getReferrersForAdmin,
} from "@/features/referrals/server/queries";
import { ReferrersPanel } from "@/features/referrals/components/admin/referrers-panel";
import {
  ReferralAdminTable,
  type AdminReferralRow,
} from "@/features/referrals/components/admin/referral-admin-table";

export const metadata: Metadata = { title: "Referrals" };

/** Where people drop off between a link click and a paid referral. */
function Funnel({ steps }: { steps: { label: string; value: number }[] }) {
  return (
    <ol className="border-border bg-border grid grid-cols-2 gap-px overflow-hidden rounded-lg border sm:grid-cols-4">
      {steps.map((step, i) => {
        const prev = i > 0 ? steps[i - 1].value : null;
        const pct = prev ? Math.round((step.value / prev) * 100) : null;
        return (
          <li key={step.label} className="bg-card flex flex-col gap-0.5 px-4 py-3">
            <span className="text-muted-foreground text-xs">{step.label}</span>
            <span className="text-foreground text-lg font-semibold tabular-nums">
              {step.value.toLocaleString("en-IN")}
            </span>
            <span className="text-muted-foreground text-xs tabular-nums">
              {pct == null ? " " : `${pct}% of ${steps[i - 1].label.toLowerCase()}`}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default async function AdminReferralsPage() {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const [summary, referrals, referrers] = await Promise.all([
    getReferralSummaryForAdmin(),
    getReferralsForAdmin(),
    getReferrersForAdmin(),
  ]);

  const rows: AdminReferralRow[] = referrals.map((r) => ({
    id: r.id,
    status: r.status,
    rewardAmount: r.rewardAmount,
    offeringTitle: r.offering?.title ?? null,
    referrerName: r.referrer.name ?? r.referrer.email ?? "Unknown",
    referrerEmail: r.referrer.email,
    referredUserName: r.referredUser.name ?? r.referredUser.email ?? "Unknown",
    createdAt: r.createdAt,
  }));

  const statCards = [
    {
      icon: Users,
      label: "Active referrers",
      value: summary.totalReferrers.toLocaleString("en-IN"),
    },
    {
      icon: MousePointerClick,
      label: "Total clicks",
      value: summary.totalClicks.toLocaleString("en-IN"),
    },
    { icon: Wallet, label: "Owed (converted, unpaid)", value: formatPrice(summary.owedAmount) },
    { icon: CheckCircle2, label: "Paid out", value: formatPrice(summary.paidAmount) },
  ] as const;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">Referrals</h1>
        <p className="text-muted-foreground text-sm">
          Referrers earn on conversion. Once someone reaches the minimum payout and has saved payout
          details, send the money (bank/UPI, outside the platform) and record it here with the UTR -
          that settles all their owed referrals at once.
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(({ icon: Icon, label, value }) => (
          <li key={label}>
            <Card>
              <CardContent className="flex flex-col gap-1.5 py-4">
                <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="text-foreground text-lg font-semibold tabular-nums">{value}</span>
                <span className="text-muted-foreground text-xs">{label}</span>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <Funnel
        steps={[
          { label: "Clicks", value: summary.totalClicks },
          { label: "Signed up", value: summary.totalSignups },
          { label: "Purchased", value: summary.totalConverted + summary.totalPaid },
          { label: "Paid out", value: summary.totalPaid },
        ]}
      />

      <ReferrersPanel rows={referrers} siteUrl={siteConfig.url} />

      <h2 className="text-foreground -mb-2 text-sm font-semibold">Referral activity</h2>
      <ReferralAdminTable rows={rows} />
    </div>
  );
}
