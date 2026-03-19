import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();

    const allowedFields = [
      "destinationCountry",
      "visaType",
      "jobPosition",
      "employerAbroad",
      "applicationDate",
      "submissionDate",
      "approvalDate",
    ];

    const updateData: Record<string, any> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        if (["applicationDate", "submissionDate", "approvalDate"].includes(key) && body[key]) {
          updateData[key] = new Date(body[key]);
        } else {
          updateData[key] = body[key];
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH Application Error:", error);
    return NextResponse.json({ success: false, error: "Failed to update application" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    
    // Check if the application exists and get applicantId to invalidate properly if needed
    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) {
       return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }

    await prisma.application.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    console.error("DELETE Application Error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete application" }, { status: 500 });
  }
}
