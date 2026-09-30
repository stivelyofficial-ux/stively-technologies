"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { writeAuditLog } from "@/features/lead-intelligence/server/audit";
import { createNotification } from "@/features/notifications/server/creation";
import type { ActionResult } from "@/actions/leads";

function revalidateReferrals() {
  revalidatePath("/admin/referrals");
  revalidatePath("/referrals");
}

/** Real money leaving the business - a converted referral only reaches PAID once an admin has actually sent it (bank transfer/UPI, outside the platform) and confirms here. No automated disbursement exists yet - see TECH_DEBT.md. */
export async function markReferralPaid(referralId: string): Promise<ActionResult> {
  const admin = await requireRole("ADMIN", "SUPER_ADMIN");

  try {
    const referral = await prisma.referral.findUnique({ where: { id: referralId } });
    if (!referral) return { success: false, error: "Referral not found." };
    if (referral.status !== "CONVERTED") return { success: false, error: "Only a converted referral can be marked paid." };

    const updated = await prisma.referral.update({
      where: { id: referralId },
      data: { status: "PAID", paidAt: new Date(), reviewedById: admin.id },
    });

    await writeAuditLog({
      actorId: admin.id,
      action: "REFERRAL_PAID",
      entityType: "Referral",
      entityId: referralId,
      metadata: { rewardAmount: updated.rewardAmount, referrerId: updated.referrerId },
    });

    try {
      await createNotification({
        userId: updated.referrerId,
        type: "REFERRAL_PAID",
        title: "Referral payout sent",
        body: `Your ₹${((updated.rewardAmount ?? 0) / 100).toLocaleString("en-IN")} referral payout has been marked as paid.`,
        link: "/referrals",
      });
    } catch (error) {
      console.error("markReferralPaid: notification failed:", error);
    }

    revalidateReferrals();
    return { success: true };
  } catch (error) {
    console.error("markReferralPaid failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/** Fraud/invalid-referral path - e.g. a confirmed self-referral that slipped past the signup-time guard. Terminal, same as PAID. */
export async function rejectReferral(referralId: string, reason: string): Promise<ActionResult> {
  const admin = await requireRole("ADMIN", "SUPER_ADMIN");
  if (!reason.trim()) return { success: false, error: "A reason is required." };

  try {
    const referral = await prisma.referral.findUnique({ where: { id: referralId } });
    if (!referral) return { success: false, error: "Referral not found." };
    if (referral.status === "PAID") return { success: false, error: "Already paid - can't reject." };

    await prisma.referral.update({
      where: { id: referralId },
      data: { status: "REJECTED", rejectionReason: reason, reviewedById: admin.id },
    });

    await writeAuditLog({
      actorId: admin.id,
      action: "REFERRAL_REJECTED",
      entityType: "Referral",
      entityId: referralId,
      metadata: { reason },
    });

    revalidateReferrals();
    return { success: true };
  } catch (error) {
    console.error("rejectReferral failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
