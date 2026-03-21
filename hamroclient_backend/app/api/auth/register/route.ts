import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getToken } from "next-auth/jwt";

const staffProvisioningSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["COMPANY_ADMIN", "BRANCH_MANAGER", "AGENT"]).default("AGENT"),
  branchId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Ensure the token exists AND the role is authorized to create staff
    if (!token || (token.role !== "COMPANY_ADMIN" && token.role !== "SYSTEM_ADMIN")) {
      return NextResponse.json({ error: "Forbidden: Company Admins only" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, role, branchId } = staffProvisioningSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    const passwordHash = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        companyId: token.companyId as string | null,
        branchId: branchId || null,
        role, // Use the validated role from the frontend payload
        isProfileComplete: false,
      },
    });

    return NextResponse.json({ 
      message: "User registered successfully",
      user: { id: user.id, email: user.email, name: user.name } 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Registration Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
