import { z } from "zod";

export const createReferrerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  customCode: z.string().trim().max(20).optional().or(z.literal("")),
});

const upiSchema = z.object({
  method: z.literal("UPI"),
  upiId: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/, "Enter a valid UPI ID, like name@bank"),
});

const bankSchema = z.object({
  method: z.literal("BANK"),
  accountHolder: z.string().trim().min(2, "Enter the account holder's name").max(100),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{9,18}$/, "Account number should be 9-18 digits"),
  ifsc: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code, like HDFC0001234"),
});

export const payoutDetailsSchema = z.discriminatedUnion("method", [upiSchema, bankSchema]);

export const recordPayoutSchema = z.object({
  referrerId: z.string().min(1),
  reference: z.string().trim().min(3, "Enter the UTR / transaction reference").max(100),
});
