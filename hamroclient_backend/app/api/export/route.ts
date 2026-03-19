import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "applicants" or "audit"

  try {
    if (type === "audit") {
      const logs = await prisma.note.findMany({
        where: { type: { in: ["UPDATE", "GENERAL"] } },
        include: { applicant: true, createdBy: true },
        orderBy: { createdAt: "desc" },
      });
      const data = logs.map(l => ({
        "Log ID": l.id,
        "Timestamp": l.createdAt.toISOString(),
        "User": l.createdBy?.name || "System",
        "Action Type": l.type,
        "Description": l.text,
        "Applicant Name": l.applicant.fullName,
        "Applicant Passport": l.applicant.passportNumber,
      }));
      return NextResponse.json(data);
    } 
    
    // Default to applicants
    const applicants = await prisma.applicant.findMany({
      include: { applications: { include: { user: true } } }
    });
    
    const data = applicants.map(a => {
      const app = a.applications[0];
      return {
        "Record ID": a.id,
        "Full Name": a.fullName,
        "Type": a.type,
        "Passport Number": a.passportNumber,
        "Phone": a.phone || "",
        "Email": a.email || "",
        "Destination Country": app?.destinationCountry || "",
        "Visa Type": app?.visaType || "",
        "Job Position": app?.jobPosition || "",
        "Application Status": app?.status || "PENDING",
        "Assigned Agent": app?.user?.name || "Unassigned",
        "Created Date": a.createdAt.toISOString(),
        "Last Updated": a.updatedAt.toISOString(),
      };
    });
    return NextResponse.json(data);
  } catch(e) {
    console.error("Export Error:", e);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
