/**
 * Which courses a referrer can currently promote. A referral link lands the
 * visitor straight on that course's page (where they can enroll right
 * there), instead of the homepage. Today only Frontend Development is
 * pushed; to open another course up, add its slug here - it must also have
 * Offering.referralRewardAmount set, or it won't be listed.
 */
export const SHAREABLE_REFERRAL_SLUGS = ["frontend-development"] as const;

/** The course the admin-facing "copy link" and referrer-invite emails point at. */
export const DEFAULT_REFERRAL_SLUG = SHAREABLE_REFERRAL_SLUGS[0];

export function courseReferralLink(siteUrl: string, slug: string, code: string): string {
  return `${siteUrl}/offerings/${slug}?ref=${code}`;
}
