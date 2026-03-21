import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod";

const companyRegistrationSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  registrationNumber: z.string().optional(),
  adminName: z.string().min(2, "Admin name must be at least 2 characters"),
  adminEmail: z.string().email("Invalid email address"),
  adminPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyName, registrationNumber, adminName, adminEmail, adminPassword } = companyRegistrationSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    const corsHeaders = {
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Credentials": "true",
    };

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400, headers: corsHeaders });
    }

    const passwordHash = await hash(adminPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          businessName: companyName,
          registrationNumber: registrationNumber || null,
        },
      });

      const branch = await tx.branch.create({
        data: {
          name: "Head Office",
          companyId: company.id,
        },
      });

      const user = await tx.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          passwordHash,
          role: "COMPANY_ADMIN",
          companyId: company.id,
          branchId: branch.id,
          isProfileComplete: false,
        },
      });

      return { company, branch, user };
    });

    return NextResponse.json({ 
      message: "Company and initial Admin registered successfully",
      company: result.company,
      user: { id: result.user.id, email: result.user.email, name: result.user.name, role: result.user.role }
    }, { status: 201, headers: corsHeaders });

  } catch (error: any) {
    console.error("Company Registration Error:", error);
    
    const corsHeaders = {
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Credentials": "true",
    };

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400, headers: corsHeaders });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}
