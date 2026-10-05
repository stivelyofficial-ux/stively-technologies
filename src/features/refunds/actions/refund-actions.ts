"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { createRazorpayRefund, describeRazorpayError } from "@/lib/razorpay";
import { writeAuditLog } from "@/features/lead-intelligence/server/audit";
import type { ActionResult } from "@/actions/leads";
import { createRefundSchema, refundIdSchema } from "../validation";

/**
 * Paise already committed to refunds on an order. Drafts and in-flight
 * refunds count as committed (they will be sent), so a second draft can't
 * push the total past what the student paid. FAILED and CANCELLED don't.
 */
async function committedRefundPaise(orderId: string): Promise<number> {
  const agg = await prisma.refund.aggregate({
    where: { orderId, status: { in: ["DRAFT", "INITIATED", "PROCESSED"] } },
    _sum: { amount: true },
  });
  return agg._sum.amount ?? 0;
}

/**
 * AuditLog.actorId references TeamMember, not User (the same constraint the
 * referral actions hit). Resolve the admin's TeamMember when they have one.
 * Non-fatal: the refund itself is the real action, and it must not look
 * failed to the admin just because the audit row couldn't be written.
 */
async function auditRefund(
  adminUserId: string,
  input: { action: string; entityId: string; metadata: Record<string, unknown> }
) {
  try {
    const teamMember = await prisma.teamMember.findUnique({
      where: { userId: adminUserId },
      select: { id: true },
    });
    await writeAuditLog({
      actorId: teamMember?.id ?? null,
      action: input.action,
      entityType: "Refund",
      entityId: input.entityId,
      metadata: { adminUserId, ...input.metadata },
    });
  } catch (error) {
    console.error("auditRefund failed:", error);
  }
}

/**
 * Step 1: admin drafts a 25% or 50% refund on a paid order. Nothing is sent
 * to Razorpay yet, so the draft can still be cancelled.
 */
export async function createRefundDraft(input: unknown): Promise<ActionResult> {
  const user = await requireRole("ADMIN", "SUPER_ADMIN");
  const parsed = createRefundSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { orderId, percent, reason } = parsed.data;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, amount: true, status: true, razorpayPaymentId: true },
    });
    if (!order || (order.status !== "PAID" && order.status !== "REFUNDED") || !order.razorpayPaymentId || order.amount <= 0) {
      return { success: false, error: "This order can't be refunded. It isn't a paid Razorpay order." };
    }

    const open = await prisma.refund.findFirst({
      where: { orderId, status: { in: ["DRAFT", "INITIATED"] } },
      select: { status: true },
    });
    if (open) {
      return {
        success: false,
        error:
          open.status === "DRAFT"
            ? "A refund draft already exists for this order. Send or cancel it first."
            : "A refund for this order is still being processed. Wait for it to finish first.",
      };
    }

    const amount = Math.round((order.amount * percent) / 100);
    const committed = await committedRefundPaise(orderId);
    if (committed + amount > order.amount) {
      const left = Math.max(order.amount - committed, 0) / 100;
      return { success: false, error: `Only ₹${left.toLocaleString("en-IN")} is left to refund on this order.` };
    }

    const refund = await prisma.refund.create({
      data: {
        orderId,
        percent,
        amount,
        reason: reason || null,
        initiatedById: user.id,
      },
      select: { id: true },
    });

    await auditRefund(user.id, {
      action: "refund.draft_created",
      entityId: refund.id,
      metadata: { orderId, percent, amountPaise: amount },
    });

    revalidatePath("/admin/refunds");
    return { success: true };
  } catch (error) {
    console.error("createRefundDraft failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/**
 * Step 2: send a draft to Razorpay. The DRAFT -> INITIATED claim is a
 * conditional updateMany, so a double-click or two admins can't send the
 * same refund twice. Once INITIATED the money is on its way and this action
 * can no longer cancel it. Only the Razorpay webhook moves it on to
 * PROCESSED or FAILED.
 */
export async function sendRefund(input: unknown): Promise<ActionResult> {
  const user = await requireRole("ADMIN", "SUPER_ADMIN");
  const parsed = refundIdSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Missing refund" };
  const { refundId } = parsed.data;

  const claim = await prisma.refund.updateMany({
    where: { id: refundId, status: "DRAFT" },
    data: { status: "INITIATED", sentAt: new Date() },
  });
  if (claim.count === 0) {
    return { success: false, error: "This refund was already sent or cancelled." };
  }

  const refund = await prisma.refund.findUnique({
    where: { id: refundId },
    select: { id: true, amount: true, orderId: true, order: { select: { razorpayPaymentId: true } } },
  });
  if (!refund) return { success: false, error: "Refund not found." };

  const paymentId = refund.order.razorpayPaymentId;
  if (!paymentId) {
    await prisma.refund.update({
      where: { id: refundId },
      data: { status: "FAILED", failureReason: "Order has no Razorpay payment id" },
    });
    return { success: false, error: "This order has no Razorpay payment to refund." };
  }

  try {
    const razorpayRefund = await createRazorpayRefund({
      paymentId,
      amountInPaise: refund.amount,
      refundId: refund.id,
    });
    await prisma.refund.update({
      where: { id: refundId },
      data: { razorpayRefundId: razorpayRefund.id, razorpayPaymentId: paymentId },
    });
    await auditRefund(user.id, {
      action: "refund.sent",
      entityId: refund.id,
      metadata: { orderId: refund.orderId, amountPaise: refund.amount, razorpayRefundId: razorpayRefund.id },
    });
    revalidatePath("/admin/refunds");
    return { success: true };
  } catch (error) {
    const reason = describeRazorpayError(error);
    console.error("sendRefund: Razorpay refund failed:", reason);
    await prisma.refund.update({
      where: { id: refundId },
      data: { status: "FAILED", failureReason: reason },
    });
    revalidatePath("/admin/refunds");
    return { success: false, error: `Razorpay rejected the refund: ${reason}` };
  }
}

/** Cancel a draft. Only possible before the refund has been sent to Razorpay. */
export async function cancelRefund(input: unknown): Promise<ActionResult> {
  const user = await requireRole("ADMIN", "SUPER_ADMIN");
  const parsed = refundIdSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Missing refund" };
  const { refundId } = parsed.data;

  const result = await prisma.refund.updateMany({
    where: { id: refundId, status: "DRAFT" },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });
  if (result.count === 0) {
    return {
      success: false,
      error: "Only drafts can be cancelled. Once a refund is sent to Razorpay it can't be cancelled here.",
    };
  }

  await auditRefund(user.id, { action: "refund.cancelled", entityId: refundId, metadata: {} });
  revalidatePath("/admin/refunds");
  return { success: true };
}
