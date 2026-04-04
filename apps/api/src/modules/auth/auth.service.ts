import bcrypt from "bcryptjs";
import { addDays } from "../shared/date";
import { prisma } from "../../config/database";
import { AppError } from "../../lib/app-error";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../lib/auth";
import { slugify } from "../../lib/slug";
import type { LoginInput, RegisterInput } from "./auth.schemas";

async function issueTokens(user: {
  id: string;
  email: string;
  role: string;
  businessId: string;
}) {
  const accessToken = await signAccessToken({
    userId: user.id,
    businessId: user.businessId,
    role: user.role,
    email: user.email
  });

  const refresh = await signRefreshToken({
    userId: user.id,
    businessId: user.businessId
  });

  await prisma.refreshToken.create({
    data: {
      businessId: user.businessId,
      userId: user.id,
      tokenId: refresh.tokenId,
      expiresAt: addDays(new Date(), 7)
    }
  });

  return {
    accessToken,
    refreshToken: refresh.token
  };
}

export async function registerBusiness(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: {
      email: input.email
    }
  });

  if (existing) {
    throw new AppError("An account with that email already exists.", 409, "EMAIL_IN_USE");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const baseSlug = slugify(input.businessName);

  const business = await prisma.business.create({
    data: {
      name: input.businessName,
      slug: `${baseSlug}-${Date.now().toString().slice(-6)}`,
      primaryEmail: input.email,
      phone: input.phone,
      settings: {
        create: {
          lowBalanceThreshold: "50000"
        }
      },
      users: {
        create: {
          fullName: input.ownerName,
          email: input.email,
          phone: input.phone,
          passwordHash,
          role: "OWNER"
        }
      }
    },
    include: {
      users: true,
      settings: true
    }
  });

  const owner = business.users[0];
  const tokens = await issueTokens({
    id: owner.id,
    email: owner.email,
    role: owner.role,
    businessId: business.id
  });

  return {
    business: {
      id: business.id,
      name: business.name,
      slug: business.slug,
      planTier: business.planTier,
      kybStatus: business.kybStatus
    },
    user: {
      id: owner.id,
      fullName: owner.fullName,
      email: owner.email,
      role: owner.role
    },
    tokens
  };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email
    },
    include: {
      business: true
    }
  });

  if (!user) {
    throw new AppError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
  }

  const tokens = await issueTokens({
    id: user.id,
    email: user.email,
    role: user.role,
    businessId: user.businessId
  });

  return {
    business: {
      id: user.business.id,
      name: user.business.name,
      slug: user.business.slug,
      planTier: user.business.planTier,
      kybStatus: user.business.kybStatus
    },
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    },
    tokens
  };
}

export async function refreshUserToken(token: string) {
  const payload = await verifyRefreshToken(token);

  if (!payload.sub || !payload.businessId || !payload.tokenId) {
    throw new AppError("Invalid refresh token.", 401, "INVALID_REFRESH_TOKEN");
  }

  const refreshToken = await prisma.refreshToken.findUnique({
    where: {
      tokenId: payload.tokenId
    },
    include: {
      user: true
    }
  });

  if (!refreshToken || refreshToken.revokedAt || refreshToken.expiresAt < new Date()) {
    throw new AppError("Refresh token is no longer valid.", 401, "INVALID_REFRESH_TOKEN");
  }

  const accessToken = await signAccessToken({
    userId: refreshToken.user.id,
    businessId: refreshToken.businessId,
    role: refreshToken.user.role,
    email: refreshToken.user.email
  });

  return {
    accessToken
  };
}
