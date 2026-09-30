import type { Metadata } from "next";
import { MousePointerClick, Users, Wallet, CheckCircle2 } from "lucide-react";

import { requireRole } from "@/lib/session";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { getReferralsForAdmin, getReferralSummaryForAdmin } from "@/features/referrals/server/queries";
import { ReferralAdminTable, type AdminReferralRow } from "@/features/referrals/components/admin/referral-admin-table";

export const metadata: Metadata = { title: "Referrals" };

export default async function AdminReferralsPage() {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const [summary, referrals] = await Promise.all([getReferralSummaryForAdmin(), getReferralsForAdmin()]);

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
    { icon: Users, label: "Active referrers", value: summary.totalReferrers.toLocaleString("en-IN") },
    { icon: MousePointerClick, label: "Total clicks", value: summary.totalClicks.toLocaleString("en-IN") },
    { icon: Wallet, label: "Owed (converted, unpaid)", value: formatPrice(summary.owedAmount) },
    { icon: CheckCircle2, label: "Paid out", value: formatPrice(summary.paidAmount) },
  ] as const;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">Referrals</h1>
        <p className="text-muted-foreground text-sm">
          Every referral platform-wide. A converted referral is real money owed - mark it paid once you&apos;ve
          actually sent it (bank transfer/UPI, outside the platform).
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

      <ReferralAdminTable rows={rows} />
    </div>
  );
}
