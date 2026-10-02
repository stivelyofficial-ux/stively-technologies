import "server-only";

import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "../lib/code";
import { describePayoutDestination } from "../lib/payout";
import { SHAREABLE_REFERRAL_SLUGS } from "../lib/shareable";
import { computeReferralFlags, type ReferralFlag } from "../lib/fraud";

/**
 * Most accounts never open /referrals, so the code is generated lazily
 * here on first visit rather than eagerly at every signup - collision is
 * retried a handful of times before giving up (36^7 codes, collision odds
 * are negligible, but @unique means a retry loop costs nothing to be safe).
 */
export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });
  if (existing?.referralCode) return existing.referralCode;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferralCode();
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { referralCode: code },
      });
      return updated.referralCode!;
    } catch {
      // Unique-constraint collision - vanishingly rare at 36^7, retry with a new code.
    }
  }
  throw new Error("getOrCreateReferralCode: failed to generate a unique code after 5 attempts");
}

export interface ShareableOffering {
  slug: string;
  title: string;
  /** Paise earned per successful referral. */
  reward: number;
}

/** Courses a referrer can pick from - see lib/shareable.ts. Only published ones with a reward set. */
export async function getShareableOfferings(): Promise<ShareableOffering[]> {
  const rows = await prisma.offering.findMany({
    where: {
      slug: { in: [...SHAREABLE_REFERRAL_SLUGS] },
      status: "PUBLISHED",
      referralRewardAmount: { not: null },
    },
    select: { slug: true, title: true, referralRewardAmount: true },
  });
  return SHAREABLE_REFERRAL_SLUGS.flatMap((slug) => {
    const row = rows.find((r) => r.slug === slug);
    return row ? [{ slug: row.slug, title: row.title, reward: row.referralRewardAmount! }] : [];
  });
}

/** Whether an admin has paused this user's referral link (fraud review). */
export async function isReferralPaused(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralBlockedAt: true },
  });
  return user?.referralBlockedAt != null;
}

export interface ReferralStats {
  clicks: number;
  signedUp: number;
  converted: number;
  paid: number;
  /** Paise still owed - CONVERTED but not yet PAID. */
  pendingAmount: number;
  /** Paise actually paid out so far. */
  paidAmount: number;
}

export async function getReferralStatsForUser(userId: string): Promise<ReferralStats> {
  const [clicks, referrals] = await Promise.all([
    prisma.referralClick.count({ where: { referrerId: userId } }),
    prisma.referral.findMany({
      where: { referrerId: userId },
      select: { status: true, rewardAmount: true },
    }),
  ]);

  let signedUp = 0;
  let converted = 0;
  let paid = 0;
  let pendingAmount = 0;
  let paidAmount = 0;

  for (const referral of referrals) {
    if (referral.status === "SIGNED_UP") signedUp++;
    if (referral.status === "CONVERTED") {
      converted++;
      pendingAmount += referral.rewardAmount ?? 0;
    }
    if (referral.status === "PAID") {
      paid++;
      paidAmount += referral.rewardAmount ?? 0;
    }
  }

  return { clicks, signedUp, converted, paid, pendingAmount, paidAmount };
}

export interface ReferralListItem {
  id: string;
  status: "SIGNED_UP" | "CONVERTED" | "PAID" | "REJECTED";
  rewardAmount: number | null;
  offeringTitle: string | null;
  referredUserName: string | null;
  createdAt: Date;
  convertedAt: Date | null;
  paidAt: Date | null;
}

/** Referred person's real name is shown here - this is the referrer's own earnings history, not a public list, so there's nothing to mask. */
export async function getReferralsForUser(userId: string): Promise<ReferralListItem[]> {
  const referrals = await prisma.referral.findMany({
    where: { referrerId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      rewardAmount: true,
      createdAt: true,
      convertedAt: true,
      paidAt: true,
      offering: { select: { title: true } },
      referredUser: { select: { name: true, email: true } },
    },
  });

  return referrals.map((r) => ({
    id: r.id,
    status: r.status,
    rewardAmount: r.rewardAmount,
    offeringTitle: r.offering?.title ?? null,
    referredUserName: r.referredUser.name ?? r.referredUser.email ?? "Someone",
    createdAt: r.createdAt,
    convertedAt: r.convertedAt,
    paidAt: r.paidAt,
  }));
}

// ── Admin ────────────────────────────────────────────────────────────

/** Admin list - every referral platform-wide, newest first, with just enough to render a table row and act on it. */
export async function getReferralsForAdmin() {
  return prisma.referral.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      referrer: { select: { id: true, name: true, email: true } },
      referredUser: { select: { id: true, name: true, email: true } },
      offering: { select: { title: true } },
    },
  });
}

