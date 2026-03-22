import { NextResponse } from "next/server";

const mockCompanies = [
  {
    id: "comp-1",
    businessName: "Everest Manpower Services",
    contactEmail: "contact@everestmanpower.test",
    contactPhone: "+977-1-4123456",
    city: "Kathmandu",
    country: "Nepal",
    createdAt: "2024-01-15T10:00:00.000Z",
    _count: { branches: 3, users: 15 }
  },
  {
    id: "comp-2",
    businessName: "Himalayan Overseas Pvt Ltd",
    contactEmail: "info@himalayan.test",
    contactPhone: "+977-1-4234567",
    city: "Lalitpur",
    country: "Nepal",
    createdAt: "2024-02-20T11:30:00.000Z",
    _count: { branches: 2, users: 8 }
  },
  {
    id: "comp-3",
    businessName: "Gorkha Recruitment Agency",
    contactEmail: "admin@gorkharecruitment.test",
    contactPhone: "+977-1-4345678",
    city: "Pokhara",
    country: "Nepal",
    createdAt: "2024-03-10T09:15:00.000Z",
    _count: { branches: 1, users: 5 }
  }
];

export async function GET() {
  return NextResponse.json(mockCompanies);
}
