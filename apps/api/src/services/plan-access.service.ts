import { getPlanPolicy, hasPlanFeature, type SupportedPlanTier, type WorkspaceFeature } from "@cloaka/shared";
import { prisma } from "../config/database";
import { AppError } from "../lib/app-error";

export async function getBusinessPlanContext(businessId: string) {
  const business = await prisma.business.findUnique({
    where: {
      id: businessId
    },
    select: {
      planTier: true
    }
  });

  if (!business) {
    throw new AppError("Business account not found.", 404, "BUSINESS_NOT_FOUND");
  }

  const planTier = business.planTier as SupportedPlanTier;

  return {
    planTier,
    policy: getPlanPolicy(planTier)
  };
}

export async function assertPlanFeature(businessId: string, feature: WorkspaceFeature) {
  const { planTier } = await getBusinessPlanContext(businessId);

  if (!hasPlanFeature(planTier, feature)) {
    throw new AppError(
      `This feature is available on a higher Cloaka plan.`,
      403,
      "PLAN_FEATURE_LOCKED"
    );
  }
}
