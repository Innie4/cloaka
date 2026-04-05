import { Router } from "express";
import { ok } from "../../lib/api-response";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth } from "../../middleware/require-auth";
import {
  disableTwoFactorSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  verifyTwoFactorSchema
} from "./auth.schemas";
import {
  disableTwoFactor,
  enableTwoFactor,
  getCurrentUserProfile,
  loginUser,
  refreshUserToken,
  registerBusiness,
  setupTwoFactor
} from "./auth.service";

export const authRouter = Router();

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);
    const result = await registerBusiness(input);
    res.status(201).json(ok(result));
  })
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const result = await loginUser(input);
    res.json(ok(result));
  })
);

authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const input = refreshSchema.parse(req.body);
    const result = await refreshUserToken(input.refreshToken);
    res.json(ok(result));
  })
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await getCurrentUserProfile(req.auth!.userId);
    res.json(ok(result));
  })
);

authRouter.post(
  "/2fa/setup",
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await setupTwoFactor(req.auth!.userId);
    res.json(ok(result));
  })
);

authRouter.post(
  "/2fa/enable",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = verifyTwoFactorSchema.parse(req.body);
    const result = await enableTwoFactor(req.auth!.userId, input);
    res.json(ok(result));
  })
);

authRouter.post(
  "/2fa/disable",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = disableTwoFactorSchema.parse(req.body);
    const result = await disableTwoFactor(req.auth!.userId, input);
    res.json(ok(result));
  })
);
