import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getToken } from "next-auth/jwt";

const onboardingSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  emergencyContactName: z.string().min(2, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(10, "Emergency contact phone must be at least 10 characters"),
});

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const corsHeaders = {
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Credentials": "true",
    };

    if (!token || (token.role !== "BRANCH_MANAGER" && token.role !== "AGENT")) {
      return NextResponse.json(
        { error: "Unauthorized: Staff only" },
        { 
          status: 401,
          headers: corsHeaders
        }
      );
    }

    const userId = token.id as string;
    const body = await req.json();
    const validatedData = onboardingSchema.parse(body);

    // Use a single update with nested create for the profile
    // We cast to any to bypass the IDE type issues during development
    const client = prisma as any;
    
    await client.user.update({
      where: { id: userId },
      data: {
        isProfileComplete: true,
        staffProfile: {
          upsert: {
            create: validatedData,
            update: validatedData,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Profile completed successfully" },
      { 
        status: 200,
        headers: corsHeaders
      }
    );

  } catch (error: any) {
    console.error("Onboarding Error:", error);
    
    const corsHeaders = {
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Credentials": "true",
    };

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: (error as any).errors[0].message },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}
