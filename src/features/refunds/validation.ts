import { z } from "zod";

/** Only the two refund shares the business offers - anything else is rejected before it reaches Razorpay. */
export const REFUND_PERCENT_OPTIONS = [25, 50] as const;

export const createRefundSchema = z.object({
  orderId: z.string().min(1, "Missing order"),
  percent: z.union([z.literal(25), z.literal(50)], { message: "Choose 25% or 50%" }),
  reason: z.string().trim().max(500, "Reason is too long").optional(),
});

export const refundIdSchema = z.object({
  refundId: z.string().min(1, "Missing refund"),
});
