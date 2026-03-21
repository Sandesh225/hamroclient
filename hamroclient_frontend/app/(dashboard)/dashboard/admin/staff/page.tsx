import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AddStaffForm from "@/components/forms/AddStaffForm";
import { UsersIcon, ShieldAlert } from "lucide-react";

import { cookies } from "next/headers";

// SSR branch fetching removed in favor of client-side RTK Query

export default async function ManageStaffPage() {
  const session = await getServerSession(authOptions);

  const isAdmin = session?.user?.role === "SYSTEM_ADMIN" || session?.user?.role === "COMPANY_ADMIN";
  if (!session?.user || !isAdmin) {
    // Only COMPANY_ADMINs and SYSTEM_ADMINs can provision new staff. 
    redirect("/applicants"); 
  }



  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UsersIcon className="w-8 h-8 text-primary" />
            Manage Agency Staff
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Invite new staff members to join your agency. Assign them to specific branches and define their access level via roles.
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-2 bg-amber-500/10 text-amber-600 px-4 py-2 rounded-full border border-amber-500/20 text-sm font-medium">
          <ShieldAlert className="w-4 h-4" />
          Admin Controlled Area
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="max-w-2xl bg-card border border-border rounded-xl p-6 shadow-sm">
          <AddStaffForm />
        </div>

        {/* Right Column: Information & Guidelines */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Provisioning Guidelines</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary font-bold">1.</span>
                <span><b>Roles:</b> AGENTs have access only to their assigned applicants. BRANCH_MANAGERs see their whole branch.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">2.</span>
                <span><b>Branches:</b> A branch must be selected for all staff roles below Company Admin.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">3.</span>
                <span><b>Invitations:</b> The system generates a secure link. Shares this link with the employee to complete their profile.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
