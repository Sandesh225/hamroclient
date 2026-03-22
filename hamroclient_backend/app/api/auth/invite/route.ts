import { NextRequest, NextResponse } from "next/server";
import { getToken, encode } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { $Enums } from "@prisma/client";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["COMPANY_ADMIN", "BRANCH_MANAGER", "AGENT"]),
  branchId: z.string().uuid("Invalid branch ID"),
  companyId: z.string().uuid("Invalid company ID").optional(),
});

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !["SYSTEM_ADMIN", "COMPANY_ADMIN", "BRANCH_MANAGER"].includes(token.role as string)) {
      return NextResponse.json({ success: false, error: "Forbidden: Not authorized to invite staff" }, { status: 403 });
    }

    const body = await req.json();
    const { email, role, branchId, companyId: bodyCompanyId } = inviteSchema.parse(body);

    const targetCompanyId = token.role === "SYSTEM_ADMIN" ? bodyCompanyId : (token.companyId as string);

    if (!targetCompanyId) {
      return NextResponse.json({ success: false, error: "Company context is required" }, { status: 400 });
    }

    // Security check: If BRANCH_MANAGER, they can only invite to their own branch
    if (token.role === "BRANCH_MANAGER" && branchId !== token.branchId) {
      return NextResponse.json({ success: false, error: "You can only invite staff to your own branch" }, { status: 403 });
    }

    // Security check: Only SYSTEM/COMPANY_ADMIN can invite a BRANCH_MANAGER or COMPANY_ADMIN
    if (token.role === "BRANCH_MANAGER" && role !== "AGENT") {
      return NextResponse.json({ success: false, error: "Branch Managers can only invite Agents" }, { status: 403 });
    }

    // Verify branch belongs to the company
    const branch = await prisma.branch.findFirst({
      where: { 
        id: branchId, 
        companyId: targetCompanyId 
      }
    });

    if (!branch) {
      return NextResponse.json({ success: false, error: "Branch not found or belongs to another company" }, { status: 404 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ success: false, error: "User already exists with this email" }, { status: 400 });
    }

    // Create inactive user
    const user = await prisma.user.create({
      data: {
        email,
        name: "Invited User",
        role: role as $Enums.Role,
        companyId: targetCompanyId,
        branchId,
        isProfileComplete: false,
        passwordHash: null,
      }
    });

    // Create a secure JWE token using NextAuth encode
    const secret = process.env.NEXTAUTH_SECRET || "fallback_secret";
    const inviteToken = await encode({
      token: {
        userId: user.id,
        email: user.email,
        companyId: (user as any).companyId,
        branchId: user.branchId,
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60 // 24 hours
      } as any,
      secret,
    });

    // Generate link
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
    const inviteLink = `${baseUrl}/accept-invite?token=${inviteToken}`;

    return NextResponse.json({ 
      success: true, 
      message: "Invite generated successfully",
      inviteLink 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Invite Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
