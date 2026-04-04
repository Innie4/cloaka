import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/app-error";
import { verifyAccessToken } from "../lib/auth";

declare module "express-serve-static-core" {
  interface Request {
    auth?: {
      userId: string;
      businessId: string;
      role: string;
      email: string;
    };
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(new AppError("Authentication required.", 401, "UNAUTHORIZED"));
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = await verifyAccessToken(token);

    if (!payload.sub || !payload.businessId || !payload.role || !payload.email) {
      return next(new AppError("Invalid access token.", 401, "INVALID_TOKEN"));
    }

    req.auth = {
      userId: payload.sub,
      businessId: payload.businessId,
      role: payload.role,
      email: payload.email
    };

    return next();
  } catch {
    return next(new AppError("Invalid or expired access token.", 401, "INVALID_TOKEN"));
  }
}
