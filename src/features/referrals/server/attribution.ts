import "server-only";

import { prisma } from "@/lib/prisma";
import { readReferralCookie, clearReferralCookie } from "../lib/cookie";

/**
 * Called once, right after a brand-new User row is created - from all
 * three places that happens: credentials register (src/actions/auth.ts),
 * Google OAuth's first sign-in (events.createUser in src/lib/auth.ts), and
 * guest-checkout's auto-account-creation (guest-fulfillment.ts). Reads the
 * first-touch referral cookie (see lib/cookie.ts) and creates the one
 * Referral row this person will ever have, if a valid code is present.
 *
 * Deliberately never throws - this runs inside three different critical
 * paths (registration, OAuth sign-in, order fulfillment) and a referral
 * attribution failure must never block any of them. Callers don't need to
 * await error handling; this swallows and logs internally.
 */
export async function attributeReferralSignup(newUserId: string): Promise<void> {
  try {
    const code = await readReferralCookie();
    if (!code) return;

    const referrer = await prisma.user.findUnique({ where: { referralCode: code }, select: { id: true } });
    // No matching code, or someone clicked their own link (self-referral) -
    // silently drop the cookie either way, no Referral row created.
    if (!referrer || referrer.id === newUserId) {
      await clearReferralCookie();
      return;
    }

    // referredUserId is @unique - if this user somehow already has a
    // Referral row (shouldn't happen for a just-created account, but this
    // function is called from three call sites and must stay safe if one
    // is ever invoked twice for the same user), this just no-ops instead
    // of throwing a unique-constraint error into a critical path.
    await prisma.referral.upsert({
      where: { referredUserId: newUserId },
      create: { referrerId: referrer.id, referredUserId: newUserId, code },
      update: {},
    });

    await clearReferralCookie();
  } catch (error) {
    console.error("attributeReferralSignup failed:", error);
  }
}
