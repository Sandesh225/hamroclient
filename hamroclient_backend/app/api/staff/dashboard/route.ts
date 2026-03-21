import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

// ── Types for strict response shape ──
interface StaffMetrics {
  applicationsRegisteredThisWeek: number;
  missingDocuments: number;
  pendingDecisions: number;
  activeApplicants: number;
}

interface RecentApplicant {
  id: string;
  fullName: string;
  passportNumber: string;
  type: string;
  latestStatus: string;
  destinationCountry: string | null;
  updatedAt: string;
}

interface UrgentTask {
  id: string;
  type: string;
  title: string;
  description: string;
  applicantId: string;
  applicantName: string;
  priority: "high" | "medium" | "low";
  createdAt: string;
}

interface StaffDashboardResponse {
  metrics: StaffMetrics;
  recentApplicants: RecentApplicant[];
  urgentTasks: UrgentTask[];
}

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const staffUserId = token.id as string;

  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    // ── All metrics scoped to the logged-in staff member ──
    const [
      applicationsRegisteredThisWeek,
      missingDocuments,
      pendingDecisions,
      activeApplicants,
    ] = await Promise.all([
      prisma.application.count({
        where: {
          userId: staffUserId,
          createdAt: { gte: oneWeekAgo },
        },
      }),
      prisma.document.count({
        where: {
          application: { userId: staffUserId },
          isVerified: false,
        },
      }),
      prisma.application.count({
        where: {
          userId: staffUserId,
          status: { in: ["VISA_SUBMITTED", "MEDICAL_PENDING"] },
        },
      }),
      prisma.application.count({
        where: {
          userId: staffUserId,
          status: { notIn: ["COMPLETED", "CANCELLED", "DEPLOYED", "REJECTED"] },
        },
      }),
    ]);

    // ── Recent Applicants: ONLY those with applications assigned to this staff ──
    const recentApplicantsRaw = await prisma.applicant.findMany({
      where: {
        applications: {
          some: {
            userId: staffUserId,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        applications: {
          where: { userId: staffUserId },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    const recentApplicants: RecentApplicant[] = recentApplicantsRaw.map(
      (app) => ({
        id: app.id,
        fullName: app.fullName,
        passportNumber: app.passportNumber,
        type: app.type,
        latestStatus: app.applications[0]?.status || "PENDING",
        destinationCountry:
          app.applications[0]?.destinationCountry || null,
        updatedAt: app.updatedAt.toISOString(),
      })
    );

    // ── Urgent Tasks: stalled applications assigned to THIS staff member ──
    const stalledApps = await prisma.application.findMany({
      where: {
        userId: staffUserId,
        status: "PENDING",
        updatedAt: { lte: threeDaysAgo },
      },
      include: {
        applicant: { select: { id: true, fullName: true } },
      },
      take: 5,
    });

    const urgentTasks: UrgentTask[] = stalledApps.map((app) => ({
      id: `task-${app.id}`,
      type: "follow_up",
      title: "Stalled Application",
      description: `${app.applicant.fullName}'s application has been PENDING for over 3 days.`,
      applicantId: app.applicant.id,
      applicantName: app.applicant.fullName,
      priority: "medium" as const,
      createdAt: app.updatedAt.toISOString(),
    }));

    // ── Expiring documents assigned to this staff's applicants ──
    const expiringDocs = await prisma.document.findMany({
      where: {
        application: { userId: staffUserId },
        expiryDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // within 30 days
          gte: new Date(), // not yet expired
        },
      },
      include: {
        applicant: { select: { id: true, fullName: true } },
      },
      take: 5,
    });

    const expiringTasks: UrgentTask[] = expiringDocs.map((doc) => ({
      id: `expiry-${doc.id}`,
      type: "expiring",
      title: `Document Expiring: ${doc.title}`,
      description: `${doc.applicant.fullName}'s ${doc.title} expires on ${doc.expiryDate!.toLocaleDateString()}.`,
      applicantId: doc.applicant.id,
      applicantName: doc.applicant.fullName,
      priority: "high" as const,
      createdAt: doc.createdAt.toISOString(),
    }));

    // Merge and sort urgent tasks by priority (high first) then by date
    const allUrgentTasks = [...expiringTasks, ...urgentTasks].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    const response: StaffDashboardResponse = {
      metrics: {
        applicationsRegisteredThisWeek,
        missingDocuments,
        pendingDecisions,
        activeApplicants,
      },
      recentApplicants,
      urgentTasks: allUrgentTasks,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET Staff Dashboard Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch staff dashboard" },
      { status: 500 }
    );
  }
}
