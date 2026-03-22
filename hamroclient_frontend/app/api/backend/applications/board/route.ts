import { NextResponse } from "next/server";

const mockApplications = [
  {
    id: "app-1",
    status: "PENDING",
    applicant: { fullName: "Aarav Sharma", passportNumber: "P1234567" },
    destinationCountry: "JAPAN",
    jobPosition: "Software Engineer",
    createdAt: new Date().toISOString()
  },
  {
    id: "app-2",
    status: "DOCUMENTATION_GATHERING",
    applicant: { fullName: "Bikash Thapa", passportNumber: "P2345678" },
    destinationCountry: "UAE",
    jobPosition: "Civil Engineer",
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "app-3",
    status: "VERIFICATION",
    applicant: { fullName: "Chandra Gurung", passportNumber: "P3456789" },
    destinationCountry: "QATAR",
    jobPosition: "Electrician",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "app-4",
    status: "MEDICAL_PENDING",
    applicant: { fullName: "Dipesh Magar", passportNumber: "P4567890" },
    destinationCountry: "AUSTRALIA",
    jobPosition: "Chef",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: "app-5",
    status: "VISA_SUBMITTED",
    applicant: { fullName: "Eshan Karki", passportNumber: "P5678901" },
    destinationCountry: "USA",
    jobPosition: "Nurse",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: "app-6",
    status: "PROCESSING",
    applicant: { fullName: "Ganesh Rai", passportNumber: "P6789012" },
    destinationCountry: "JAPAN",
    jobPosition: "Caregiver",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: "app-7",
    status: "APPROVED",
    applicant: { fullName: "Hari Lamichhane", passportNumber: "P7890123" },
    destinationCountry: "UAE",
    jobPosition: "Sales Manager",
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString()
  },
  {
    id: "app-8",
    status: "DEPLOYED",
    applicant: { fullName: "Ishor Bista", passportNumber: "P8901234" },
    destinationCountry: "QATAR",
    jobPosition: "Security Guard",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
  },
  {
    id: "app-9",
    status: "PENDING",
    applicant: { fullName: "Janak Poudel", passportNumber: "P9012345" },
    destinationCountry: "AUSTRALIA",
    jobPosition: "Plumber",
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString()
  },
  {
    id: "app-10",
    status: "APPROVED",
    applicant: { fullName: "Kiran Khatri", passportNumber: "P0123456" },
    destinationCountry: "JAPAN",
    jobPosition: "Factory Worker",
    createdAt: new Date(Date.now() - 86400000 * 9).toISOString()
  }
];

export async function GET() {
  // Returns exactly what the frontend RTK query expects for the dragged board
  return NextResponse.json(mockApplications);
}
