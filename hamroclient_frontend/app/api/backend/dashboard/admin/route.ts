import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    kpis: {
      totalCompanies: 3,
      totalBranches: 6,
      totalUsers: 28,
      activeApplications: 85
    },
    companyActivity: [
      { name: "Everest Manpower Services", _count: { branches: 3, users: 15 } },
      { name: "Himalayan Overseas Pvt Ltd", _count: { branches: 2, users: 8 } },
      { name: "Gorkha Recruitment Agency", _count: { branches: 1, users: 5 } }
    ],
    statusDistribution: [
      { status: "PENDING", count: 25 },
      { status: "PROCESSING", count: 40 },
      { status: "APPROVED", count: 15 },
      { status: "REJECTED", count: 5 }
    ]
  });
}
