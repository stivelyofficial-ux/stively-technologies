import "server-only";

import { prisma } from "@/lib/prisma";

export type LeadClientAccess = "none" | "invited" | "active";

/** Where a qualified lead's client dashboard stands: no invite yet, invited but not set up, or the client has an account. */
export async function getLeadClientAccess(
  promotedSalesLeadId: string | null
): Promise<LeadClientAccess> {
  if (!promotedSalesLeadId) return "none";
  const salesLead = await prisma.salesLead.findUnique({
    where: { id: promotedSalesLeadId },
    select: { clientUserId: true, inviteSentAt: true },
  });
  if (!salesLead) return "none";
  if (salesLead.clientUserId) return "active";
  return salesLead.inviteSentAt ? "invited" : "none";
}
