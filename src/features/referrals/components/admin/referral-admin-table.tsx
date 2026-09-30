"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/utils";
import { markReferralPaid, rejectReferral } from "../../actions/admin-actions";

export interface AdminReferralRow {
  id: string;
  status: "SIGNED_UP" | "CONVERTED" | "PAID" | "REJECTED";
  rewardAmount: number | null;
  offeringTitle: string | null;
  referrerName: string;
  referrerEmail: string | null;
  referredUserName: string;
  createdAt: Date;
}

const STATUS_VARIANT: Record<string, "success" | "default" | "warning" | "secondary"> = {
  SIGNED_UP: "secondary",
  CONVERTED: "warning",
  PAID: "success",
  REJECTED: "default",
};

function RowActions({ referralId }: { referralId: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);
  const [showReject, setShowReject] = React.useState(false);
  const [reason, setReason] = React.useState("");

  async function handlePay() {
    setIsPending(true);
    await markReferralPaid(referralId);
    setIsPending(false);
    router.refresh();
  }

  async function handleReject() {
    setIsPending(true);
    await rejectReferral(referralId, reason);
    setIsPending(false);
    setShowReject(false);
    setReason("");
    router.refresh();
  }

  if (showReject) {
    return (
      <div className="flex flex-col gap-2">
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why is this being rejected?"
          className="min-h-[60px] text-sm"
        />
        <div className="flex gap-2">
          <Button size="sm" variant="outline" loading={isPending} onClick={handleReject}>
            Confirm reject
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowReject(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-2">
      <Button size="sm" loading={isPending} onClick={handlePay}>
        Mark paid
      </Button>
      <Button size="sm" variant="outline" onClick={() => setShowReject(true)}>
        Reject
      </Button>
    </div>
  );
}

function ReferralAdminTable({ rows }: { rows: AdminReferralRow[] }) {
  if (rows.length === 0) {
    return <p className="text-muted-foreground text-sm">No referrals yet.</p>;
  }

  return (
    <div className="border-border overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-muted-foreground text-left text-xs">
          <tr>
            <th className="px-4 py-2.5 font-medium">Referrer</th>
            <th className="px-4 py-2.5 font-medium">Referred</th>
            <th className="px-4 py-2.5 font-medium">Offering</th>
            <th className="px-4 py-2.5 font-medium">Reward</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium">Date</th>
            <th className="px-4 py-2.5 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-accent/40 align-top">
              <td className="px-4 py-3">
                <div className="text-foreground font-medium">{row.referrerName}</div>
                {row.referrerEmail && <div className="text-muted-foreground text-xs">{row.referrerEmail}</div>}
              </td>
              <td className="text-foreground px-4 py-3">{row.referredUserName}</td>
              <td className="text-muted-foreground px-4 py-3">{row.offeringTitle ?? "—"}</td>
              <td className="text-foreground px-4 py-3 tabular-nums">
                {row.rewardAmount != null ? formatPrice(row.rewardAmount) : "—"}
              </td>
              <td className="px-4 py-3">
                <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>
              </td>
              <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                {row.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </td>
              <td className="px-4 py-3">{row.status === "CONVERTED" && <RowActions referralId={row.id} />}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { ReferralAdminTable };
