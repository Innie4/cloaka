import { z } from "zod";

export const registerSchema = z.object({
  businessName: z.string().min(2).max(120),
  ownerName: z.string().min(2).max(120),
  email: z.email(),
  phone: z.string().min(10).max(20),
  password: z.string().min(8).max(120)
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(120)
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(20)
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
