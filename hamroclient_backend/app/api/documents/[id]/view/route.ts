import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

// Helper to extract Cloudinary public_id from a secure URL
function getPublicIdFromUrl(url: string) {
  // Typical Cloudinary URL: 
  // https://res.cloudinary.com/<cloud_name>/image/upload/v123456789/folder/filename.ext
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("DEBUG: Document View Request Headers:", Object.fromEntries(req.headers.entries()));
  console.log("DEBUG: Document View Cookies:", req.cookies.getAll());
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log("DEBUG: Document View Token:", token ? "Found" : "NOT FOUND");
  
  if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    
    const document = await prisma.document.findUnique({
      where: { id },
      select: { s3Url: true, publicId: true }
    });

    if (!document) {
      return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 });
    }

    let publicId = document.publicId;

    // Fallback: If publicId is missing (older records), try to extract from URL
    if (!publicId) {
      try {
        // Find everything after /upload/ and skip the version (v12345/) and signature (s--.../)
        const url = document.s3Url;
        const uploadIndex = url.indexOf("/upload/");
        if (uploadIndex !== -1) {
          const pathAfterUpload = url.substring(uploadIndex + 8); // Skip "/upload/"
          const segments = pathAfterUpload.split("/");
          
          // Skip signature segment (starts with s--)
          if (segments[0].startsWith("s--")) {
            segments.shift();
          }
          
          // Skip version segment (starts with v and followed by numbers)
          if (segments[0].match(/^v\d+$/)) {
            segments.shift();
          }
          
          // The rest is the public_id WITH extension
          const publicIdWithExt = segments.join("/");
          // Remove extension only if it's NOT a raw file (Cloudinary raw files keep extension in public_id)
          // For now, let's keep it simple: if it's an image/pdf, remove extension
          if (url.includes("/image/upload/")) {
             publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf("."));
          } else {
             publicId = publicIdWithExt;
          }
        }
      } catch (e) {
        console.error("Fallback publicId extraction failed:", e);
      }
    }

    if (!publicId) {
       return NextResponse.json({ 
         success: true, 
         signedUrl: document.s3Url,
         mimeType: document.s3Url.endsWith(".pdf") ? "application/pdf" : "image/jpeg"
       });
    }

    const isPdf = document.s3Url.toLowerCase().includes(".pdf");
    const resourceType = document.s3Url.includes("/raw/upload") ? "raw" : "image";

    console.log("DEBUG: Document View - isPdf:", isPdf, "resourceType:", resourceType);

    const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hr
    const signedUrl = cloudinary.utils.url(publicId, {
      sign_url: true,
      secure: true,
      expires_at: expiresAt,
      resource_type: resourceType,
      format: isPdf ? "pdf" : undefined
    });

    console.log("DEBUG: Generated Signed URL:", signedUrl);

    return NextResponse.json({ 
      success: true, 
      signedUrl,
      mimeType: isPdf ? "application/pdf" : "image/jpeg"
    });

  } catch (error) {
    console.error("GET Document View URL Error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate viewing URL" }, { status: 500 });
  }
}
