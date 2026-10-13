"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import type { ActionResult } from "@/actions/leads";
import { updateLead, resolveActorId } from "@/actions/crm";
import { provisionClientAccess } from "@/features/sales-crm/server/client-access";

export type CreateClientDashboardResult = ActionResult & { message?: string };

/**
 * The lead page's "Create client dashboard" button. A client dashboard hangs
 * off the Sales CRM client record, so for a Lead that has not been qualified
 * yet this first qualifies it (the same Qualified step as the status
 * dropdown - which already sends the invite automatically, see updateLead),
 * and for one that is already qualified it just sends the invite. Either way
 * the business contact gets an email with a link to set their password and
 * open their dashboard.
 */
export async function createClientDashboardForLead(
  leadId: string
): Promise<CreateClientDashboardResult> {
  await requireRole("ADMIN", "SUPER_ADMIN");

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return { success: false, error: "Lead not found." };
  if (lead.leadType !== "BUSINESS")
    return { success: false, error: "Only a business lead can get a client dashboard." };
  if (!lead.email)
    return {
      success: false,
      error: "Add an email to this lead first - the dashboard invite is sent there.",
    };

  if (!lead.promotedSalesLeadId) {
    const formData = new FormData();
    formData.set("status", "CONVERTED");
    const result = await updateLead(leadId, null, formData);
    if (!result.success) return result;
    return {
      success: true,
      message: "Lead qualified and a dashboard invite was emailed to the client.",
    };
  }

  const actorId = await resolveActorId();
  const result = await provisionClientAccess(lead.promotedSalesLeadId, actorId);
  if (!result.ok) return { success: false, error: result.error };

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath(`/admin/sales-crm/leads/${lead.promotedSalesLeadId}`);
  return {
    success: true,
    message: result.alreadyHadAccount
      ? "They already had an account - it's now linked to this business."
      : result.emailSent
        ? "Dashboard invite emailed to the client."
        : "Invite created, but the email could not be sent - copy the link from the Sales CRM client page.",
  };
}
