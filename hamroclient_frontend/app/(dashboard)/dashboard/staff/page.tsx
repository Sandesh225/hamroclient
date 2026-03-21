import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import StaffDashboardClient from "@/components/staff/StaffDashboardClient";

export default async function StaffDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return <StaffDashboardClient />;
}
