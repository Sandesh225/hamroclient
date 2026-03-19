import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country") || "ALL"; // e.g., JAPAN, UAE, QATAR, AUSTRALIA, USA, OTHER
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const search = searchParams.get("search")?.trim().toLowerCase() || "";
  const skip = (page - 1) * limit;

  const role = token.role as string;
  const branchId = token.branchId as string | undefined;

  try {
    // ── Build Where Clauses ──
    const baseWhere: any = {};
    if (role === "STAFF" && branchId) {
      baseWhere.branchId = branchId;
    }
    
    // Country Filter
    if (country && country !== "ALL") {
      baseWhere.destinationCountry = {
        equals: country,
        mode: "insensitive",
      };
    }

    // Search Filter (Applicant Name or Passport)
    if (search) {
      baseWhere.applicant = {
        OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { passportNumber: { contains: search, mode: "insensitive" } },
        ]
      };
    }

    // ── Execute Queries in Parallel ──
    const [
      applications,
      totalCount,
      activeCount,
      deployedCount,
      rejectedCount
    ] = await Promise.all([
      // 1. Paginated Data
      prisma.application.findMany({
        where: baseWhere,
        include: {
          applicant: {
            select: { id: true, fullName: true, passportNumber: true, type: true }
          },
          agent: {
            select: { id: true, name: true }
          }
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      // 2. Metrics (Stats)
      prisma.application.count({ where: baseWhere }),
      prisma.application.count({ 
        where: { 
          ...baseWhere, 
          status: { 
            notIn: ["DEPLOYED", "REJECTED", "COMPLETED", "CANCELLED"] 
          } 
        } 
      }),
      prisma.application.count({ 
        where: { ...baseWhere, status: "DEPLOYED" } 
      }),
      prisma.application.count({ 
        where: { ...baseWhere, status: "REJECTED" } 
      })
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        total: totalCount,
        active: activeCount,
        deployed: deployedCount,
        rejected: rejectedCount,
      },
      data: applications,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error) {
    console.error("GET By Country Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch country applications" },
      { status: 500 }
    );
  }
}
