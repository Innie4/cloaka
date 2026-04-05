import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/database";
import { ok } from "../../lib/api-response";
import { AppError } from "../../lib/app-error";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth } from "../../middleware/require-auth";
import { sendEmailNotification, sendSmsNotification } from "../../services/delivery.service";
import { queueNotification } from "../../services/notifications.service";

const createTeamMemberSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.email(),
  phone: z.string().min(7).max(30),
  role: z.enum(["ADMIN", "VIEWER"]),
  password: z.string().min(8).max(120)
});

const updateRoleSchema = z.object({
  role: z.nativeEnum(UserRole)
});

export const teamRouter = Router();

teamRouter.get(
  "/live",
  requireAuth,
  asyncHandler(async (req, res) => {
    const members = await prisma.user.findMany({
      where: {
        businessId: req.auth!.businessId
      },
      orderBy: {
        createdAt: "asc"
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        twoFactorEnabled: true,
        createdAt: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true
      }
    });

    const summary = {
      total: members.length,
      owners: members.filter((member) => member.role === UserRole.OWNER).length,
      admins: members.filter((member) => member.role === UserRole.ADMIN).length,
      viewers: members.filter((member) => member.role === UserRole.VIEWER).length
    };

    res.json(
      ok({
        summary,
        members: members.map((member) => ({
          ...member,
          createdAt: member.createdAt.toISOString(),
          emailVerifiedAt: member.emailVerifiedAt?.toISOString() ?? null,
          phoneVerifiedAt: member.phoneVerifiedAt?.toISOString() ?? null
        }))
      })
    );
  })
);

teamRouter.post(
  "/live",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = createTeamMemberSchema.parse(req.body);
    const existingUser = await prisma.user.findUnique({
      where: {
        email: input.email
      },
      select: {
        id: true
      }
    });

    if (existingUser) {
      throw new AppError("A user with this email already exists.", 409, "USER_ALREADY_EXISTS");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const member = await prisma.user.create({
      data: {
        businessId: req.auth!.businessId,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        role: input.role,
        passwordHash
      }
    });

    await prisma.auditLog.create({
      data: {
        businessId: req.auth!.businessId,
        actorUserId: req.auth!.userId,
        action: "team.member_invited",
        entityType: "User",
        entityId: member.id,
        metadata: {
          email: member.email,
          role: member.role
        }
      }
    });

    await queueNotification({
      businessId: req.auth!.businessId,
      title: "Team member added",
      body: `${member.fullName} joined the workspace as ${member.role.toLowerCase()}.`,
      level: "success"
    });

    await sendEmailNotification({
      to: member.email,
      subject: "You have been invited to Cloaka",
      html: `<p>Hello ${member.fullName},</p><p>You have been added to Cloaka as ${member.role}. You can now sign in with your email and the password shared by your team owner.</p>`
    });

    await sendSmsNotification({
      to: member.phone,
      message: `You were added to Cloaka as ${member.role}. Sign in with ${member.email}.`
    });

    res.status(201).json(
      ok({
        id: member.id,
        fullName: member.fullName,
        email: member.email,
        phone: member.phone,
        role: member.role,
        createdAt: member.createdAt.toISOString()
      })
    );
  })
);

teamRouter.patch(
  "/live/:id/role",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = updateRoleSchema.parse(req.body);
    const memberId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const member = await prisma.user.findFirst({
      where: {
        id: memberId,
        businessId: req.auth!.businessId
      }
    });

    if (!member) {
      throw new AppError("Team member not found.", 404, "TEAM_MEMBER_NOT_FOUND");
    }

    if (member.role === UserRole.OWNER && input.role !== UserRole.OWNER) {
      const ownerCount = await prisma.user.count({
        where: {
          businessId: req.auth!.businessId,
          role: UserRole.OWNER
        }
      });

      if (ownerCount <= 1) {
        throw new AppError("The workspace must retain at least one owner.", 422, "OWNER_REQUIRED");
      }
    }

    const updatedMember = await prisma.user.update({
      where: {
        id: member.id
      },
      data: {
        role: input.role
      }
    });

    await prisma.auditLog.create({
      data: {
        businessId: req.auth!.businessId,
        actorUserId: req.auth!.userId,
        action: "team.role_updated",
        entityType: "User",
        entityId: member.id,
        metadata: {
          previousRole: member.role,
          nextRole: input.role
        }
      }
    });

    res.json(
      ok({
        id: updatedMember.id,
        role: updatedMember.role
      })
    );
  })
);
