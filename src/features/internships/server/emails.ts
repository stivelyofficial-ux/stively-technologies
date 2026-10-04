import "server-only";

import { resend, EMAIL_FROM } from "@/lib/resend";
import { siteConfig } from "@/config/site";
import { formatLongDate } from "../lib/stats";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const months = (n: number) => `${n} month${n === 1 ? "" : "s"}`;

export function buildDurationChangedEmail(params: {
  name: string | null;
  previousMonths: number | null;
  newMonths: number;
  startDate: Date;
  endDate: Date;
}): { subject: string; html: string } {
  const firstName = escapeHtml((params.name ?? "").trim().split(" ")[0] || "there");
  const portalUrl = `${siteConfig.url}/intern`;
  const idCardUrl = `${siteConfig.url}/intern/id-card`;
  const change =
    params.previousMonths != null && params.previousMonths !== params.newMonths
      ? `from ${months(params.previousMonths)} to <strong>${months(params.newMonths)}</strong>`
      : `to <strong>${months(params.newMonths)}</strong>`;

  const html = `<div style="font-family:Inter,Arial,sans-serif;font-size:15px;line-height:1.6;color:#0F172A;max-width:560px">
<p>Hi ${firstName},</p>
<p>Thank you for your patience - your internship duration has been updated ${change}.</p>
<table style="border-collapse:collapse;margin:16px 0;font-size:15px">
<tr><td style="padding:4px 16px 4px 0;color:#5B6476">Duration</td><td style="padding:4px 0"><strong>${months(params.newMonths)}</strong></td></tr>
<tr><td style="padding:4px 16px 4px 0;color:#5B6476">Start date</td><td style="padding:4px 0">${formatLongDate(params.startDate)}</td></tr>
<tr><td style="padding:4px 16px 4px 0;color:#5B6476">New end date</td><td style="padding:4px 0"><strong>${formatLongDate(params.endDate)}</strong></td></tr>
</table>
<p>Your Intern Portal already shows the new dates. If you saved or printed your Intern ID card earlier, please download it again from <a href="${idCardUrl}">My ID card</a> so the valid-till date matches.</p>
<p><a href="${portalUrl}" style="display:inline-block;background:#2B59E6;color:#fff;text-decoration:none;padding:10px 20px;border-radius:999px;font-weight:600">Open Intern Portal</a></p>
<p>If anything looks wrong, just reply to this email.</p>
<p>Warm regards,<br>Stively Technologies<br><a href="mailto:team@stively.com">team@stively.com</a> | <a href="https://www.stively.com">www.stively.com</a></p>
</div>`;

  return { subject: "Your internship duration has been updated", html };
}

/** Best-effort: a failed email must never undo or hide the duration change itself. Returns whether it was sent. */
export async function sendDurationChangedEmail(
  to: string | null | undefined,
  params: Parameters<typeof buildDurationChangedEmail>[0]
): Promise<boolean> {
  if (!to) return false;
  try {
    const { subject, html } = buildDurationChangedEmail(params);
    const result = await resend.emails.send({ from: EMAIL_FROM, to, subject, html });
    if (result.error) {
      console.error("sendDurationChangedEmail: Resend rejected the email:", result.error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("sendDurationChangedEmail failed:", error);
    return false;
  }
}
