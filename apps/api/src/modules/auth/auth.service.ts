import bcrypt from "bcryptjs";
import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";
import { addDays } from "../shared/date";
import { prisma } from "../../config/database";
import { AppError } from "../../lib/app-error";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../lib/auth";
import { slugify } from "../../lib/slug";
import { queueNotification } from "../../services/notifications.service";
import type {
  DisableTwoFactorInput,
  LoginInput,
  RegisterInput,
  VerifyTwoFactorInput
} from "./auth.schemas";

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
      users: true
    }
  });

  const owner = business.users[0];
  const tokens = await issueTokens({
    id: owner.id,
    email: owner.email,
    role: owner.role,
    businessId: business.id
  });

  await queueNotification({
    businessId: business.id,
    title: "Business account created",
    body: `Welcome to Cloaka, ${business.name}. Your workspace is ready for setup.`,
    level: "success"
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
      role: owner.role,
      twoFactorEnabled: owner.twoFactorEnabled
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

  if (user.twoFactorEnabled) {
    if (!input.otp) {
      throw new AppError("Two-factor code required to continue.", 401, "TWO_FACTOR_REQUIRED");
    }

    const result = user.twoFactorSecret
      ? await verify({ token: input.otp, secret: user.twoFactorSecret })
      : { valid: false };

    if (!result.valid) {
      throw new AppError("Invalid two-factor code.", 401, "INVALID_TWO_FACTOR_CODE");
    }
  }

  const tokens = await issueTokens({
    id: user.id,
    email: user.email,
    role: user.role,
    businessId: user.businessId
  });

  await queueNotification({
    businessId: user.businessId,
    title: "Successful sign-in",
    body: `${user.fullName} signed into Cloaka successfully.`,
    level: "info"
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
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled
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

export async function getCurrentUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    include: {
      business: {
        include: {
          settings: true
        }
      }
    }
  });

  if (!user) {
    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled
    },
    business: {
      id: user.business.id,
      name: user.business.name,
      planTier: user.business.planTier,
      lowBalanceThreshold: user.business.settings?.lowBalanceThreshold?.toString() ?? null,
      emailNotifications: user.business.settings?.emailNotifications ?? true,
      smsNotifications: user.business.settings?.smsNotifications ?? true
    }
  };
}

export async function setupTwoFactor(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!user) {
    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  const secret = generateSecret();
  const issuer = "Cloaka";
  const otpauthUrl = generateURI({
    issuer,
    label: user.email,
    secret
  });
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  return {
    secret,
    otpauthUrl,
    qrCodeDataUrl,
    issuer,
    account: user.email
  };
}

export async function enableTwoFactor(userId: string, input: VerifyTwoFactorInput) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!user) {
    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  const result = await verify({ token: input.otp, secret: input.secret });

  if (!result.valid) {
    throw new AppError("The two-factor code is invalid.", 422, "INVALID_TWO_FACTOR_CODE");
  }

  const updated = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: input.secret
    }
  });

  await prisma.auditLog.create({
    data: {
      businessId: updated.businessId,
      actorUserId: updated.id,
      action: "auth.2fa_enabled",
      entityType: "User",
      entityId: updated.id
    }
  });

  await queueNotification({
    businessId: updated.businessId,
    title: "Two-factor authentication enabled",
    body: `${updated.fullName} enabled two-factor authentication.`,
    level: "success"
  });

  return {
    twoFactorEnabled: true
  };
}

export async function disableTwoFactor(userId: string, input: DisableTwoFactorInput) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!user) {
    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new AppError("Two-factor authentication is not enabled.", 409, "TWO_FACTOR_NOT_ENABLED");
  }

  const result = await verify({ token: input.otp, secret: user.twoFactorSecret });

  if (!result.valid) {
    throw new AppError("The two-factor code is invalid.", 422, "INVALID_TWO_FACTOR_CODE");
  }

  await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null
    }
  });

  await prisma.auditLog.create({
    data: {
      businessId: user.businessId,
      actorUserId: user.id,
      action: "auth.2fa_disabled",
      entityType: "User",
      entityId: user.id
    }
  });

  await queueNotification({
    businessId: user.businessId,
    title: "Two-factor authentication disabled",
    body: `${user.fullName} disabled two-factor authentication.`,
    level: "warning"
  });

  return {
    twoFactorEnabled: false
  };
}
