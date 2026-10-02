import type { PayoutMethod } from "@prisma/client";

/**
 * Paise. A referrer's owed balance has to reach this before an admin records
 * a payout - keeps every manual bank/UPI transfer worth the admin's time
 * (at ₹200/₹100 per referral, that's 3+ referrals). One constant here so
 * the referrer's dashboard progress bar and the admin's "eligible" check
 * can never disagree.
 */
export const MIN_PAYOUT_PAISE = 50_000;

export interface PayoutDetailsLike {
  method: PayoutMethod;
  upiId: string | null;
  accountHolder: string | null;
  accountNumber: string | null;
  ifsc: string | null;
}

/** "UPI: name@bank" / "Bank: Holder, A/C 1234567890, IFSC HDFC0001234" - a plain-text snapshot stored on each payout. */
export function describePayoutDestination(d: PayoutDetailsLike): string {
  if (d.method === "UPI") return `UPI: ${d.upiId}`;
  return `Bank: ${d.accountHolder}, A/C ${d.accountNumber}, IFSC ${d.ifsc}`;
}

/** Only the last 4 digits - what the referrer sees back on their own page after saving. */
export function maskAccountNumber(n: string | null): string {
  if (!n) return "";
  return `••••${n.slice(-4)}`;
}
