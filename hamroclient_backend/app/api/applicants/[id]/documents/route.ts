import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const documents = await prisma.document.findMany({
      where: { applicantId: id },
      orderBy: { uploadedAt: "desc" },
      select: {
        id: true,
        title: true,
        category: true,
        s3Url: true,
        uploadedAt: true,
        expiryDate: true,
        isVerified: true,
        isAttested: true,
        countrySpecific: true,
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("GET Applicant Documents Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch documents" }, { status: 500 });
  }
}
