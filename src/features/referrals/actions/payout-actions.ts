"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import type { ActionResult } from "@/actions/leads";
import { payoutDetailsSchema } from "../validation";

/** A referrer saves (or edits) where they want to be paid - always their own row, keyed by the signed-in user, never a client-supplied id. */
export async function savePayoutDetails(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = payoutDetailsSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const data = parsed.data;

  const fields =
    data.method === "UPI"
      ? {
          method: "UPI" as const,
          upiId: data.upiId,
          accountHolder: null,
          accountNumber: null,
          ifsc: null,
        }
      : {
          method: "BANK" as const,
          upiId: null,
          accountHolder: data.accountHolder,
          accountNumber: data.accountNumber,
          ifsc: data.ifsc,
        };

  try {
    await prisma.referralPayoutDetails.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...fields },
      update: fields,
    });
    revalidatePath("/referrals");
    revalidatePath("/admin/referrals");
    return { success: true };
  } catch (error) {
    console.error("savePayoutDetails failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
