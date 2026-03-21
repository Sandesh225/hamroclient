import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { z } from "zod";

// ── Query Params Schema ──
const listQuerySchema = z.object({
  search: z.string().default(""),
  country: z.string().default(""),
  status: z.string().default(""),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ── GET: List Applicants ──
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const params = listQuerySchema.parse(Object.fromEntries(searchParams));
    const { search, country, status, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { passportNumber: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    // ── RBAC & Data Isolation ──
    const userRole = token.role as string;

    if (userRole === "SYSTEM_ADMIN") {
      // System Admins see everything
    } else if (userRole === "COMPANY_ADMIN") {
      // Company Admins see all applicants in all branches of their company
      where.branch = {
        companyId: token.companyId as string,
      };
    } else if (userRole === "BRANCH_MANAGER") {
      // Branch Managers see all applicants in their specific branch
      where.branchId = token.branchId as string;
    } else if (userRole === "AGENT") {
      // Agents only see applicants assigned to them
      where.assignedToId = token.id as string;
    } else {
      // Default to no access or limited access
      return NextResponse.json({ success: false, error: "Access Denied: Invalid Role" }, { status: 403 });
    }

    // Additional filters (country, status)
    if (country || status) {
      where.applications = {
        some: {
          ...(country && { destinationCountry: country }),
          ...(status && { status: status as any }),
        },
      };
    }

    const [applicants, total] = await Promise.all([
      prisma.applicant.findMany({
        where,
        include: {
          applications: {
            orderBy: { createdAt: "desc" },
            take: 1, // Get the latest application
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.applicant.count({ where }),
    ]);

    // Map to frontend expected shape
    const data = applicants.map((app) => {
      const latestApp = app.applications[0];
      return {
        id: app.id,
        fullName: app.fullName,
        passportNumber: app.passportNumber,
        phone: app.phone,
        type: app.type,
        destinationCountry: latestApp?.destinationCountry || null,
        visaType: latestApp?.visaType || null,
        jobPosition: latestApp?.jobPosition || null,
        latestStatus: latestApp?.status || "PENDING",
        updatedAt: app.updatedAt,
      };
    });

    return NextResponse.json({ success: true, data, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("GET Applicants Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch applicants" }, { status: 500 });
  }
}

// ── POST: Create Applicant (8-Step Wizard) ──
export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  // Ensure we have a branch to assign the applicant to.
  // Precedence: token.branchId -> dbUser.branchId -> Error
  let activeBranchId = (token.branchId as string) || null;

  if (!activeBranchId) {
    const dbUser = await prisma.user.findUnique({ where: { email: token.email! }, select: { branchId: true } });
    activeBranchId = dbUser?.branchId || null;
  }
  
  if (!activeBranchId) {
    return NextResponse.json({ success: false, error: "No branch context found for user. Please contact administrator." }, { status: 400 });
  }

  try {
    const payload = await req.json();

    // The frontend sends everything flat, let's map it to Prisma nested structures.
    const newApplicant = await prisma.$transaction(async (tx) => {
      // 1. Create Applicant
      const applicant = await tx.applicant.create({
        data: {
          fullName: payload.fullName,
          type: "WORKER", // Default for manpower
          dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : null,
          gender: payload.gender || null,
          nationality: payload.nationality || null,
          placeOfBirth: payload.placeOfBirth || null,
          maritalStatus: payload.maritalStatus || null,
          religion: payload.religion || null,
          nationalIdNumber: payload.nationalIdNumber || null,
          bloodGroup: payload.bloodGroup || null,
          heightCm: payload.height ? parseInt(payload.height) : null,
          weightKg: payload.weight ? parseFloat(payload.weight) : null,
          passportNumber: payload.passportNumber,
          passportIssueDate: payload.passportIssueDate ? new Date(payload.passportIssueDate) : null,
          passportExpiryDate: payload.passportExpiryDate ? new Date(payload.passportExpiryDate) : null,
          issuingCountry: payload.passportIssuingCountry || null,
          phone: payload.mobile || null,
          email: payload.email || null,
          homeAddress: payload.homeAddress || null,
          city: payload.city || null,
          province: payload.province || null,
          postalCode: payload.postalCode || null,
          emergencyContactName: payload.emergencyContactName || null,
          emergencyContactRelation: payload.emergencyContactRelationship || payload.emergencyRelationship || null,
          emergencyContactPhone: payload.emergencyPhone || null,
          skills: payload.technicalSkills ? payload.technicalSkills.split(",").map((s: string) => s.trim()) : [],
          primaryLanguage: payload.primaryLanguage || null,
          englishProficiency: payload.englishProficiency || null,
          
          // Assignment
          branchId: activeBranchId,
          assignedToId: token.role === "AGENT" ? (token.id as string) : null,
          
          // Education Relation
          education: {
            create: (payload.education || []).map((edu: any) => ({
              level: getEducationLevel(edu.level),
              degreeTitle: edu.degreeTitle || null,
              institution: edu.institution || null,
              graduationYear: edu.graduationYear ? parseInt(edu.graduationYear) : null,
              attestationStatus: getAttestationStatus(edu.attestationStatus),
            })),
          },

          // Employment Relation
          employment: {
            create: (payload.employment || []).map((emp: any) => ({
              employerName: emp.employer,
              jobTitle: emp.jobTitle || null,
              fromDate: emp.fromDate ? new Date(emp.fromDate) : null,
              toDate: emp.toDate && !emp.isCurrent ? new Date(emp.toDate) : null,
              isCurrent: emp.isCurrent || false,
            })),
          },
        },
      });

      // 2. Add Language Test if provided
      if (payload.languageTestType && payload.languageTestType !== "None") {
        await tx.languageTest.create({
          data: {
            applicantId: applicant.id,
            testType: getLanguageTestType(payload.languageTestType),
            overallScore: payload.testScore ? parseFloat(payload.testScore) : null,
            testDate: payload.testDate ? new Date(payload.testDate) : null,
          },
        });
      }

      // 3. Create initial Application if Destination Country is selected
      if (payload.destinationCountry) {
        await tx.application.create({
          data: {
            applicantId: applicant.id,
            branchId: activeBranchId,
            userId: token.id as string, // assigned to creator
            status: "DOCUMENTATION_GATHERING", // Starting point
            destinationCountry: payload.destinationCountry,
            visaType: payload.visaType || null,
            jobPosition: payload.positionApplied || null,
            employerAbroad: payload.employerAbroad || null,
            salaryOffered: payload.salaryOffered ? parseFloat(payload.salaryOffered) : null,
            salaryCurrency: payload.currency || null,
            contractDurationMonths: payload.contractDuration ? parseInt(payload.contractDuration) : null,
            expectedDeploymentDate: payload.expectedDeploymentDate ? new Date(payload.expectedDeploymentDate) : null,
            agencyFee: payload.agencyFee ? parseFloat(payload.agencyFee) : null,
            remarks: payload.notes || null,
          },
        });
      }

      // 4. Create initial Note with general remarks
      if (payload.notes) {
        await tx.note.create({
          data: {
            applicantId: applicant.id,
            text: `Applicant registered via Wizard. Initial Notes: ${payload.notes}`,
            createdById: token.id as string,
            type: "GENERAL",
          },
        });
      }

      return applicant;
    });

    return NextResponse.json({ success: true, data: { id: newApplicant.id } }, { status: 201 });
  } catch (error: any) {
    console.error("POST Applicant Wizard Error:", error);
    // Handle unique constraint (e.g. passport or email already exists)
    if (error.code === 'P2002') {
       return NextResponse.json({ success: false, error: `A record with this ${error.meta?.target?.[0]} already exists.` }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: "Failed to create applicant.", details: error.message }, { status: 500 });
  }
}

// ── Enum Mappers ──
function getEducationLevel(level: string) {
  const map: Record<string, any> = {
    "Secondary (SLC/SEE)": "SECONDARY",
    "Higher Secondary (+2)": "SECONDARY",
    "Diploma": "DIPLOMA",
    "Bachelor's": "BACHELOR",
    "Master's": "MASTER",
    "PhD": "PHD",
  };
  return map[level] || "SECONDARY";
}

function getAttestationStatus(status: string) {
  if (status === "Attested") return "COMPLETE";
  if (status === "Pending") return "NONE";
  return "NONE";
}

function getLanguageTestType(type: string): any {
  const valid = ["IELTS", "PTE", "TOEFL", "JLPT", "NAT", "OTHER"];
  return valid.includes(type) ? type : "OTHER";
}
