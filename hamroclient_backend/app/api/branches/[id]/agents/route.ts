import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const branchId = params.id;

    // Optional: Verify the branch belongs to the user's company
    if (token.role !== "SYSTEM_ADMIN" && token.companyId) {
      const branch = await prisma.branch.findFirst({
        where: { id: branchId, companyId: token.companyId as string }
      });
      if (!branch) return NextResponse.json({ error: "Branch not found or access denied" }, { status: 403 });
    }

    const agents = await prisma.user.findMany({
      where: {
        branchId,
        role: "AGENT",
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: agents });
  } catch (error) {
    console.error("GET Branch Agents Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
