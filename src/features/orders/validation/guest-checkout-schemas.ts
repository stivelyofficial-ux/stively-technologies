import { z } from "zod";

/**
 * Everything needed to start a guest-checkout order in one shape - no
 * separate "create account" step exists in this flow, so email is
 * captured here directly rather than through registerSchema. No name
 * field (2026-09-27) - it's collected right after payment succeeds
 * instead (see setGuestLearnerNameSchema below), and no phone field
 * (2026-09-27) - it only ever fed the WhatsApp order-confirmation/
 * cross-sell automations, both inert until real Meta credentials exist.
 * Every field here before Razorpay opens is a real reason a cold visitor
 * hesitates. Razorpay collects a contact number itself where its own flow
 * (UPI, etc.) needs one.
 */
export const createGuestOrderSchema = z.object({
  offeringId: z.string().min(1),
  email: z.string().trim().email("Enter a valid email"),
  /**
   * One yes/no add-on decision, not a choice between two tiers - the UI
   * (guest-checkout-form.tsx) shows a single checkbox for whichever tier
   * the offering actually has (the 500-pack when available, otherwise the
   * 100-pack), and createGuestOrder resolves that same preference
   * server-side rather than trusting a client-supplied tier name.
   */
  addPromptPack: z.boolean().default(false),
  /**
   * Indian mobile, asked on our own page (re-added 2026-10-03): Razorpay's
   * popup asks for a number as its very first step when none is prefilled,
   * and 7 of 10 buyers who got that far left there. Collected here - in our
   * own words, one field - and handed to Razorpay as `prefill.contact` so
   * the popup opens straight on the payment methods. Accepts +91 / spaces /
   * dashes and normalises to the bare 10 digits.
   */
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, ""))
    .refine((v) => /^[6-9]\d{9}$/.test(v), "Enter a valid 10-digit mobile number"),
});
export type CreateGuestOrderInput = z.infer<typeof createGuestOrderSchema>;

export const verifyGuestPaymentSchema = z.object({
  orderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const acceptOrderAutoLoginSchema = z.object({
  token: z.string().min(1),
});

/**
 * The post-payment "set up your learner profile" step - order id (not a
 * session; nobody is signed in yet at this exact moment) plus the same
 * email just used at checkout as a second factor, so knowing/guessing an
 * order id alone can't rename a stranger's account. See setGuestLearnerName
 * in guest-checkout-actions.ts for the matching check.
 */
export const setGuestLearnerNameSchema = z.object({
  orderId: z.string().min(1),
  email: z.string().trim().email("Enter a valid email"),
  name: z.string().trim().min(1, "Enter your name").max(200),
});
