import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim().toLowerCase() || "";
  const filterAgent = searchParams.get("agent") || "";
  const filterAction = searchParams.get("action") || "";
  
  const role = token.role as string;

  try {
    // Tenant Bouncer for Notes / Audit Log
    const baseWhere: any = {};
    
    // RLS emulation
    if (role === "SYSTEM_ADMIN") {
      // System Admins see everything
    } else if (role === "COMPANY_ADMIN") {
      baseWhere.applicant = { branch: { companyId: token.companyId as string } };
    } else if (role === "BRANCH_MANAGER") {
      baseWhere.applicant = { branchId: token.branchId as string };
    } else if (role === "AGENT") {
      baseWhere.applicant = { assignedToId: token.id as string };
    } else {
      return NextResponse.json({ success: false, error: "Access Denied: Invalid Role" }, { status: 403 });
    }

    // Keyword Search
    if (search) {
      baseWhere.OR = [
        { text: { contains: search, mode: 'insensitive' } },
        { applicant: { fullName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (filterAgent) {
      if (filterAgent === "System") {
        baseWhere.createdById = null;
      } else {
        baseWhere.createdBy = { name: { equals: filterAgent, mode: 'insensitive' } };
      }
    }

    if (filterAction) {
      if (filterAction === "Status Change") baseWhere.type = "UPDATE";
      else if (filterAction === "Note Added") baseWhere.type = "GENERAL";
      else if (filterAction === "Document Upload" || filterAction === "Applicant Created") {
         baseWhere.type = "GENERAL";
      }
    }

    const logs = await prisma.note.findMany({
      where: baseWhere,
      include: {
        applicant: { select: { fullName: true } },
        createdBy: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });

    const formattedLogs = logs.map(log => {
      let action = "Note Added";
      if (log.type === "UPDATE") action = "Status Change";
      else if (log.text.toLowerCase().includes("uploaded")) action = "Document Upload";
      else if (log.text.toLowerCase().includes("registered")) action = "Applicant Created";

      let fromStatus = null;
      let toStatus = null;
      if (action === "Applicant Created") {
         toStatus = "PENDING";
      }

      return {
        id: log.id,
        date: log.createdAt.toISOString(),
        action,
        applicant: log.applicant.fullName,
        changedBy: log.createdBy?.name || "System",
        fromStatus,
        toStatus,
        notes: log.text
      };
    });

    return NextResponse.json({ success: true, data: formattedLogs });

  } catch (error) {
    console.error("GET Audit Log Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch audit log" }, { status: 500 });
  }
}
