import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { z } from "zod";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const notes = await prisma.note.findMany({
      where: { applicantId: params.id },
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("GET Applicant Notes Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = z.object({
      text: z.string().min(1),
      type: z.enum(["GENERAL", "FOLLOW_UP", "WARNING", "UPDATE", "CALL", "EMAIL"]).optional().default("GENERAL"),
    }).parse(body);

    const newNote = await prisma.note.create({
      data: {
        applicantId: params.id,
        text: parsed.text,
        type: parsed.type,
        createdById: token.id as string,
      },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error("POST Applicant Note Error:", error);
    return NextResponse.json({ success: false, error: "Failed to add note" }, { status: 500 });
  }
}
