"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { hashPassword } from "@/lib/password";
import { signIn } from "@/lib/auth";
import { isNextRedirectError } from "@/lib/next-redirect";
import type { AuthActionResult } from "@/actions/auth";
import type { ActionResult } from "@/actions/leads";
import { inviteClientToPortalSchema, acceptClientInviteSchema } from "../validation/client-invite-schemas";
import { resolveSalesCrmViewer } from "../server/rbac";
import { resolveClientInviteToken } from "../server/invite-queries";
import { provisionClientAccess } from "../server/client-access";

async function actorTeamMemberId(userId: string): Promise<string | undefined> {
  const teamMember = await prisma.teamMember.findUnique({ where: { userId } });
  return teamMember?.id;
}

export type SendClientInviteLinkResult = ActionResult & { alreadyHadAccount?: boolean; inviteLink?: string };

/**
 * Provisions (or links an existing) CLIENT-role account for a SalesLead's
 * business contact - never automatic, always a deliberate admin/sales click
 * from the lead detail page (or auto-attached to a quote email, see
 * quote-actions.ts). Two real paths:
 *   - An account with this exact email already exists (role CLIENT): link
 *     immediately, no token needed - they can already sign in.
 *   - No account yet: issue a fresh invite token/link (see
 *     ensureClientInviteToken) and email it - the person sets their own
 *     name/password at /invite/[token], rather than the old password-reset-
 *     email hack this replaced (see AD-017).
 * Requires lead.email - if there's none on file, add one first; this
 * doesn't (yet) support a token generated with no destination email at all.
 */
export async function sendClientInviteLink(input: unknown): Promise<SendClientInviteLinkResult> {
  const user = await requireRole("ADMIN", "SUPER_ADMIN", "SALES");

  const parsed = inviteClientToPortalSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const data = parsed.data;

  try {
    const viewer = await resolveSalesCrmViewer(user.id, user.role);
    const lead = await prisma.salesLead.findUnique({ where: { id: data.salesLeadId } });
    if (!lead) return { success: false, error: "Lead not found." };
    if (!viewer.hasFullAccess && lead.assignedToId !== viewer.teamMemberId) {
      return { success: false, error: "Lead not found." };
    }

    const actorId = await actorTeamMemberId(user.id);
    const result = await provisionClientAccess(lead.id, actorId);
    if (!result.ok) return { success: false, error: result.error };

    revalidatePath(`/admin/sales-crm/leads/${lead.id}`);
    revalidatePath(`/sales/leads/${lead.id}`);
    return result.alreadyHadAccount
      ? { success: true, alreadyHadAccount: true }
      : { success: true, alreadyHadAccount: false, inviteLink: result.inviteLink };
  } catch (error) {
    console.error("sendClientInviteLink failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/**
 * Public, unauthenticated - the /invite/[token] page's submit handler. No
 * requireRole (there's no session yet); authorization here is entirely the
 * token's own unguessability, same trust model as InterviewLink/Proposal/
 * DiscoveryForm's public actions. Creates the account and links it in one
 * transaction, clears the token (one-time use), then signs them straight in
 * via next-auth's Credentials provider and redirects to /client/dashboard -
 * same `signIn()`-throws-a-redirect-signal pattern as loginUser
 * (src/actions/auth.ts), so a brand-new client never has to separately "now
 * go log in" with the password they just chose.
 */
export async function acceptClientInvite(_prevState: AuthActionResult | null, formData: FormData): Promise<AuthActionResult> {
  const parsed = acceptClientInviteSchema.safeParse({
    token: formData.get("token"),
    name: formData.get("name"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { token, name, password } = parsed.data;

  try {
    const resolution = await resolveClientInviteToken(token);
    if (resolution.status === "not_found") return { success: false, error: "This link isn't valid." };
    if (resolution.status === "expired") return { success: false, error: "This link has expired - ask your Stively contact for a new one." };
    if (resolution.status === "already_used") return { success: false, error: "This account has already been set up - sign in instead." };

    const lead = resolution.salesLead;
    if (!lead.email) return { success: false, error: "This invite has no email on file - contact Stively directly." };

    const existing = await prisma.user.findUnique({ where: { email: lead.email } });
    if (existing) {
      return { success: false, error: "An account with this email already exists - sign in instead." };
    }

    const passwordHash = await hashPassword(password);

    await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name,
          email: lead.email,
          companyName: lead.businessName,
          role: "CLIENT",
          password: passwordHash,
          emailVerified: new Date(),
          passwordChangedAt: new Date(),
        },
      });
      await tx.salesLead.update({
        where: { id: lead.id },
        data: { clientUserId: created.id, inviteToken: null, inviteTokenExpiresAt: null, inviteAcceptedAt: new Date() },
      });
      await tx.salesLeadActivity.create({
        data: { salesLeadId: lead.id, type: "CLIENT_ACCOUNT_ACTIVATED" },
      });
    });

    await signIn("credentials", { email: lead.email, password, remember: "true", redirectTo: "/client/dashboard" });
    return { success: true };
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    console.error("acceptClientInvite failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
