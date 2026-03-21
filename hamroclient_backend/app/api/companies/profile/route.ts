import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
  registrationNumber: z.string().optional(),
  website: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let companyIdToFetch = token.companyId as string;

    if (token.role === "SYSTEM_ADMIN") {
      const firstCompany = await prisma.company.findFirst();
      if (!firstCompany) {
        return NextResponse.json({ success: false, error: "No company found" }, { status: 404 });
      }
      companyIdToFetch = firstCompany.id;
    } else if (!token.companyId) {
      return NextResponse.json({ success: false, error: "Missing company context" }, { status: 401 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyIdToFetch },
    });

    if (!company) {
      return NextResponse.json({ success: false, error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: company });
  } catch (error) {
    console.error("Fetch Company Profile Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch company profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "COMPANY_ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden: Company Admins only" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = updateProfileSchema.parse(body);

    const updatedCompany = await prisma.company.update({
      where: { id: token.companyId as string },
      data: {
        businessName: validatedData.businessName,
        address: validatedData.address,
        contactPhone: validatedData.phone,
        contactEmail: validatedData.email,
        registrationNumber: validatedData.registrationNumber,
        website: validatedData.website,
      },
    });

    return NextResponse.json({ success: true, data: updatedCompany });
  } catch (error: any) {
    console.error("Update Company Profile Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
