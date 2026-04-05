import bcrypt from "bcryptjs";
import { PrismaClient, PlanTier, RecipientType, UserRole } from "@prisma/client";

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
