import "server-only";

import { prisma } from "@/lib/prisma";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { siteConfig } from "@/config/site";
import { ensureClientInviteToken, sendClientInviteEmail } from "./invite-creation";

export type ProvisionClientAccessResult =
  | { ok: true; alreadyHadAccount: boolean; inviteLink?: string; emailSent: boolean }
  | { ok: false; error: string };

function buildAlreadyLinkedEmailHtml(businessName: string) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #111827;">
      <p>Hi,</p>
      <p>Your existing Stively account has been linked to a new business workspace for <strong>${businessName}</strong>. Sign in as usual to see everything.</p>
      <p><a href="${siteConfig.url}/login" style="display:inline-block;background:#2e3a46;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">Sign in</a></p>
    </div>
  `;
}

/**
 * Gives a SalesLead's business contact a client dashboard: links an existing
 * CLIENT account with the same email, or issues a one-time invite link (the
 * person sets their own password at /invite/[token] - nothing is created
 * with a password they don't know) and emails it. The one implementation
 * behind the Sales CRM "Invite to client portal" button, the automatic
 * invite when an inbound Lead is qualified, and the lead page's "Create client
 * dashboard" button.
 *
 * No authorization here - callers must have checked the viewer's rights.
 * Never throws; failures come back as `{ ok: false }`.
 */
export async function provisionClientAccess(
  salesLeadId: string,
  actorTeamMemberId?: string | null
): Promise<ProvisionClientAccessResult> {
  try {
    const lead = await prisma.salesLead.findUnique({ where: { id: salesLeadId } });
    if (!lead) return { ok: false, error: "Lead not found." };
    if (lead.clientUserId)
      return { ok: false, error: "This business already has a linked client account." };
    if (!lead.email)
      return {
        ok: false,
        error: "This lead has no email on file - add one before inviting a client account.",
      };

    const existingUser = await prisma.user.findUnique({ where: { email: lead.email } });

    if (existingUser && existingUser.role !== "CLIENT") {
      return {
        ok: false,
        error: `An account with this email already exists as a ${existingUser.role.toLowerCase()} account - it can't be reused as a client account.`,
      };
    }

    if (existingUser) {
      await prisma.$transaction(async (tx) => {
        await tx.salesLead.update({
          where: { id: lead.id },
          data: { clientUserId: existingUser.id },
        });
        await tx.salesLeadActivity.create({
          data: {
            salesLeadId: lead.id,
            type: "CLIENT_ACCOUNT_INVITED",
            performedById: actorTeamMemberId ?? null,
          },
        });
      });
      let emailSent = true;
      await resend.emails
        .send({
          from: EMAIL_FROM,
          to: existingUser.email!,
          subject: `${lead.businessName} is now on your Stively account`,
          html: buildAlreadyLinkedEmailHtml(lead.businessName),
        })
        .catch((error) => {
          emailSent = false;
          console.error("provisionClientAccess (existing user) email failed:", error);
        });
      return { ok: true, alreadyHadAccount: true, emailSent };
    }

    const { link } = await ensureClientInviteToken(lead.id);
    const emailSent = await sendClientInviteEmail(lead.email, lead.businessName, link);
    await prisma.salesLeadActivity.create({
      data: {
        salesLeadId: lead.id,
        type: "CLIENT_ACCOUNT_INVITED",
        performedById: actorTeamMemberId ?? null,
      },
    });
    return { ok: true, alreadyHadAccount: false, inviteLink: link, emailSent };
  } catch (error) {
    console.error("provisionClientAccess failed:", error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
