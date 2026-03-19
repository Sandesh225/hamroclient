import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

function getPublicIdFromUrl(url: string) {
  try {
    const parts = url.split("/");
    const filenameWithExt = parts.pop();
    const folder = parts.pop();
    if (!filenameWithExt || !folder) return null;
    const filename = filenameWithExt.split(".")[0];
    return `${folder}/${filename}`;
  } catch (e) {
    return null;
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

    const allowedFields = ["isVerified", "isAttested", "expiryDate", "title", "category", "countrySpecific"];
    const updateData: Record<string, any> = {};

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        if (key === "expiryDate" && body[key]) {
          updateData[key] = new Date(body[key]);
        } else {
          updateData[key] = body[key];
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await prisma.document.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH Document Status Error:", error);
    return NextResponse.json({ success: false, error: "Failed to update document metadata" }, { status: 500 });
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
    const document = await prisma.document.findUnique({ where: { id } });
    
    if (!document) {
       return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 });
    }

    // 1. Determine publicId for Cloudinary deletion
    let publicId = document.publicId;
    if (!publicId) {
      try {
        const url = document.s3Url;
        const uploadIndex = url.indexOf("/upload/");
        if (uploadIndex !== -1) {
          const pathAfterUpload = url.substring(uploadIndex + 8);
          const segments = pathAfterUpload.split("/");
          if (segments[0].startsWith("s--")) segments.shift();
          if (segments[0].match(/^v\d+$/)) segments.shift();
          
          const publicIdWithExt = segments.join("/");
          // For deletion, images/pdfs usually don't need extension if they were upload with "image" type
          // raw files MUST have extension. 
          if (url.includes("/image/upload/")) {
             publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf("."));
          } else {
             publicId = publicIdWithExt;
          }
        }
      } catch (e) {
        console.error("Delete fallback publicId extraction failed:", e);
      }
    }

    if (publicId) {
      const resourceType = document.s3Url.includes("/raw/upload") ? "raw" : "image";
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      } catch (cloudinaryErr) {
        console.error("Cloudinary Deletion Failed:", cloudinaryErr);
      }
    }

    // 2. Delete from Database
    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    console.error("DELETE Document Error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete document completely" }, { status: 500 });
  }
}
