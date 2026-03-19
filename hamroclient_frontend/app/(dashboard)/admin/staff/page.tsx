import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AddStaffForm from "@/components/forms/AddStaffForm";
import { UsersIcon, ShieldAlert } from "lucide-react";

async function getBranches() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const res = await fetch(`${baseUrl}/api/branches`, { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export default async function ManageStaffPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    // Only ADMINs can provision new staff. 
    redirect("/applicants"); 
  }

  if (!session?.user?.email) {
    return (
      <div className="flex h-[50vh] items-center justify-center p-6 text-center">
        <p className="text-destructive font-medium border border-destructive/20 bg-destructive/10 p-4 rounded-lg">
          Error: Admin email is required to provision staff. Please contact support or re-login.
        </p>
      </div>
    );
  }

  const branches = await getBranches();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UsersIcon className="w-8 h-8 text-primary" />
            Manage Agency Staff
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Provision new staff accounts, assign them to branches, and manage roles. 
            All staff creation is strictly limited to System Administrators.
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-2 bg-amber-500/10 text-amber-600 px-4 py-2 rounded-full border border-amber-500/20 text-sm font-medium">
          <ShieldAlert className="w-4 h-4" />
          Admin Controlled Area
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: The Form */}
        <div>
          <AddStaffForm branches={branches} adminEmail={session.user.email || ""} />
        </div>

        {/* Right Column: Information & Guidelines */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Provisioning Guidelines</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary font-bold">1.</span>
                <span><b>Roles:</b> STAFF have access only to their branch. ADMINS have global visibility.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">2.</span>
                <span><b>Branches:</b> A branch must be selected for STAFF. It is ignored for ADMINS.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">3.</span>
                <span><b>Passwords:</b> The system generates an initial strong password. Provide this safely to the employee. They can change it later.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
