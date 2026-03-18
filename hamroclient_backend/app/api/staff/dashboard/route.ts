import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Top line metrics
    const applicationsLodgedThisWeek = await prisma.application.count({
      where: {
        userId: token.id as string,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    });

    const missingDocuments = await prisma.document.count({
      where: {
        application: { userId: token.id as string },
        isVerified: false
      }
    });

    const pendingDecisions = await prisma.application.count({
      where: {
        userId: token.id as string,
        status: { in: ["VISA_SUBMITTED", "MEDICAL_PENDING"] }
      }
    });

    const activeApplicants = await prisma.application.count({
      where: {
        userId: token.id as string,
        status: { notIn: ["COMPLETED", "CANCELLED", "DEPLOYED", "REJECTED"] }
      }
    });

    // Recent Applicants
    const recentApplicantsRaw = await prisma.applicant.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        applications: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    const recentApplicants = recentApplicantsRaw.map(app => ({
      id: app.id,
      fullName: app.fullName,
      passportNumber: app.passportNumber,
      type: app.type,
      latestStatus: app.applications[0]?.status || "PENDING",
      destinationCountry: app.applications[0]?.destinationCountry || null,
      updatedAt: app.updatedAt.toISOString(),
    }));

    // Urgent Tasks (mock generated from expiring documents or stalled apps)
    // Here we find applications stalled in PENDING for > 3 days
    const stalledApps = await prisma.application.findMany({
      where: {
        userId: token.id as string,
        status: "PENDING",
        updatedAt: { lte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
      },
      include: { applicant: { select: { id: true, fullName: true } } },
      take: 5
    });

    const urgentTasks = stalledApps.map(app => ({
      id: `task-${app.id}`,
      type: "follow_up",
      title: "Stalled Application",
      description: `${app.applicant.fullName}'s application has been PENDING for over 3 days.`,
      applicantId: app.applicant.id,
      applicantName: app.applicant.fullName,
      priority: "medium",
      createdAt: app.updatedAt.toISOString()
    }));

    return NextResponse.json({
      metrics: {
        applicationsLodgedThisWeek,
        missingDocuments,
        pendingDecisions,
        activeApplicants
      },
      recentApplicants,
      urgentTasks
    });

  } catch (error) {
    console.error("GET Staff Dashboard Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch staff dashboard" }, { status: 500 });
  }
}
