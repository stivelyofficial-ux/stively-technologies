"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import type { ActionResult } from "@/actions/leads";

const outreachIdSchema = z.string().min(1);

async function resolveActorId(userId: string): Promise<string | null> {
  const linked = await prisma.teamMember.findUnique({ where: { userId } });
  return linked?.id ?? null;
}

/**
 * Records that the WhatsApp opening message was sent (the browser has just
 * opened wa.me with it - the actual send is the user's own tap inside
 * WhatsApp, never automated). Only moves a business that is still
 * NOT_CONTACTED, so a double-click or a second tab can't log it twice.
 */
export async function markOutreachSent(businessId: string, message: string): Promise<ActionResult> {
  const user = await requireRole("ADMIN", "SUPER_ADMIN", "SALES");
  const parsedId = outreachIdSchema.safeParse(businessId);
  if (!parsedId.success) return { success: false, error: "Invalid business." };

  try {
    const actorId = await resolveActorId(user.id);
    const result = await prisma.business.updateMany({
      where: { id: businessId, outreachStatus: "NOT_CONTACTED" },
      data: { outreachStatus: "CONTACTED", outreachContactedAt: new Date() },
    });
    if (result.count === 0) return { success: true };

    await prisma.businessActivity.create({
      data: {
        businessId,
        type: "OUTREACH_SENT",
        description: "WhatsApp opening message sent from the Outreach queue.",
        metadata: { channel: "WHATSAPP", message: message.slice(0, 2000) },
        performedById: actorId,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("markOutreachSent failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/** Passes over a business in the queue so it never comes back (SKIPPED), or flags it as not interested. */
export async function markOutreachOutcome(
  businessId: string,
  outcome: "SKIPPED" | "NOT_INTERESTED" | "REPLIED"
): Promise<ActionResult> {
  const user = await requireRole("ADMIN", "SUPER_ADMIN", "SALES");
  const parsedId = outreachIdSchema.safeParse(businessId);
  if (!parsedId.success) return { success: false, error: "Invalid business." };

  try {
    const actorId = await resolveActorId(user.id);
    await prisma.business.update({ where: { id: businessId }, data: { outreachStatus: outcome } });

    if (outcome === "REPLIED" || outcome === "NOT_INTERESTED") {
      await prisma.businessActivity.create({
        data: {
          businessId,
          type: outcome === "REPLIED" ? "OUTREACH_REPLIED" : "OUTREACH_NOT_INTERESTED",
          performedById: actorId,
        },
      });
    }

    revalidatePath(`/admin/lead-intelligence/businesses/${businessId}`);
    return { success: true };
  } catch (error) {
    console.error("markOutreachOutcome failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
