import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MIN_PAYOUT_PAISE } from "@/features/referrals/lib/payout";

function csvCell(value: string | number | null | undefined): string {
  const text = value == null ? "" : String(value);
  // Quote anything with a comma/quote/newline; also neutralize a leading
  // =,+,-,@ so a hostile name or UPI string can't run as a spreadsheet formula.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/**
 * The sheet an admin works from when paying referrers: only people who have
 * reached the minimum AND saved payout details, with everything needed to
 * send the money. Admin-only (checked here - route handlers aren't covered
 * by a page's requireRole). After paying, the admin records each payout with
 * its UTR on /admin/referrals.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return new Response("Forbidden", { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { referralPayoutDetails: { isNot: null }, referralsSent: { some: { status: "CONVERTED" } } },
    select: {
      name: true,
      email: true,
      referralPayoutDetails: true,
      referralsSent: { where: { status: "CONVERTED" }, select: { rewardAmount: true } },
    },
  });

  const header = ["Name", "Email", "Method", "UPI ID", "Account holder", "Account number", "IFSC", "Amount (INR)", "Referrals"];
  const lines = [header.map(csvCell).join(",")];

  for (const u of users) {
    const owed = u.referralsSent.reduce((sum, r) => sum + (r.rewardAmount ?? 0), 0);
    const d = u.referralPayoutDetails;
    if (!d || owed < MIN_PAYOUT_PAISE) continue;
    lines.push(
      [u.name, u.email, d.method, d.upiId, d.accountHolder, d.accountNumber, d.ifsc, (owed / 100).toFixed(2), u.referralsSent.length]
        .map(csvCell)
        .join(",")
    );
  }

  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="referral-payouts-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
