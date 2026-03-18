import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const applications = await prisma.application.findMany({
      where: { applicantId: params.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        destinationCountry: true,
        visaType: true,
        jobPosition: true,
        employerAbroad: true,
        applicationDate: true,
        submissionDate: true,
        approvalDate: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("GET Applicant Applications Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch applications" }, { status: 500 });
  }
}
