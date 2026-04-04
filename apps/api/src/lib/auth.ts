import { randomUUID } from "node:crypto";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { env } from "../config/env";

export type AccessTokenPayload = JWTPayload & {
  sub: string;
  businessId: string;
  role: string;
  email: string;
};

export type RefreshTokenPayload = JWTPayload & {
  sub: string;
  businessId: string;
  tokenId: string;
};

const encoder = new TextEncoder();
const accessSecret = encoder.encode(env.JWT_ACCESS_SECRET);
const refreshSecret = encoder.encode(env.JWT_REFRESH_SECRET);

export async function signAccessToken(payload: {
  userId: string;
  businessId: string;
  role: string;
  email: string;
}) {
  return new SignJWT({
    businessId: payload.businessId,
    role: payload.role,
    email: payload.email
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(accessSecret);
}

export async function signRefreshToken(payload: {
  userId: string;
  businessId: string;
}) {
  const tokenId = randomUUID();

  const token = await new SignJWT({
    businessId: payload.businessId,
    tokenId
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(refreshSecret);

  return {
    token,
    tokenId
  };
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, accessSecret);
  return payload as AccessTokenPayload;
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, refreshSecret);
  return payload as RefreshTokenPayload;
}
