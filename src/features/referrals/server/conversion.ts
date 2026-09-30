import "server-only";

import { prisma } from "@/lib/prisma";
import { createNotification } from "@/features/notifications/server/creation";

/**
 * Called from createEnrollmentFromOrder (features/enrollments/server/creation.ts)
 * - the one real "this order is PAID, grant access" hook, reached from
 * guest checkout, authenticated checkout, and the Razorpay webhook alike.
 * That's deliberate: a referral converts on PURCHASE, not on finishing the
 * course (completeEnrollment fires much later, sometimes never) - matches
 * what was actually sold ("earn ₹200 on each successful referral").
 *
 * A no-op, not an error, when: this buyer was never referred, their
 * Referral already converted (their SECOND paid course never pays out
 * twice - the SIGNED_UP -> CONVERTED transition below is one-way), or this
 * offering isn't referral-eligible (referralRewardAmount is null). Never
 * throws - called from inside order fulfillment, where a referral-program
 * bug must not block access to something someone just paid for.
 */
export async function convertReferralOnEnrollment(
  buyerId: string,
  offeringId: string,
  referralRewardAmount: number | null
): Promise<void> {
  if (referralRewardAmount == null) return;

  try {
    const referral = await prisma.referral.findUnique({ where: { referredUserId: buyerId } });
    if (!referral || referral.status !== "SIGNED_UP") return;

    const updated = await prisma.referral.update({
      where: { id: referral.id },
      data: {
        status: "CONVERTED",
        offeringId,
        rewardAmount: referralRewardAmount,
        convertedAt: new Date(),
      },
    });

    await createNotification({
      userId: updated.referrerId,
      type: "REFERRAL_CONVERTED",
      title: "Your referral just converted",
      body: `Someone you referred just enrolled - you've earned ₹${(referralRewardAmount / 100).toLocaleString("en-IN")}.`,
      link: "/referrals",
    });
  } catch (error) {
    console.error("convertReferralOnEnrollment failed:", error);
  }
}
