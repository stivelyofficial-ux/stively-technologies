"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { writeAuditLog } from "@/features/lead-intelligence/server/audit";
import { createNotification } from "@/features/notifications/server/creation";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { siteConfig } from "@/config/site";
import { createPasswordResetToken } from "@/lib/auth-tokens";
import type { ActionResult } from "@/actions/leads";
import { generateReferralCode, normalizeReferralCode, isPlausibleReferralCode } from "../lib/code";
import { createReferrerSchema, recordPayoutSchema } from "../validation";
import { courseReferralLink, DEFAULT_REFERRAL_SLUG } from "../lib/shareable";
import { MIN_PAYOUT_PAISE, describePayoutDestination } from "../lib/payout";

/**
 * AuditLog.actorId references TeamMember, not User - passing the admin's
 * User id straight in is an FK violation (found live: the payout committed,
 * then the audit write threw and the admin saw an error for a payout that
 * had actually gone through). Resolve the admin's TeamMember row when they
 * have one, null when they don't, and always keep their User id in
 * metadata so the trail still names who did it. Also non-fatal: the audit
 * row is a forensic nicety, never a reason to report failure for money that
 * already moved.
 */
async function writeReferralAudit(
  adminUserId: string,
  input: {
    action: string;
    entityType: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
  }
) {
  try {
    const teamMember = await prisma.teamMember.findUnique({
      where: { userId: adminUserId },
      select: { id: true },
    });
    await writeAuditLog({
      actorId: teamMember?.id ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: { ...input.metadata, adminUserId } as never,
    });
  } catch (error) {
    console.error("writeReferralAudit failed:", error);
  }
}

function revalidateReferrals() {
  revalidatePath("/admin/referrals");
  revalidatePath("/referrals");
}

/**
 * Real money leaving the business. An admin sends the transfer outside the
 * platform (bank/UPI), then records it here with the UTR. Settles EVERY
 * CONVERTED referral the person has at that moment in one payout - the
 * threshold (MIN_PAYOUT_PAISE) and the presence of payout details are both
 * enforced here, not just hidden in the UI. No automated disbursement
 * exists yet - see TECH_DEBT.md.
 */
