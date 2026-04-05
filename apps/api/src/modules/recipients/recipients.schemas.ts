import { z } from "zod";

const recipientTypeSchema = z.enum(["EMPLOYEE", "VENDOR", "CONTRACTOR", "OTHER"]);
const accountNumberSchema = z
  .string()
  .trim()
  .regex(/^\d{10}$/, "Enter a valid 10-digit Nigerian account number.");
const nigerianPhoneSchema = z
  .string()
  .trim()
  .regex(
    /^(\+234|0)\d{10}$/,
    "Use a valid Nigerian phone number starting with +234 or 0."
  );

export const createRecipientSchema = z.object({
  type: recipientTypeSchema,
  fullName: z.string().trim().min(2).max(120),
  bankCode: z.string().trim().min(3).max(10),
  accountNumber: accountNumberSchema,
  email: z.email().optional(),
  phone: nigerianPhoneSchema.optional(),
  department: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(500).optional(),
  tags: z.array(z.string().min(1).max(40)).default([])
});

export const verifyRecipientAccountSchema = z.object({
  bankCode: z.string().trim().min(3).max(10),
  accountNumber: accountNumberSchema
});

export const bulkDeactivateRecipientsSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1).max(100)
});

export type CreateRecipientInput = z.infer<typeof createRecipientSchema>;
export type VerifyRecipientAccountInput = z.infer<typeof verifyRecipientAccountSchema>;
