import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "SYSTEM_ADMIN" || session.user.role === "COMPANY_ADMIN";
  if (!isAdmin) {
    redirect("/dashboard/staff");
  }

  return <AdminDashboardClient />;
}
