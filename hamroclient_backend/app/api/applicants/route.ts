import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createApplicantSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  passportNumber: z.string().min(1, "Passport number is required"),
  type: z.enum(["STUDENT", "WORKER", "VISITOR", "BUSINESS", "DEPENDENT", "OTHER"]),
  // Identity
  dateOfBirth: z.coerce.date().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  placeOfBirth: z.string().optional(),
  maritalStatus: z.string().optional(),
  religion: z.string().optional(),
  nationalIdNumber: z.string().optional(),
  fathersName: z.string().optional(),
  mothersName: z.string().optional(),
  bloodGroup: z.string().optional(),
  // Passport
  placeOfIssue: z.string().optional(),
  issuingCountry: z.string().optional(),
  passportIssueDate: z.coerce.date().optional(),
  passportExpiryDate: z.coerce.date().optional(),
  // Contact
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  permanentAddress: z.string().optional(),
  currentAddress: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  // Background
  skills: z.array(z.string()).optional(),
  previousTravelHistory: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({ success: false, error: "Unauthorized: Invalid or missing token." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = createApplicantSchema.parse(body);

    const newApplicant = await prisma.applicant.create({
      data: {
        fullName: validatedData.fullName,
        passportNumber: validatedData.passportNumber,
        type: validatedData.type,
        // Identity
        dateOfBirth: validatedData.dateOfBirth,
        gender: validatedData.gender,
        nationality: validatedData.nationality,
        placeOfBirth: validatedData.placeOfBirth,
        maritalStatus: validatedData.maritalStatus,
        religion: validatedData.religion,
        nationalIdNumber: validatedData.nationalIdNumber,
        fathersName: validatedData.fathersName,
        mothersName: validatedData.mothersName,
        bloodGroup: validatedData.bloodGroup,
        // Passport
        placeOfIssue: validatedData.placeOfIssue,
        issuingCountry: validatedData.issuingCountry,
        passportIssueDate: validatedData.passportIssueDate,
        passportExpiryDate: validatedData.passportExpiryDate,
        // Contact
        phone: validatedData.phone,
        email: validatedData.email || null,
        permanentAddress: validatedData.permanentAddress,
        currentAddress: validatedData.currentAddress,
        emergencyContactName: validatedData.emergencyContactName,
        emergencyContactRelation: validatedData.emergencyContactRelation,
        emergencyContactPhone: validatedData.emergencyContactPhone,
        // Background
        skills: validatedData.skills || [],
        previousTravelHistory: validatedData.previousTravelHistory || [],
      },
    });

    return NextResponse.json({ success: true, data: newApplicant }, { status: 201 });
  } catch (error) {
    console.error("Error creating applicant POST:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid input data provided." }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to create applicant." }, { status: 500 });
  }
}
