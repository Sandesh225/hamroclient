"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function getApplications(page = 1, limit = 50) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized: No active session." };
  }

  const { role, branchId } = session.user;
  const skip = (page - 1) * limit;

  try {
    // If the user is STAFF, construct a where clause to enforce Row-Level-Security
    const whereClause = role === "STAFF" && branchId ? { branchId } : {};

    // Fetch both the paginated data and the total count concurrently
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
      prisma.application.count({ where: whereClause })
    ]);

    return { 
      success: true, 
      data: applications,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  } catch (error) {
    console.error("Error fetching applications:", error);
    return { success: false, error: "Failed to fetch applications. Please try again." };
  }
}
