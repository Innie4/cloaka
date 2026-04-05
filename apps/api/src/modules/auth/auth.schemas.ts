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
  password: z.string().min(8).max(120),
  otp: z.string().trim().length(6).optional()
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(20)
});

export const setupTwoFactorSchema = z.object({
  password: z.string().min(8).max(120).optional()
});

export const verifyTwoFactorSchema = z.object({
  secret: z.string().min(8).max(255),
  otp: z.string().trim().length(6)
});

export const disableTwoFactorSchema = z.object({
  otp: z.string().trim().length(6)
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type SetupTwoFactorInput = z.infer<typeof setupTwoFactorSchema>;
export type VerifyTwoFactorInput = z.infer<typeof verifyTwoFactorSchema>;
export type DisableTwoFactorInput = z.infer<typeof disableTwoFactorSchema>;
