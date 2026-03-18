import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const applicant = await prisma.applicant.findUnique({
      where: { id: params.id },
      include: {
        applications: {
          orderBy: { createdAt: "desc" },
        },
        education: {
          orderBy: { graduationYear: "desc" },
        },
        employment: {
          orderBy: { fromDate: "desc" },
        },
        documents: {
          orderBy: { uploadedAt: "desc" },
        },
        notes: {
          orderBy: { createdAt: "desc" },
          include: { createdBy: { select: { name: true } } },
        },
        languageTests: {
          orderBy: { testDate: "desc" },
        },
      },
    });

    if (!applicant) {
      return NextResponse.json({ success: false, error: "Applicant not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: applicant });
  } catch (error) {
    console.error("GET Applicant by ID Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch applicant" }, { status: 500 });
  }
}
