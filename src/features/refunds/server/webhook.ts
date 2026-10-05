import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Shape of the Razorpay refund webhook entity we rely on. Only the fields
 * read below - the rest of Razorpay's payload is ignored on purpose.
 */
interface RazorpayRefundEntity {
  id: string;
  payment_id?: string;
  notes?: Record<string, string> | null;
  error_description?: string | null;
}

/**
 * Finds our Refund row for a Razorpay refund event. Matches on the Razorpay
 * refund id first, then falls back to the refundId we echoed into the refund's
 * notes - that fallback covers the window where the webhook lands before the
 * send action has stored razorpayRefundId.
 */
async function findRefundForEvent(entity: RazorpayRefundEntity) {
  const noteId = entity.notes?.refundId;
  return prisma.refund.findFirst({
    where: {
      OR: [{ razorpayRefundId: entity.id }, ...(noteId ? [{ id: noteId }] : [])],
    },
    select: { id: true, orderId: true },
  });
}

/**
 * refund.processed: Razorpay has accepted the refund and sent it to the bank.
 * Claimed as INITIATED -> PROCESSED so a replayed webhook is a no-op. The
 * order flips to REFUNDED only if it was still PAID.
 */
export async function markRefundProcessed(entity: RazorpayRefundEntity) {
  const refund = await findRefundForEvent(entity);
  if (!refund) {
    console.error("refund.processed: no Refund row for Razorpay refund", entity.id);
    return;
  }

  const claim = await prisma.refund.updateMany({
    where: { id: refund.id, status: "INITIATED" },
    data: { status: "PROCESSED", processedAt: new Date(), razorpayRefundId: entity.id },
  });
  if (claim.count === 0) return;

  await prisma.order.updateMany({
    where: { id: refund.orderId, status: "PAID" },
    data: { status: "REFUNDED" },
  });
}

/**
 * refund.failed: Razorpay could not complete the refund. Record why, so the
 * admin can see it and draft a new one. The order stays PAID.
 */
export async function markRefundFailed(entity: RazorpayRefundEntity) {
  const refund = await findRefundForEvent(entity);
  if (!refund) {
    console.error("refund.failed: no Refund row for Razorpay refund", entity.id);
    return;
  }

  await prisma.refund.updateMany({
    where: { id: refund.id, status: "INITIATED" },
    data: {
      status: "FAILED",
      razorpayRefundId: entity.id,
      failureReason: entity.error_description ?? "Razorpay reported the refund failed",
    },
  });
}
