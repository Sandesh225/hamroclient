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
    const applicant = await prisma.applicant.findUnique({
      where: { id },
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();

    // Build a safe update payload — only allow known fields
    const allowedFields = [
      "fullName", "type", "dateOfBirth", "gender", "nationality", "placeOfBirth",
      "maritalStatus", "religion", "nationalIdNumber", "fathersName", "mothersName",
      "bloodGroup", "heightCm", "weightKg",
      "passportNumber", "placeOfIssue", "issuingCountry", "passportIssueDate", "passportExpiryDate",
      "photoUrl", "phone", "email", "permanentAddress", "homeAddress", "currentAddress",
      "city", "province", "postalCode",
      "emergencyContactName", "emergencyContactRelation", "emergencyContactPhone",
      "skills", "primaryLanguage", "englishProficiency", "previousTravelHistory",
    ];

    const updateData: Record<string, any> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        // Handle date fields
        if (["dateOfBirth", "passportIssueDate", "passportExpiryDate"].includes(key) && body[key]) {
          updateData[key] = new Date(body[key]);
        } else if (key === "heightCm" && body[key]) {
          updateData[key] = parseInt(body[key]);
        } else if (key === "weightKg" && body[key]) {
          updateData[key] = parseFloat(body[key]);
        } else {
          updateData[key] = body[key];
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await prisma.applicant.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PATCH Applicant Error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: `A record with this ${error.meta?.target?.[0]} already exists.` },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, error: "Failed to update applicant" }, { status: 500 });
  }
}
