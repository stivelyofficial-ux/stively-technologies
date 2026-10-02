"use server";

import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";
import { isPlausibleReferralCode, normalizeReferralCode } from "../lib/code";
import { setReferralCookieIfAbsent } from "../lib/cookie";

/**
 * Fired once per landing from ReferralCaptureListener (mounted in the
 * marketing layout) whenever a page loads with `?ref=CODE` in the URL.
 * First-touch only (setReferralCookieIfAbsent no-ops if a cookie already
 * exists) - a click is logged only the first time a given visitor's cookie
 * actually gets set, not on every repeat visit with the param still in the
 * URL, so "how many people clicked my link" stays an honest visitor count
 * rather than a page-view count.
 */
export async function captureReferralClick(rawCode: string): Promise<void> {
  const code = normalizeReferralCode(rawCode);
  if (!isPlausibleReferralCode(code)) return;

  try {
    const referrer = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true, referralBlockedAt: true },
    });
    if (!referrer || referrer.referralBlockedAt) return;

    const isNewCookie = await setReferralCookieIfAbsent(code);
    if (!isNewCookie) return;

    const headerList = await headers();
    await prisma.referralClick.create({
      data: {
        referrerId: referrer.id,
        ipAddress: headerList.get("x-forwarded-for")?.split(",")[0]?.trim(),
        userAgent: headerList.get("user-agent") ?? undefined,
      },
    });
  } catch (error) {
    console.error("captureReferralClick failed:", error);
  }
}
