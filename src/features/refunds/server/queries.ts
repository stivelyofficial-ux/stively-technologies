import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Paid orders an admin can refund, optionally filtered by buyer email or
 * name. Only orders with a Razorpay payment id qualify - the refund call
 * needs one, and FREE / DIGITAL orders never have one.
 */
export async function getRefundableOrders(query: string) {
  const q = query.trim();
  const orders = await prisma.order.findMany({
    where: {
      status: { in: ["PAID", "REFUNDED"] },
      razorpayPaymentId: { not: null },
      ...(q
        ? {
            OR: [
              { guestEmail: { contains: q, mode: "insensitive" } },
              { guestName: { contains: q, mode: "insensitive" } },
              { user: { email: { contains: q, mode: "insensitive" } } },
              { user: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    orderBy: { paidAt: "desc" },
    take: 30,
    select: {
      id: true,
      sequence: true,
      amount: true,
      status: true,
      paidAt: true,
      guestName: true,
      guestEmail: true,
      offering: { select: { title: true } },
      user: { select: { name: true, email: true } },
      refunds: { select: { amount: true, status: true } },
    },
  });

  return orders.map((order) => {
    // Same committed-money rule the draft action enforces: drafts and
    // in-flight refunds count, failed and cancelled don't.
    const committed = order.refunds
      .filter((r) => ["DRAFT", "INITIATED", "PROCESSED"].includes(r.status))
      .reduce((sum, r) => sum + r.amount, 0);
    return {
      id: order.id,
      sequence: order.sequence,
      amount: order.amount,
      status: order.status,
      paidAt: order.paidAt,
      buyerName: order.user?.name ?? order.guestName ?? "-",
      buyerEmail: order.user?.email ?? order.guestEmail ?? "-",
      offeringTitle: order.offering.title,
      refundableAmount: Math.max(order.amount - committed, 0),
      hasOpenRefund: order.refunds.some((r) => r.status === "DRAFT" || r.status === "INITIATED"),
    };
  });
}

/** Most recent refunds across all orders - drafts, in flight, and finished. */
export async function getRefunds(take = 100) {
  return prisma.refund.findMany({
    orderBy: { initiatedAt: "desc" },
    take,
    select: {
      id: true,
      percent: true,
      amount: true,
      status: true,
      reason: true,
      failureReason: true,
      razorpayRefundId: true,
      initiatedAt: true,
      sentAt: true,
      processedAt: true,
      cancelledAt: true,
      initiatedBy: { select: { name: true, email: true } },
      order: {
        select: {
          id: true,
          sequence: true,
          amount: true,
          guestName: true,
          guestEmail: true,
          offering: { select: { title: true } },
          user: { select: { name: true, email: true } },
        },
      },
    },
  });
}

export type RefundRow = Awaited<ReturnType<typeof getRefunds>>[number];
export type RefundableOrderRow = Awaited<ReturnType<typeof getRefundableOrders>>[number];
