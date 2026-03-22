import { NextResponse } from "next/server";

const mockBranches = [
  {
    id: "branch-1",
    name: "Kathmandu Main Branch",
    location: "Kantipath, Kathmandu",
    company: { businessName: "Everest Manpower Services" },
    users: [
      { id: "mgr-1", name: "Ramesh Sharma", email: "ramesh.s@everest.test", role: "BRANCH_MANAGER", isProfileComplete: true }
    ],
    _count: { applicants: 45, applications: 38 }
  },
  {
    id: "branch-2",
    name: "Pokhara Branch",
    location: "Lakeside, Pokhara",
    company: { businessName: "Gorkha Recruitment Agency" },
    users: [
      { id: "mgr-2", name: "Sita Gurung", email: "sita.g@gorkha.test", role: "BRANCH_MANAGER", isProfileComplete: true }
    ],
    _count: { applicants: 20, applications: 15 }
  }
];

export async function GET() {
  return NextResponse.json(mockBranches);
}
