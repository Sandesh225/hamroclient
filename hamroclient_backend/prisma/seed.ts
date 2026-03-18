import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Loaded" : "NOT LOADED");
  console.log("Seeding database with Global Link Manpower details...");

  // 1. Create a Primary Branch
  const globalLinkBranchId = "branch-global-link";

  const globalLinkBranch = await prisma.branch.upsert({
    where: { id: globalLinkBranchId },
    update: {},
    create: {
      id: globalLinkBranchId,
      name: "Global Link Manpower",
      location: "Kathmandu, Nepal",
    },
  });

  console.log(`Branch created: ${globalLinkBranch.name}`);

  // 2. Create System Admin
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@globallink.com" },
    update: { passwordHash: adminPassword },
    create: {
      name: "Super Admin",
      email: "admin@globallink.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`Admin created: ${admin.email}`);

  // 3. Create 3 Staff Members
  const staffPassword = await hash("staff123", 12);
  
  const staffMembers = [
    { name: "Sita Sharma", email: "sita@globallink.com" },
    { name: "Hari Thapa", email: "hari@globallink.com" },
    { name: "Gita Karki", email: "gita@globallink.com" },
  ];

  for (const staff of staffMembers) {
    await prisma.user.upsert({
      where: { email: staff.email },
      update: { passwordHash: staffPassword },
      create: {
        name: staff.name,
        email: staff.email,
        passwordHash: staffPassword,
        role: "STAFF",
        branchId: globalLinkBranch.id,
      },
    });
    console.log(`Staff created: ${staff.email}`);
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seed script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
