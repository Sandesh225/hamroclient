import { NextResponse } from "next/server";

const mockAgents = [
  {
    id: "agt-1",
    name: "Suman Bista",
    email: "suman.agent@test.com",
    phone: "+977-9841234567",
    type: "DIRECT",
    commissionRate: "5.00",
    _count: { applications: 12 }
  },
  {
    id: "agt-2",
    name: "Nita Thapa",
    email: "nita.agent@test.com",
    phone: "+977-9812345678",
    type: "INDIRECT",
    commissionRate: "7.50",
    _count: { applications: 8 }
  },
  {
    id: "agt-3",
    name: "Ram Karki",
    email: "ram.agent@test.com",
    phone: "+977-9851234567",
    type: "DIRECT",
    commissionRate: "5.00",
    _count: { applications: 25 }
  }
];

export async function GET() {
  return NextResponse.json(mockAgents);
}
