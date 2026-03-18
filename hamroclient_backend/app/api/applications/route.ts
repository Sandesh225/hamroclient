import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({ success: false, error: "Unauthorized: Invalid or missing token." }, { status: 401 });
  }

  // Support pagination via URL parameters
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const skip = (page - 1) * limit;

  const role = token.role as string;
  const branchId = token.branchId as string | undefined;

  try {
    // RLS emulation
    const whereClause = role === "STAFF" && branchId ? { branchId } : {};

    const [applications, totalCount] = await Promise.all([
      prisma.application.findMany({
        where: whereClause,
        include: {
          applicant: true,
          agent: true,
          sponsor: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: skip,
      }),
      prisma.application.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      success: true,
      data: applications,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching applications GET:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch applications." }, { status: 500 });
  }
}
