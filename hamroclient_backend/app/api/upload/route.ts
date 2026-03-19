import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const applicantId = formData.get("applicantId") as string;
    const title = formData.get("title") as string;
    const category = (formData.get("category") as string) || "OTHER";
    const countrySpecific = formData.get("countrySpecific") as string | null;

    if (!file || !applicantId || !title) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: file, applicantId, title" },
        { status: 400 }
      );
    }

    // Convert file to base64 data URI for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: `hamroclient/documents/${applicantId}`,
      resource_type: "auto", // auto-detect: image, pdf, raw file
      public_id: `${Date.now()}_${title.replace(/\s+/g, "_").replace(/[?#]/g, "")}`,
      // For PDFs/docs, Cloudinary needs resource_type: "raw" but "auto" handles it
    });

    // Create Document record in Prisma
    const document = await prisma.document.create({
      data: {
        applicantId,
        title,
        category: category as any,
        s3Url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        countrySpecific: countrySpecific || null,
        isVerified: false,
        isAttested: false,
      },
    });

    return NextResponse.json({ success: true, data: document }, { status: 201 });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload file", details: error.message },
      { status: 500 }
    );
  }
}
