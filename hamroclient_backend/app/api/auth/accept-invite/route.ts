import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { decode } from "next-auth/jwt";
import { hash } from "bcryptjs";
import { z } from "zod";

const acceptInviteSchema = z.object({
  token: z.string(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(5, "Phone is required"),
  address: z.string().min(2, "Address is required"),
  city: z.string().min(2, "City is required"),
  emergencyContactName: z.string().min(2, "Emergency Contact Name is required"),
  emergencyContactPhone: z.string().min(5, "Emergency Contact Phone is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password, name, phone, address, city, emergencyContactName, emergencyContactPhone } = acceptInviteSchema.parse(body);

    const secret = process.env.NEXTAUTH_SECRET || "fallback_secret";
    const decoded = await decode({ token, secret });

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ success: false, error: "Invalid or expired invite link" }, { status: 400 });
    }

    const passwordHash = await hash(password, 10);

    // Run transaction to update both User and StaffProfile
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: decoded.userId as string },
        data: {
          name,
          passwordHash,
          isProfileComplete: true,
        },
      });

      await tx.staffProfile.upsert({
        where: { userId: decoded.userId as string },
        update: {
          phone,
          address,
          city,
          emergencyContactName,
          emergencyContactPhone,
        },
        create: {
          userId: decoded.userId as string,
          phone,
          address,
          city,
          emergencyContactName,
          emergencyContactPhone,
        },
      });
    });

    return NextResponse.json({ success: true, message: "Account setup successfully complete" });

  } catch (error) {
    console.error("Accept Invite Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Invalid or expired link" }, { status: 400 });
  }
}