export interface AdminReferrerRow {
  id: string;
  name: string;
  email: string | null;
  code: string;
  clicks: number;
  signedUp: number;
  converted: number;
  /** Paise - CONVERTED, not yet paid. */
  owed: number;
  /** Paise - already PAID. */
  paid: number;
  /** What the admin needs to send money, or null if the referrer hasn't added details yet. */
  payoutTo: string | null;
  /** Review flags - see lib/fraud.ts. Informational only. */
  flags: ReferralFlag[];
  /** Whole-number % of clicks that ended in a conversion; null with no clicks. */
  conversionRate: number | null;
  blocked: boolean;
  blockedReason: string | null;
}

/** Everyone who has a referral code (self-serve or admin-created), with their funnel numbers - the per-referrer view the flat referral list can't give. */
export async function getReferrersForAdmin(): Promise<AdminReferrerRow[]> {
  const users = await prisma.user.findMany({
    where: { referralCode: { not: null } },
    select: {
      id: true,
      name: true,
      email: true,
      referralCode: true,
      _count: { select: { referralClicksReceived: true } },
      referralBlockedAt: true,
      referralBlockedReason: true,
      referralsSent: {
        select: {
          status: true,
          rewardAmount: true,
          signupIp: true,
          convertedAt: true,
          referredUser: { select: { email: true } },
        },
      },
      referralPayoutDetails: true,
    },
  });

  return users
    .map((u) => {
      let signedUp = 0;
      let converted = 0;
      let owed = 0;
      let paid = 0;
      for (const r of u.referralsSent) {
        if (r.status === "SIGNED_UP") signedUp++;
        if (r.status === "CONVERTED") {
          converted++;
          owed += r.rewardAmount ?? 0;
        }
        if (r.status === "PAID") {
          converted++;
          paid += r.rewardAmount ?? 0;
        }
      }
      return {
        id: u.id,
        name: u.name ?? u.email ?? "Unnamed",
        email: u.email,
        code: u.referralCode!,
        clicks: u._count.referralClicksReceived,
        signedUp,
        converted,
        owed,
        paid,
        payoutTo: u.referralPayoutDetails
          ? describePayoutDestination(u.referralPayoutDetails)
          : null,
        flags: computeReferralFlags({
          referrerEmail: u.email,
          referrals: u.referralsSent.map((r) => ({
            signupIp: r.signupIp,
            referredEmail: r.referredUser.email,
            convertedAt: r.convertedAt,
          })),
        }),
        conversionRate:
          u._count.referralClicksReceived > 0
            ? Math.round((converted / u._count.referralClicksReceived) * 100)
            : null,
        blocked: u.referralBlockedAt != null,
        blockedReason: u.referralBlockedReason,
      };
    })
    .sort((a, b) => b.owed + b.paid - (a.owed + a.paid) || b.clicks - a.clicks);
}

export interface ReferralAdminSummary {
  totalReferrers: number;
  totalClicks: number;
  totalConverted: number;
  totalPaid: number;
  /** Paise - CONVERTED, awaiting a payout. */
  owedAmount: number;
  /** Paise - already PAID. */
  paidAmount: number;
  /** Everyone who signed up through a link, any status except rejected-before-signup. */
  totalSignups: number;
}

export async function getReferralSummaryForAdmin(): Promise<ReferralAdminSummary> {
  const [totalReferrers, totalClicks, owed, paid, totalSignups] = await Promise.all([
    prisma.user.count({ where: { referralCode: { not: null } } }),
    prisma.referralClick.count(),
    prisma.referral.aggregate({
      where: { status: "CONVERTED" },
      _sum: { rewardAmount: true },
      _count: true,
    }),
    prisma.referral.aggregate({
      where: { status: "PAID" },
      _sum: { rewardAmount: true },
      _count: true,
    }),
    prisma.referral.count(),
  ]);

  return {
    totalReferrers,
    totalClicks,
    totalConverted: owed._count,
    totalPaid: paid._count,
    owedAmount: owed._sum.rewardAmount ?? 0,
    paidAmount: paid._sum.rewardAmount ?? 0,
    totalSignups,
  };
}

// ── Phase 2: payouts ────────────────────────────────────────────────

export async function getPayoutDetailsForUser(userId: string) {
  return prisma.referralPayoutDetails.findUnique({ where: { userId } });
}

export async function getPayoutsForUser(userId: string) {
  return prisma.referralPayout.findMany({
    where: { referrerId: userId },
    orderBy: { paidAt: "desc" },
    select: { id: true, amount: true, destination: true, reference: true, paidAt: true },
  });
}
