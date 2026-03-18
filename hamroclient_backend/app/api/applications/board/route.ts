import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    // Determine filters (in real app, use query params)
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country") || undefined;
    const agent = searchParams.get("agent") || undefined;

    const where: any = {};
    if (country) where.destinationCountry = country;
    
    // For STAFF, narrow by branch or user
    if (token.role === "STAFF" && token.branchId) {
      where.branchId = token.branchId;
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        applicant: {
          select: { id: true, fullName: true },
        },
        user: {
          select: { name: true }, // assignedAgent
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Map to BoardApp format expected by frontend
    const data = applications.map((app) => {
      // Calculate days in stage
      const msDiff = Date.now() - new Date(app.updatedAt).getTime();
      const days = Math.floor(msDiff / (1000 * 60 * 60 * 24));

      return {
        id: app.id,
        applicantName: app.applicant.fullName,
        applicantId: app.applicant.id,
        destination: app.destinationCountry || "Unknown",
        jobPosition: app.jobPosition || "Unknown",
        visaType: app.visaType || "Unknown",
        status: app.status,
        daysInStage: days,
        assignedAgent: app.user?.name || "System",
      };
    });

    // Filter by agent name if requested (since it's a relation, easier to map then filter)
    const filteredData = agent ? data.filter(d => d.assignedAgent === agent) : data;

    return NextResponse.json({ success: true, data: filteredData });
  } catch (error) {
    console.error("GET Applications Board Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch board data" }, { status: 500 });
  }
}
