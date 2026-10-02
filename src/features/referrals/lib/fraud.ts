/**
 * Review flags for the admin referrals page. Deliberately flag-only: none of
 * these block a signup, a conversion or a payout on their own - a shared
 * college network or a friend with a similar email is a legitimate reason
 * to see them, so a human decides before paying. Pure (no DB), so the rules
 * live in one readable place.
 */

export type ReferralFlag = "SHARED_IP" | "SIMILAR_EMAIL" | "BURST";

export const FLAG_LABELS: Record<ReferralFlag, { label: string; hint: string }> = {
  SHARED_IP: {
    label: "Same IP",
    hint: "Two or more of this person's referrals signed up from the same IP address.",
  },
  SIMILAR_EMAIL: {
    label: "Similar email",
    hint: "A referred person's email looks like the referrer's own (same name, dots or +tags).",
  },
  BURST: {
    label: "Burst",
    hint: "Three or more referrals converted within 24 hours.",
  },
};

const BURST_COUNT = 3;
const BURST_WINDOW_MS = 24 * 60 * 60 * 1000;

/** gmail ignores dots and +tags, so a.b+x@gmail.com is the same inbox as ab@gmail.com. */
function emailIdentity(email: string): { domain: string; local: string } | null {
  const [rawLocal, domain] = email.toLowerCase().split("@");
  if (!rawLocal || !domain) return null;
  const local = rawLocal.split("+")[0].replace(/\./g, "").replace(/\d+$/, "");
  return { domain, local };
}

export function emailsLookRelated(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  const x = emailIdentity(a);
  const y = emailIdentity(b);
  if (!x || !y || x.local.length < 4) return false;
  return x.local === y.local;
}

export interface FraudInput {
  referrerEmail: string | null;
  referrals: { signupIp: string | null; referredEmail: string | null; convertedAt: Date | null }[];
}

export function computeReferralFlags({ referrerEmail, referrals }: FraudInput): ReferralFlag[] {
  const flags: ReferralFlag[] = [];

  const ipCounts = new Map<string, number>();
  for (const r of referrals) {
    if (r.signupIp) ipCounts.set(r.signupIp, (ipCounts.get(r.signupIp) ?? 0) + 1);
  }
  if ([...ipCounts.values()].some((n) => n >= 2)) flags.push("SHARED_IP");

  if (referrals.some((r) => emailsLookRelated(referrerEmail, r.referredEmail)))
    flags.push("SIMILAR_EMAIL");

  const times = referrals
    .map((r) => r.convertedAt?.getTime())
    .filter((t): t is number => t != null)
    .sort((p, q) => p - q);
  for (let i = 0; i + BURST_COUNT - 1 < times.length; i++) {
    if (times[i + BURST_COUNT - 1] - times[i] <= BURST_WINDOW_MS) {
      flags.push("BURST");
      break;
    }
  }

  return flags;
}
