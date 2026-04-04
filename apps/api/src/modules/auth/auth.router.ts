import { Router } from "express";
import { ok } from "../../lib/api-response";
import { asyncHandler } from "../../lib/async-handler";
import { loginSchema, refreshSchema, registerSchema } from "./auth.schemas";
import { loginUser, refreshUserToken, registerBusiness } from "./auth.service";

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
