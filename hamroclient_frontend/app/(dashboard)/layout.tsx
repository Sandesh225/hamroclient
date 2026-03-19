import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user.role as "ADMIN" | "STAFF") || "STAFF";
  const userName = session.user.name || "User";

  return (
    <DashboardShell role={role} userName={userName}>
      {children}
    </DashboardShell>
  );
}
