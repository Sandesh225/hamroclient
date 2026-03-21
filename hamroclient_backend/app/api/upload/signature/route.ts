import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import cloudinary from "@/lib/cloudinary";

// ── Types ──
interface SignatureResponse {
  success: true;
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

interface ErrorResponse {
  success: false;
  error: string;
}

/**
 * GET /api/upload/signature?applicantId=xxx
 *
 * Generates a Cloudinary signed upload parameter set so the frontend
 * can upload directly to Cloudinary without routing bytes through the server.
 *
 * The signature is valid for ~10 minutes (Cloudinary enforces a timestamp window).
 * The folder is scoped to `hamroclient/documents/<applicantId>`.
 */
export async function GET(
  req: NextRequest
): Promise<NextResponse<SignatureResponse | ErrorResponse>> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const applicantId = searchParams.get("applicantId");

  if (!applicantId) {
    return NextResponse.json(
      { success: false, error: "Missing required param: applicantId" },
      { status: 400 }
    );
  }

  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = `hamroclient/documents/${applicantId}`;

    // Parameters that must be included in the signature
    const paramsToSign = {
      timestamp,
      folder,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      success: true,
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
      apiKey: process.env.CLOUDINARY_API_KEY!,
      folder,
    });
  } catch (error) {
    console.error("Upload Signature Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}
