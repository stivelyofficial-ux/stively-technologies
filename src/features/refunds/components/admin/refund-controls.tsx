"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createRefundDraft, sendRefund, cancelRefund } from "../../actions/refund-actions";
import { REFUND_PERCENT_OPTIONS } from "../../validation";

/** Draft a 25% or 50% refund on one order. Nothing is sent to Razorpay here. */
export function OrderRefundButtons({
  orderId,
  orderAmount,
  refundableAmount,
  hasOpenRefund,
}: {
  orderId: string;
  orderAmount: number;
  refundableAmount: number;
  hasOpenRefund: boolean;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function draft(percent: (typeof REFUND_PERCENT_OPTIONS)[number]) {
    const amountLabel = (Math.round((orderAmount * percent) / 100) / 100).toLocaleString("en-IN");
    if (!window.confirm(`Draft a ${percent}% refund of ₹${amountLabel}? You can still cancel it before sending.`)) return;
    setIsPending(true);
    setError(null);
    const result = await createRefundDraft({ orderId, percent });
    setIsPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        {REFUND_PERCENT_OPTIONS.map((percent) => {
          const needed = Math.round((orderAmount * percent) / 100);
          const disabled = isPending || hasOpenRefund || needed > refundableAmount;
          return (
            <Button key={percent} size="sm" variant="outline" disabled={disabled} onClick={() => draft(percent)}>
              Refund {percent}%
            </Button>
          );
        })}
      </div>
      {hasOpenRefund ? (
        <p className="text-muted-foreground text-xs">A refund is already open for this order.</p>
      ) : null}
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}

/** Send a draft to Razorpay, or cancel it. Only drafts show these actions. */
export function RefundDraftActions({ refundId, amountLabel }: { refundId: string; amountLabel: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function run(action: "send" | "cancel") {
    const message =
      action === "send"
        ? `Send the ₹${amountLabel} refund to Razorpay now? Once sent it cannot be cancelled from here.`
        : "Cancel this refund draft?";
    if (!window.confirm(message)) return;
    setIsPending(true);
    setError(null);
    const result = action === "send" ? await sendRefund({ refundId }) : await cancelRefund({ refundId });
    setIsPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <Button size="sm" disabled={isPending} onClick={() => run("send")}>
          Send to Razorpay
        </Button>
        <Button size="sm" variant="ghost" disabled={isPending} onClick={() => run("cancel")}>
          Cancel draft
        </Button>
      </div>
      {error ? <p className="text-destructive max-w-xs text-right text-xs">{error}</p> : null}
    </div>
  );
}
