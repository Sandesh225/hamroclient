import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { $Enums } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = z.object({
      status: z.nativeEnum($Enums.ApplicationStatus),
    }).parse(body);

    const updated = await prisma.$transaction(async (tx) => {
      // Fetch current to audit log it
      const current = await tx.application.findUnique({ where: { id }, select: { status: true, applicantId: true } });
      
      const app = await tx.application.update({
        where: { id },
        data: { status: parsed.status },
      });

      // Automated note injection
      if (current && current.status !== parsed.status) {
        await tx.note.create({
          data: {
            applicantId: current.applicantId,
            type: "UPDATE",
            createdById: token.id as string,
            text: `Application status moved from ${current.status} to ${parsed.status} via Pipeline.`,
          }
        });
      }

      return app;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH Application Status Error:", error);
    return NextResponse.json({ success: false, error: "Failed to update status" }, { status: 500 });
  }
}
