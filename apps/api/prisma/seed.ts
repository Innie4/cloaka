import bcrypt from "bcryptjs";
import {
  ApprovalStatus,
  LedgerEntryType,
  PaymentStatus,
  PlanTier,
  PrismaClient,
  RecipientType,
  RuleType,
  ScheduleType,
  UserRole
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 12);

  const business = await prisma.business.upsert({
    where: {
      primaryEmail: "owner@cloaka.demo"
    },
    update: {},
    create: {
      name: "Cloaka Demo Logistics",
      slug: "cloaka-demo-logistics",
      primaryEmail: "owner@cloaka.demo",
      phone: "+2348012345678",
      planTier: PlanTier.SCALE,
      industry: "Logistics",
      businessSize: "22 staff",
      state: "Lagos",
      settings: {
        create: {
          lowBalanceThreshold: "2500000",
          approvalThreshold: "300000"
        }
      },
      users: {
        create: {
          fullName: "Adaeze Okoro",
          email: "owner@cloaka.demo",
          phone: "+2348012345678",
          passwordHash,
          role: UserRole.OWNER
        }
      },
      recipients: {
        create: [
          {
            type: RecipientType.EMPLOYEE,
            fullName: "Adaobi Nwosu",
            bankName: "GTBank",
            bankCode: "058",
            accountNumber: "0123456789",
            accountName: "Adaobi Nwosu",
            department: "Operations",
            tags: ["salary", "ops"]
          },
          {
            type: RecipientType.VENDOR,
            fullName: "Luma Logistics",
            bankName: "Access Bank",
            bankCode: "044",
            accountNumber: "1234567890",
            accountName: "Luma Logistics Ltd",
            tags: ["vendor", "fleet"]
          }
        ]
      }
    },
    include: {
      users: true,
      recipients: true
    }
  });

  const owner = business.users[0];

  const existingEntries = await prisma.walletLedgerEntry.count({
    where: {
      businessId: business.id
    }
  });

  if (existingEntries === 0) {
    await prisma.walletLedgerEntry.createMany({
      data: [
        {
          businessId: business.id,
          type: LedgerEntryType.CREDIT,
          amount: "12500000",
          reference: "seed-fund-001",
          narration: "Initial wallet funding"
        },
        {
          businessId: business.id,
          type: LedgerEntryType.HOLD,
          amount: "300000",
          reference: "seed-hold-001",
          narration: "Reserved for Tuesday vendor run"
        }
      ]
    });
  }

  const payrollRecipient = business.recipients.find((recipient) => recipient.type === RecipientType.EMPLOYEE);
  const vendorRecipient = business.recipients.find((recipient) => recipient.type === RecipientType.VENDOR);

  if (payrollRecipient && vendorRecipient) {
    const schedule = await prisma.schedule.upsert({
      where: {
        id: "cloaka-demo-schedule"
      },
      update: {},
      create: {
        id: "cloaka-demo-schedule",
        businessId: business.id,
        name: "Monthly salary run",
        description: "Core payroll schedule for warehouse and ops staff",
        type: ScheduleType.MONTHLY,
        dayOfMonth: 25,
        runAt: "09:00",
        approvalThreshold: "300000",
        recipients: {
          create: [
            {
              recipientId: payrollRecipient.id,
              fixedAmount: "165000"
            },
            {
              recipientId: vendorRecipient.id,
              fixedAmount: "420000"
            }
          ]
        }
      }
    });

    const rule = await prisma.rule.findFirst({
      where: {
        businessId: business.id,
        name: "Escalate high-value payouts"
      }
    });

    const demoRule =
      rule ??
      (await prisma.rule.create({
        data: {
          businessId: business.id,
          scheduleId: schedule.id,
          name: "Escalate high-value payouts",
          description: "Require approval when a payout goes above NGN 300k.",
          type: RuleType.THRESHOLD,
          conditionsJson: {
            logic: "AND",
            result: "REQUIRE_APPROVAL",
            conditions: [
              {
                field: "amount",
                operator: "gte",
                value: 300000
              }
            ]
          }
        }
      }));

    const paidPayment = await prisma.payment.findFirst({
      where: {
        businessId: business.id,
        reference: "seed-paid-001"
      }
    });

    if (!paidPayment) {
      await prisma.payment.create({
        data: {
          businessId: business.id,
          scheduleId: schedule.id,
          recipientId: payrollRecipient.id,
          createdByUserId: owner.id,
          reference: "seed-paid-001",
          type: "Salary",
          amount: "165000",
          status: PaymentStatus.PAID,
          processedAt: new Date()
        }
      });
    }

    const approvalPayment = await prisma.payment.findFirst({
      where: {
        businessId: business.id,
        reference: "seed-approval-001"
      }
    });

    if (!approvalPayment) {
      const payment = await prisma.payment.create({
        data: {
          businessId: business.id,
          scheduleId: schedule.id,
          recipientId: vendorRecipient.id,
          ruleId: demoRule.id,
          createdByUserId: owner.id,
          reference: "seed-approval-001",
          type: "Vendor",
          amount: "420000",
          status: PaymentStatus.PENDING_APPROVAL
        }
      });

      await prisma.approvalRequest.create({
        data: {
          paymentId: payment.id,
          requesterId: owner.id,
          approverId: owner.id,
          status: ApprovalStatus.PENDING
        }
      });
    }
  }

  console.log(
    `Seeded business ${business.name} with ${business.users.length} user(s) and ${business.recipients.length} recipient(s).`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
