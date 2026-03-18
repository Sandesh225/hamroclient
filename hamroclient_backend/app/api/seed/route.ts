import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  // Simple check for a "secret" query param to prevent unauthorized seeding
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  
  if (secret !== "hamro-seed-secret") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Seeding started via API...");

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
    }

    return NextResponse.json({ success: true, message: "Global Link Manpower branch, admin, and 3 staff seeded successfully" });
  } catch (error: any) {
    console.error("API Seed Error:", error);
    return NextResponse.json({ error: error.message || "Seeding failed" }, { status: 500 });
  }
}
