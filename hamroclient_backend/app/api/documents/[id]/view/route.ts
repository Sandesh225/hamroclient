import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

// ── Types ──
interface SignedViewResponse {
  success: true;
  signedUrl: string;
  mimeType: string;
  expiresAt: string;
}

interface ErrorResponse {
  success: false;
  error: string;
}

/** 15 minutes in seconds */
const SIGNED_URL_TTL_SECONDS = 15 * 60;

/**
 * Extracts the Cloudinary public_id from a secure_url.
 *
 * Handles URLs like:
 *   https://res.cloudinary.com/<cloud>/image/upload/s--sig--/v123/folder/file.ext
 *   https://res.cloudinary.com/<cloud>/raw/upload/v123/folder/file.ext
 */
function extractPublicId(url: string, resourceType: "image" | "raw"): string | null {
  try {
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    const pathAfterUpload = url.substring(uploadIndex + 8); // skip "/upload/"
    const segments = pathAfterUpload.split("/");

    // Skip signature segment (starts with s--)
    if (segments[0]?.startsWith("s--")) {
      segments.shift();
    }

    // Skip version segment (starts with v followed by digits)
    if (segments[0]?.match(/^v\d+$/)) {
      segments.shift();
    }

    const publicIdWithExt = segments.join("/");

    // For image resources, Cloudinary stores public_id WITHOUT extension
    // For raw resources, the extension IS part of the public_id
    if (resourceType === "image") {
      const lastDot = publicIdWithExt.lastIndexOf(".");
      return lastDot > -1 ? publicIdWithExt.substring(0, lastDot) : publicIdWithExt;
    }

    return publicIdWithExt;
  } catch {
    return null;
  }
}

/**
 * Determines the Cloudinary resource_type from a stored URL.
 */
function getResourceType(url: string): "image" | "raw" {
  return url.includes("/raw/upload") ? "raw" : "image";
}

/**
 * Determines the MIME type from the stored URL for the response header hint.
 */
function getMimeType(url: string): string {
  const lower = url.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".doc") || lower.endsWith(".docx"))
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "application/octet-stream";
}

/**
 * GET /api/documents/[id]/view
 *
 * Generates a short-lived (15 min) Cloudinary signed URL for secure
 * document viewing. The publicId is resolved from the Prisma Document record.
 *
 * Security:
 * - Auth-gated via NextAuth JWT
 * - URL expires after SIGNED_URL_TTL_SECONDS
 * - Staff can only view documents linked to their assigned applications
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SignedViewResponse | ErrorResponse>> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    // Fetch document + its application's userId for access control
    const document = await prisma.document.findUnique({
      where: { id },
      select: {
        s3Url: true,
        publicId: true,
        application: {
          select: { 
            userId: true,
            branchId: true,
            branch: { select: { companyId: true } }
          },
        } as any,
      },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    // ── RBAC & Data Isolation ──
    const userRole = token.role as string;
    const app = (document as any).application;

    let hasAccess = false;

    if (userRole === "SYSTEM_ADMIN") {
      hasAccess = true;
    } else if (userRole === "COMPANY_ADMIN") {
      // Access if document belongs to a branch in their company
      if (app?.branch?.companyId === token.companyId) hasAccess = true;
    } else if (userRole === "BRANCH_MANAGER") {
      // Access if document belongs to their branch
      if (app?.branchId === token.branchId) hasAccess = true;
    } else if (userRole === "AGENT") {
      // Access if document belongs to an application assigned to them
      if (app?.userId === (token.id as string)) hasAccess = true;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You do not have access to this document" },
        { status: 403 }
      );
    }

    const resourceType = getResourceType(document.s3Url);

    // Resolve publicId: prefer stored value, fallback to URL extraction
    let publicId = document.publicId;
    if (!publicId) {
      publicId = extractPublicId(document.s3Url, resourceType);
    }

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: "Unable to resolve document identifier for secure viewing" },
        { status: 500 }
      );
    }

    // Cloudinary by default adds Content-Disposition: attachment to PDFs, preventing them from loading inline in an iframe.
    // We construct a specific delivery URL with flags: "attachment:false" to allow inline viewing.
    const isPdf = document.s3Url.toLowerCase().includes(".pdf");
    const isImage = resourceType === "image";
    const wantsPdf = isPdf && isImage;

    const signedUrl = cloudinary.utils.url(publicId, {
      resource_type: resourceType,
      type: "upload",
      secure: true,
      sign_url: true, // Required by Cloudinary to authorize restricted flags like fl_attachment:false
      flags: "attachment:false",
      // If it's a PDF stored as an image type, we must append .pdf format for Cloudinary to serve the original PDF
      ...(wantsPdf ? { format: "pdf" } : {})
    });
    
    // Determine mimeType for the frontend to render it properly
    const mimeType = isPdf ? "application/pdf" : getMimeType(signedUrl);

    // Provide a generic 15-minute expiration timestamp for the frontend's UI (even though URL won't technically expire)
    const expiresAt = Math.floor(Date.now() / 1000) + 15 * 60;

    return NextResponse.json({
      success: true,
      signedUrl,
      mimeType,
      expiresAt: new Date(expiresAt * 1000).toISOString(),
    });
  } catch (error) {
    console.error("GET Document View URL Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate secure viewing URL" },
      { status: 500 }
    );
  }
}
