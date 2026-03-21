import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { z } from "zod";

const assignSchema = z.object({
  agentId: z.string().uuid("Invalid Agent ID"),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const applicantId = params.id;
    const body = await req.json();
    const { agentId } = assignSchema.parse(body);

    // 1. Fetch the applicant to check branch/company tenancy
    const applicant = await prisma.applicant.findUnique({
      where: { id: applicantId },
      select: { branchId: true }
    });

    if (!applicant) {
      return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
    }

    // 2. Perform RBAC checks
    // Only BRANCH_MANAGER or COMPANY_ADMIN (or SYSTEM_ADMIN) can assign/reassign
    if (!["SYSTEM_ADMIN", "COMPANY_ADMIN", "BRANCH_MANAGER"].includes(token.role as string)) {
      return NextResponse.json({ error: "Forbidden: Only Managers or Admins can assign agents" }, { status: 403 });
    }

    // If BRANCH_MANAGER, check if applicant is in their branch
    if (token.role === "BRANCH_MANAGER" && applicant.branchId !== token.branchId) {
      return NextResponse.json({ error: "Forbidden: You can only assign applicants within your own branch" }, { status: 403 });
    }

    // 3. Verify the target agent exists and is in the same branch/company
    const targetAgent = await prisma.user.findUnique({
      where: { id: agentId },
      select: { role: true, branchId: true, companyId: true }
    });

    if (!targetAgent || targetAgent.role !== "AGENT") {
      return NextResponse.json({ error: "Invalid target agent" }, { status: 400 });
    }

    if (token.role !== "SYSTEM_ADMIN" && targetAgent.companyId !== token.companyId) {
       return NextResponse.json({ error: "Cannot assign to an agent from a different company" }, { status: 403 });
    }

    // 4. Update the assignment
    const updatedApplicant = await prisma.applicant.update({
      where: { id: applicantId },
      data: {
        assignedToId: agentId,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true }
        }
      }
    });

    // 5. Create a note about the assignment
    await prisma.note.create({
      data: {
        applicantId,
        text: `Applicant assigned to agent: ${updatedApplicant.assignedTo?.name}`,
        type: "UPDATE",
        createdById: token.id as string,
      }
    });

    return NextResponse.json({ success: true, data: updatedApplicant });

  } catch (error) {
    console.error("PATCH Assign Applicant Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
