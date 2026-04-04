import { z } from "zod";

export const createRecipientSchema = z.object({
  type: z.enum(["EMPLOYEE", "VENDOR", "CONTRACTOR", "OTHER"]),
  fullName: z.string().min(2).max(120),
  bankName: z.string().min(2).max(120),
  accountNumber: z.string().min(10).max(10),
  accountName: z.string().min(2).max(120),
  email: z.email().optional(),
  phone: z.string().min(10).max(20).optional(),
  department: z.string().max(120).optional(),
  notes: z.string().max(500).optional(),
  tags: z.array(z.string().min(1).max(40)).default([])
});

export type CreateRecipientInput = z.infer<typeof createRecipientSchema>;
