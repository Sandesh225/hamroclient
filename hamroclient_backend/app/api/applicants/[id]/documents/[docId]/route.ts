import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id, docId } = await params;

    // Verify document belongs to this applicant
    const doc = await prisma.document.findFirst({
      where: { id: docId, applicantId: id },
    });

    if (!doc) {
      return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 });
    }

    // Try to delete from Cloudinary (extract public_id from URL)
    try {
      const urlParts = doc.s3Url.split("/");
      const folderAndFile = urlParts.slice(urlParts.indexOf("hamroclient")).join("/");
      const publicId = folderAndFile.replace(/\.[^/.]+$/, ""); // Remove extension
      await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
    } catch (cloudinaryErr) {
      console.warn("Cloudinary delete failed (non-blocking):", cloudinaryErr);
    }

    // Delete from database
    await prisma.document.delete({ where: { id: docId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Document Error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete document" }, { status: 500 });
  }
}