export async function recordPayout(input: unknown): Promise<ActionResult> {
  const admin = await requireRole("ADMIN", "SUPER_ADMIN");
  const parsed = recordPayoutSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { referrerId, reference } = parsed.data;

  try {
    const referrer = await prisma.user.findUnique({
      where: { id: referrerId },
      select: { referralBlockedAt: true },
    });
    if (referrer?.referralBlockedAt)
      return { success: false, error: "This referrer is paused - unblock them before paying." };
    const details = await prisma.referralPayoutDetails.findUnique({
      where: { userId: referrerId },
    });
    if (!details)
      return { success: false, error: "This referrer hasn't added payout details yet." };

    const payout = await prisma.$transaction(async (tx) => {
      const owedRows = await tx.referral.findMany({
        where: { referrerId, status: "CONVERTED" },
        select: { id: true, rewardAmount: true },
      });
      const amount = owedRows.reduce((sum, r) => sum + (r.rewardAmount ?? 0), 0);
      if (amount < MIN_PAYOUT_PAISE) {
        throw new Error(`BELOW_MINIMUM:${amount}`);
      }

      const created = await tx.referralPayout.create({
        data: {
          referrerId,
          amount,
          destination: describePayoutDestination(details),
          reference,
          paidById: admin.id,
        },
      });
      // Only rows still CONVERTED - if another admin settled some of them a
      // moment ago, the count won't match and the whole payout rolls back.
      const updated = await tx.referral.updateMany({
        where: { id: { in: owedRows.map((r) => r.id) }, status: "CONVERTED" },
        data: { status: "PAID", paidAt: new Date(), payoutId: created.id, reviewedById: admin.id },
      });
      if (updated.count !== owedRows.length) throw new Error("CONCURRENT_CHANGE");
      return created;
    });

    await writeReferralAudit(admin.id, {
      action: "REFERRAL_PAYOUT_RECORDED",
      entityType: "ReferralPayout",
      entityId: payout.id,
      metadata: { referrerId, amount: payout.amount, reference },
    });

    try {
      await createNotification({
        userId: referrerId,
        type: "REFERRAL_PAID",
        title: "Referral payout sent",
        body: `Your ₹${(payout.amount / 100).toLocaleString("en-IN")} referral payout was sent (ref ${reference}).`,
        link: "/referrals",
      });
    } catch (error) {
      console.error("recordPayout: notification failed:", error);
    }

    revalidateReferrals();
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("BELOW_MINIMUM")) {
      return {
        success: false,
        error: `Owed balance is below the ₹${MIN_PAYOUT_PAISE / 100} minimum payout.`,
      };
    }
    if (error instanceof Error && error.message === "CONCURRENT_CHANGE") {
      return { success: false, error: "Those referrals just changed - refresh and try again." };
    }
    console.error("recordPayout failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/**
 * Pauses or resumes a referrer during fraud review. Paused: their link stops
 * tracking clicks and new signups, and payouts to them are refused. Nothing
 * already earned is changed - reject individual referrals for that.
 */
export async function setReferrerBlocked(
  referrerId: string,
  blocked: boolean,
  reason?: string
): Promise<ActionResult> {
  const admin = await requireRole("ADMIN", "SUPER_ADMIN");
  if (blocked && !reason?.trim()) return { success: false, error: "A reason is required." };

  try {
    await prisma.user.update({
      where: { id: referrerId },
      data: blocked
        ? { referralBlockedAt: new Date(), referralBlockedReason: reason!.trim() }
        : { referralBlockedAt: null, referralBlockedReason: null },
    });
    await writeReferralAudit(admin.id, {
      action: blocked ? "REFERRER_BLOCKED" : "REFERRER_UNBLOCKED",
      entityType: "User",
      entityId: referrerId,
      metadata: { reason },
    });
    revalidateReferrals();
    return { success: true };
  } catch (error) {
    console.error("setReferrerBlocked failed:", error);
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
    if (referral.status === "PAID")
      return { success: false, error: "Already paid - can't reject." };

    await prisma.referral.update({
      where: { id: referralId },
      data: { status: "REJECTED", rejectionReason: reason, reviewedById: admin.id },
    });

    await writeReferralAudit(admin.id, {
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

async function resolveUniqueCode(
  userId: string,
  requested?: string
): Promise<{ code: string } | { error: string }> {
  if (requested) {
    const code = normalizeReferralCode(requested);
    if (!isPlausibleReferralCode(code)) return { error: "Code must be 4-20 letters or digits." };
    const taken = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });
    if (taken && taken.id !== userId) return { error: `The code ${code} is already in use.` };
    return { code };
  }
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferralCode();
    const taken = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });
    if (!taken) return { code };
  }
  return { error: "Couldn't generate a unique code - try again." };
}

/**
 * Admin creates a referral link for someone who may not have an account yet
 * (a partner, influencer, ambassador). Reuses the existing account system
 * instead of a separate partner model: finds or creates the User, assigns
 * the code (admin-chosen vanity code or generated), and emails a
 * set-password link - they land in the same /referrals dashboard every
 * other referrer uses. An existing user just gets a code (or keeps theirs).
 */
export async function createReferrer(input: unknown): Promise<ActionResult & { link?: string }> {
  const admin = await requireRole("ADMIN", "SUPER_ADMIN");
  const parsed = createReferrerSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { name, email, customCode } = parsed.data;

  try {
    let user = await prisma.user.findUnique({ where: { email } });
    const isNewUser = !user;
    if (!user) {
      user = await prisma.user.create({
        data: { name, email, role: "STUDENT", emailVerified: new Date() },
      });
    }

    const resolved =
      user.referralCode && !customCode
        ? { code: user.referralCode }
        : await resolveUniqueCode(user.id, customCode || undefined);
    if ("error" in resolved) {
      if (isNewUser) await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
      return { success: false, error: resolved.error };
    }
    await prisma.user.update({ where: { id: user.id }, data: { referralCode: resolved.code } });

    const link = courseReferralLink(siteConfig.url, DEFAULT_REFERRAL_SLUG, resolved.code);

    try {
      const token = await createPasswordResetToken(user.id);
      const setPasswordUrl = `${siteConfig.url}/reset-password?token=${token}`;
      const accessBlock = isNewUser
        ? `<p>First, set a password to access your dashboard (link expires in 1 hour - use "Forgot password" on the sign-in page after that):</p><p><a href="${setPasswordUrl}">Set your password</a></p>`
        : `<p>Sign in to see your dashboard: <a href="${siteConfig.url}/referrals">${siteConfig.url}/referrals</a></p>`;
      await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: "Your Stively referral link",
        html: `<p>Hi ${name},</p><p>You've been set up as a Stively referrer. Your personal link:</p><p><a href="${link}">${link}</a></p><p>Share it - when someone signs up through it and enrolls in a course, you earn a reward. Track clicks, signups and earnings on your referral dashboard.</p>${accessBlock}`,
      });
    } catch (error) {
      console.error("createReferrer: invite email failed:", error);
    }

    await writeReferralAudit(admin.id, {
      action: "REFERRER_CREATED",
      entityType: "User",
      entityId: user.id,
      metadata: { code: resolved.code, isNewUser },
    });
    revalidateReferrals();
    return { success: true, link };
  } catch (error) {
    console.error("createReferrer failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
