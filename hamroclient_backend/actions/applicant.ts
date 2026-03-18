"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
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

export async function createApplicant(data: z.infer<typeof createApplicantSchema>) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized: No active session." };
  }

  try {
    const validatedData = createApplicantSchema.parse(data);

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

    return { success: true, data: newApplicant };
  } catch (error) {
    console.error("Error creating applicant:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input data provided." };
    }
    return { success: false, error: "Failed to create applicant. Please try again." };
  }
}
