import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, subDays, format } from "date-fns";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAdmin = token?.role === "SYSTEM_ADMIN" || token?.role === "COMPANY_ADMIN";
  
  if (!token || !isAdmin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get("branchId");
  const companyId = token.companyId as string;

  try {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    
    // Base filter for Multi-Tenancy
    const baseFilter: any = {};
    if (token.role === "COMPANY_ADMIN") {
      baseFilter.branch = { companyId };
    }
    if (branchId) {
      baseFilter.branchId = branchId;
    }

    // ── 1. Current Snapshot Totals ──
    const totalApplicants = await prisma.applicant.count({ where: baseFilter });
    const activeApplications = await prisma.application.count({
      where: { 
        ...baseFilter,
        status: { notIn: ["COMPLETED", "CANCELLED", "DEPLOYED", "REJECTED"] } 
      }
    });
    
    const deployedThisMonth = await prisma.application.count({
      where: {
        ...baseFilter,
        status: "DEPLOYED",
        updatedAt: { gte: startOfCurrentMonth }
      }
    });

    const pendingMedical = await prisma.medicalClearance.count({
      where: { 
        applicant: baseFilter,
        status: "PENDING" 
      }
    });

    const visaApprovalsThisMonth = await prisma.application.count({
      where: {
        ...baseFilter,
        status: "PROCESSING",
        updatedAt: { gte: startOfCurrentMonth }
      }
    });

    // Rejection Rate Calculation (Overall)
    const totalProcessed = await prisma.application.count({
      where: { 
        ...baseFilter,
        status: { in: ["REJECTED", "APPROVED", "DEPLOYED", "COMPLETED"] } 
      }
    });
    const totalRejected = await prisma.application.count({ 
      where: { ...baseFilter, status: "REJECTED" } 
    });
    const rejectionRate = totalProcessed > 0 ? Math.round((totalRejected / totalProcessed) * 100) : 0;


    // ── 2. Real KPI Change Calculations (Last 30 days vs Prev 30 days) ──
    const thirtyDaysAgo = subDays(now, 30);
    const sixtyDaysAgo = subDays(now, 60);

    // totalApplicantsChange
    const applicantsLast30 = await prisma.applicant.count({ where: { ...baseFilter, createdAt: { gte: thirtyDaysAgo } } });
    const applicantsPrev30 = await prisma.applicant.count({ where: { ...baseFilter, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } });
    const totalApplicantsChange = applicantsLast30 - applicantsPrev30;

    // activeApplicationsChange
    const activeAppsLast30 = await prisma.application.count({
      where: { ...baseFilter, createdAt: { gte: thirtyDaysAgo }, status: { notIn: ["COMPLETED", "CANCELLED", "DEPLOYED", "REJECTED"] } }
    });
    const activeAppsPrev30 = await prisma.application.count({
      where: { ...baseFilter, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }, status: { notIn: ["COMPLETED", "CANCELLED", "DEPLOYED", "REJECTED"] } }
    });
    const activeApplicationsChange = activeAppsLast30 - activeAppsPrev30;

    // deployedChange
    const deployedLast30 = await prisma.application.count({
      where: { ...baseFilter, status: "DEPLOYED", updatedAt: { gte: thirtyDaysAgo } }
    });
    const deployedPrev30 = await prisma.application.count({
      where: { ...baseFilter, status: "DEPLOYED", updatedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }
    });
    const deployedChange = deployedLast30 - deployedPrev30;

    // pendingMedicalChange
    const pendingMedLast30 = await prisma.medicalClearance.count({
      where: { applicant: baseFilter, status: "PENDING", createdAt: { gte: thirtyDaysAgo } }
    });
    const pendingMedPrev30 = await prisma.medicalClearance.count({
      where: { applicant: baseFilter, status: "PENDING", createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }
    });
    const pendingMedicalChange = pendingMedLast30 - pendingMedPrev30;

    // visaApprovalsChange
    const visaLast30 = await prisma.application.count({
      where: { ...baseFilter, status: "PROCESSING", updatedAt: { gte: thirtyDaysAgo } }
    });
    const visaPrev30 = await prisma.application.count({
      where: { ...baseFilter, status: "PROCESSING", updatedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }
    });
    const visaApprovalsChange = visaLast30 - visaPrev30;

    // rejectionRateChange
    const rejectRateLast30 = await (async () => {
      const p = await prisma.application.count({ where: { ...baseFilter, status: { in: ["REJECTED", "APPROVED", "DEPLOYED", "COMPLETED"] }, updatedAt: { gte: thirtyDaysAgo } } });
      const r = await prisma.application.count({ where: { ...baseFilter, status: "REJECTED", updatedAt: { gte: thirtyDaysAgo } } });
      return p > 0 ? (r / p) * 100 : 0;
    })();
    const rejectRatePrev30 = await (async () => {
      const p = await prisma.application.count({ where: { ...baseFilter, status: { in: ["REJECTED", "APPROVED", "DEPLOYED", "COMPLETED"] }, updatedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } });
      const r = await prisma.application.count({ where: { ...baseFilter, status: "REJECTED", updatedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } });
      return p > 0 ? (r / p) * 100 : 0;
    })();
    const rejectionRateChange = Math.round(rejectRateLast30 - rejectRatePrev30);


    // ── 3. Distributions & Feeds ──
    const statusGroups = await prisma.application.groupBy({
      where: baseFilter,
      by: ["status"],
      _count: true,
    });
    const statusDistribution = statusGroups.map((g) => ({
      status: g.status,
      count: g._count,
    }));

    const allAppsForCountry = await prisma.application.findMany({ 
      where: baseFilter,
      select: { destinationCountry: true, status: true } 
    });
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

    const monthlyDeployments = [];
    for (let i = 5; i >= 0; i--) {
      const mDate = subMonths(now, i);
      const start = startOfMonth(mDate);
      const end = endOfMonth(mDate);
      
      const count = await prisma.application.count({
        where: {
          ...baseFilter,
          status: "DEPLOYED",
          updatedAt: { gte: start, lte: end }
        }
      });
      const apps = await prisma.application.count({
        where: {
          ...baseFilter,
          createdAt: { gte: start, lte: end }
        }
      });
      monthlyDeployments.push({ month: format(mDate, "MMM"), count, apps });
    }

    const recentActivityRaw = await prisma.note.findMany({
      where: { 
        applicant: baseFilter,
        type: "UPDATE" 
      },
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

    const expiringMedical = await prisma.medicalClearance.findMany({
      where: {
        applicant: baseFilter,
        expiryDate: { lte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), gte: now }
      },
      include: { applicant: { select: { id: true, fullName: true } } },
      take: 5
    });

    const alerts = expiringMedical.map(m => ({
      id: m.id,
      type: "expiry" as const,
      title: "Medical Expiring Soon",
      description: `Medical report for ${m.applicant.fullName} expires on ${m.expiryDate?.toLocaleDateString()}`,
      applicantId: m.applicant.id,
      applicantName: m.applicant.fullName,
      severity: "high" as const
    }));

    // ── 4. Return Payload ──
    return NextResponse.json({
      stats: {
        totalApplicants,
        activeApplications,
        deployedThisMonth,
        pendingMedical,
        visaApprovalsThisMonth,
        rejectionRate,
        totalApplicantsChange,
        activeApplicationsChange,
        deployedChange,
        pendingMedicalChange,
        visaApprovalsChange,
        rejectionRateChange,
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
