import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    
    // Total numbers
    const totalApplicants = await prisma.applicant.count();
    const activeApplications = await prisma.application.count({
      where: { status: { notIn: ["COMPLETED", "CANCELLED", "DEPLOYED", "REJECTED"] } }
    });
    
    const deployedThisMonth = await prisma.application.count({
      where: {
        status: "DEPLOYED",
        updatedAt: { gte: startOfCurrentMonth }
      }
    });

    const pendingMedical = await prisma.medicalClearance.count({
      where: { status: "PENDING" }
    });

    const visaApprovalsThisMonth = await prisma.application.count({
      where: {
        status: "PROCESSING", // or some visa approved stamp
        updatedAt: { gte: startOfCurrentMonth }
      }
    });

    // Rejection Rate Calculation
    const totalProcessed = await prisma.application.count({
      where: { status: { in: ["REJECTED", "APPROVED", "DEPLOYED", "COMPLETED"] } }
    });
    const totalRejected = await prisma.application.count({ where: { status: "REJECTED" } });
    const rejectionRate = totalProcessed > 0 ? Math.round((totalRejected / totalProcessed) * 100) : 0;

    // Grouping for status distribution
    const statusGroups = await prisma.application.groupBy({
      by: ["status"],
      _count: true,
    });
    const statusDistribution = statusGroups.map((g) => ({
      status: g.status,
      count: g._count,
    }));

    // Grouping for country breakdown
    const countryGroups = await prisma.application.groupBy({
      by: ["destinationCountry"],
      _count: true,
    });

    // To get per country active/deployed/rejected, we need individual counts or a more complex query
    // For simplicity, we can fetch all applications and map it out in memory since numbers are manageable
    const allAppsForCountry = await prisma.application.findMany({ select: { destinationCountry: true, status: true } });
    
    const countryMap = new Map<string, any>();
    allAppsForCountry.forEach(app => {
      const c = app.destinationCountry || "Unknown";
      if (!countryMap.has(c)) {
        countryMap.set(c, { country: c, total: 0, active: 0, deployed: 0, rejected: 0 });
      }
      const data = countryMap.get(c)!;
      data.total += 1;
      if (["DEPLOYED", "COMPLETED"].includes(app.status)) data.deployed += 1;
      else if (app.status === "REJECTED") data.rejected += 1;
      else if (app.status !== "CANCELLED") data.active += 1;
    });

    // Monthly Deployments (last 6 months)
    const monthlyDeployments = [];
    for (let i = 5; i >= 0; i--) {
      const mDate = subMonths(now, i);
      const start = startOfMonth(mDate);
      const end = endOfMonth(mDate);
      
      const count = await prisma.application.count({
        where: {
          status: "DEPLOYED",
          updatedAt: { gte: start, lte: end }
        }
      });
      monthlyDeployments.push({ month: format(mDate, "MMM"), count });
    }

    // Recent Activity (Notes that are updates)
    const recentActivityRaw = await prisma.note.findMany({
      where: { type: "UPDATE" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        applicant: { select: { id: true, fullName: true } },
        createdBy: { select: { name: true } }
      }
    });

    const recentActivity = recentActivityRaw.map(n => ({
      id: n.id,
      applicantName: n.applicant.fullName,
      applicantId: n.applicantId,
      action: n.text,
      fromStatus: null,
      toStatus: "Updated",
      changedBy: n.createdBy?.name || "System",
      timestamp: n.createdAt.toISOString()
    }));

    // Alerts (Expiring Medicals)
    const expiringMedical = await prisma.medicalClearance.findMany({
      where: {
        expiryDate: { lte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), gte: now } // Expiring in next 14 days
      },
      include: { applicant: { select: { id: true, fullName: true } } },
      take: 5
    });

    const alerts = expiringMedical.map(m => ({
      id: m.id,
      type: "expiry",
      title: "Medical Expiring Soon",
      description: `Medical report for ${m.applicant.fullName} expires on ${m.expiryDate?.toLocaleDateString()}`,
      applicantId: m.applicant.id,
      applicantName: m.applicant.fullName,
      severity: "high"
    }));

    return NextResponse.json({
      stats: {
        totalApplicants,
        activeApplications,
        deployedThisMonth,
        pendingMedical,
        visaApprovalsThisMonth,
        rejectionRate,
        totalApplicantsChange: 12, // mock diffs for now
        activeApplicationsChange: 5,
        deployedChange: 2,
        pendingMedicalChange: -3,
        visaApprovalsChange: 8,
        rejectionRateChange: -1,
      },
      countryBreakdown: Array.from(countryMap.values()),
      statusDistribution,
      monthlyDeployments,
      recentActivity,
      alerts
    });

  } catch (error) {
    console.error("GET Admin Dashboard Stats Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
