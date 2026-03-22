import { NextRequest, NextResponse } from "next/server";
import { getToken, encode } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { z } from "zod";

const companyProvisionSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  registrationNumber: z.string().optional(),
  contactEmail: z.string().email("Invalid contact email"),
  contactPhone: z.string().optional(),
  adminName: z.string().min(2, "Admin name is required"),
  adminEmail: z.string().email("Invalid admin email"),
});

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "SYSTEM_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized: System Admin access required" }, { status: 403 });
    }

    const companies = await (prisma as any).company.findMany({
      include: {
        _count: {
          select: {
            branches: true,
            users: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({ success: true, data: companies });

  } catch (error: any) {
    console.error("Fetch Companies Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "SYSTEM_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized: System Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = companyProvisionSchema.parse(body);

    // 1. Check if user/email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.adminEmail }
    });

    if (existingUser) {
      return NextResponse.json({ success: false, error: "A user with this admin email already exists" }, { status: 400 });
    }

    // 2. Create Company + Head Office Branch + Admin User in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create Company
      const company = await (tx as any).company.create({
        data: {
          businessName: validatedData.businessName,
          registrationNumber: validatedData.registrationNumber,
          contactEmail: validatedData.contactEmail,
          contactPhone: validatedData.contactPhone,
        }
      });

      // Create Primary Branch
      const branch = await tx.branch.create({
        data: {
          name: "Head Office",
          location: "Not Set",
          companyId: company.id,
        } as any
      });

      // Create Admin User
      const user = await tx.user.create({
        data: {
          name: validatedData.adminName,
          email: validatedData.adminEmail,
          role: "COMPANY_ADMIN" as any,
          companyId: company.id,
          branchId: branch.id,
          isProfileComplete: false,
          passwordHash: null,
        } as any
      });

      return { company, branch, user };
    });

    // 3. Generate Invite Link (same logic as api/auth/invite)
    const secret = process.env.NEXTAUTH_SECRET || "fallback_secret";
    const inviteToken = await encode({
      token: {
        userId: result.user.id,
        email: result.user.email,
        companyId: (result.user as any).companyId,
        branchId: result.user.branchId,
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 days for new company setup
      } as any,
      secret,
    });

    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
    const inviteLink = `${baseUrl}/accept-invite?token=${inviteToken}`;

    return NextResponse.json({ 
      success: true, 
      message: "Agency provisioned successfully",
      data: {
        companyId: result.company.id,
        inviteLink
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("Provision Company Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
