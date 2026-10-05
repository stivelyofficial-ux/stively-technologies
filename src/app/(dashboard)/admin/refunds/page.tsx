import type { Metadata } from "next";

import { requireRole } from "@/lib/session";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getRefundableOrders, getRefunds } from "@/features/refunds/server/queries";
import { OrderRefundButtons, RefundDraftActions } from "@/features/refunds/components/admin/refund-controls";

export const metadata: Metadata = { title: "Refunds" };

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  INITIATED: "Sent to Razorpay",
  PROCESSED: "Processed",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};

const STATUS_CLASS: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  INITIATED: "bg-primary/10 text-primary",
  PROCESSED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  FAILED: "bg-destructive/10 text-destructive",
  CANCELLED: "bg-muted text-muted-foreground",
};

function formatDate(date: Date | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

/**
 * Admin refunds: draft a 25% or 50% refund on a paid order, then send it to
 * Razorpay. Revoking the student's course access is handled manually by the
 * admin (not automated here).
 */
export default async function AdminRefundsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const { q = "" } = await searchParams;

  const [orders, refunds] = await Promise.all([getRefundableOrders(q), getRefunds()]);

  return (
    <div className="flex flex-col gap-8 p-6">
      <div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">Refunds</h1>
        <p className="text-muted-foreground text-sm">
          Draft a 25% or 50% refund, then send it to Razorpay. Money reaches the student&apos;s account in 5-7 working days for cards and net banking.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paid orders</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form method="GET" className="flex gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by buyer name or email"
              className="border-input bg-background h-9 w-full max-w-sm rounded-md border px-3 text-sm"
            />
            <Button type="submit" size="sm" variant="outline">
              Search
            </Button>
          </form>

          {orders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No paid orders match.</p>
          ) : (
            <ul className="divide-border flex flex-col divide-y">
              {orders.map((order) => (
                <li key={order.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-foreground text-sm font-medium">
                      {order.buyerName} <span className="text-muted-foreground font-normal">· {order.buyerEmail}</span>
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {order.offeringTitle} · Paid {formatPrice(order.amount)} on {formatDate(order.paidAt)}
                      {order.refundableAmount < order.amount
                        ? ` · ${formatPrice(order.refundableAmount)} still refundable`
                        : ""}
                    </p>
                  </div>
                  <OrderRefundButtons
                    orderId={order.id}
                    orderAmount={order.amount}
                    refundableAmount={order.refundableAmount}
                    hasOpenRefund={order.hasOpenRefund}
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Refund history</CardTitle>
        </CardHeader>
        <CardContent>
          {refunds.length === 0 ? (
            <p className="text-muted-foreground text-sm">No refunds yet.</p>
          ) : (
            <ul className="divide-border flex flex-col divide-y">
              {refunds.map((refund) => {
                const buyerName = refund.order.user?.name ?? refund.order.guestName ?? "-";
                const buyerEmail = refund.order.user?.email ?? refund.order.guestEmail ?? "-";
                return (
                  <li key={refund.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-foreground text-sm font-medium">
                          {refund.percent}% · {formatPrice(refund.amount)}
                        </p>
                        <Badge className={STATUS_CLASS[refund.status]}>{STATUS_LABEL[refund.status] ?? refund.status}</Badge>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {buyerName} · {buyerEmail} · {refund.order.offering.title} (Order #{refund.order.sequence})
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Initiated {formatDate(refund.initiatedAt)} by {refund.initiatedBy.name ?? refund.initiatedBy.email}
                        {refund.sentAt ? ` · Sent ${formatDate(refund.sentAt)}` : ""}
                        {refund.processedAt ? ` · Processed ${formatDate(refund.processedAt)}` : ""}
                        {refund.cancelledAt ? ` · Cancelled ${formatDate(refund.cancelledAt)}` : ""}
                      </p>
                      {refund.reason ? <p className="text-muted-foreground text-xs">Reason: {refund.reason}</p> : null}
                      {refund.failureReason ? (
                        <p className="text-destructive text-xs">Failure: {refund.failureReason}</p>
                      ) : null}
                      {refund.razorpayRefundId ? (
                        <p className="text-muted-foreground font-mono text-[11px]">{refund.razorpayRefundId}</p>
                      ) : null}
                    </div>
                    {refund.status === "DRAFT" ? (
                      <RefundDraftActions refundId={refund.id} amountLabel={(refund.amount / 100).toLocaleString("en-IN")} />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
