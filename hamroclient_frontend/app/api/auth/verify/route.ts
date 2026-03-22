import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Accept any credentials and return a mock System Admin user
    return NextResponse.json({
      id: "mock-admin-id",
      name: "Mock Super Admin",
      email: body.email || "admin@mock.com",
      role: "SYSTEM_ADMIN",
      companyId: null,
      branchId: null,
      isProfileComplete: true,
      token: "mock-jwt-token-xyz"
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
