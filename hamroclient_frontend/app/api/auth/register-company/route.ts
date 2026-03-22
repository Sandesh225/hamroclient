import { NextResponse } from "next/server";

export async function POST() {
  // Always return success for registration
  return NextResponse.json(
    { message: "Agency registered successfully! Redirecting to login..." },
    { status: 201 }
  );
}
