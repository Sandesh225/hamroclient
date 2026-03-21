import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { z } from "zod";

const branchSchema = z.object({
  name: z.string().min(2, "Branch name must be at least 2 characters"),
  location: z.string().optional(),
  companyId: z.string().uuid("Invalid company ID").optional(),
});

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let whereClause = {};
    if (token.role !== "SYSTEM_ADMIN") {
      if (!token.companyId) {
        return NextResponse.json({ success: false, error: "Missing company context" }, { status: 401 });
      }
      whereClause = { companyId: token.companyId as string };
    }

    const branches = await prisma.branch.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { users: true, applications: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: branches });
  } catch (error) {
    console.error("Fetch Branches Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch branches" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !["COMPANY_ADMIN", "SYSTEM_ADMIN"].includes(token.role as string)) {
      return NextResponse.json({ success: false, error: "Forbidden: Admins only" }, { status: 403 });
    }

    const body = await req.json();
    const { name, location, companyId: bodyCompanyId } = branchSchema.parse(body);

    const targetCompanyId = token.role === "SYSTEM_ADMIN" ? bodyCompanyId : (token.companyId as string);

    if (!targetCompanyId) {
      return NextResponse.json({ success: false, error: "Company ID is required for System Admin provisioning" }, { status: 400 });
    }

    const newBranch = await prisma.branch.create({
      data: {
        name,
        location,
        companyId: targetCompanyId,
      },
      include: {
        _count: {
          select: { users: true, applications: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: newBranch }, { status: 201 });
  } catch (error) {
    console.error("Create Branch Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
