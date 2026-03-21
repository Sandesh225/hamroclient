"use client";

import { useState } from "react";
import {
  Users,
  PlusCircle,
  MoreHorizontal,
  Shield,
  ShieldAlert,
  Check,
  X,
  Loader2,
  Trash2,
  Edit2,
} from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import { useGetUsersQuery } from "@/store/api/userApi";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function UserManagementPage() {
  const { addToast } = useToast();
  const { data: session } = useSession();
  const { data: usersData, isLoading: isLoadingUsers } = useGetUsersQuery();
  const router = useRouter();
  
  const users = usersData?.data || [];
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const deleteUser = () => {
    // API Call for user deletion goes here
    if (!deleteUserId) return;
    setDeleteUserId(null);
    addToast("info", "Feature coming soon");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage staff and admin accounts.</p>
        </div>
        <button onClick={() => router.push("/dashboard/admin/staff")} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
          <PlusCircle className="w-4 h-4" /> Provision User
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Created On</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoadingUsers ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground flex justify-center w-full">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground w-full">
                    No users found for this agency.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                        user.role === "SYSTEM_ADMIN" || user.role === "COMPANY_ADMIN" 
                          ? "bg-amber-50 text-amber-700 border border-amber-200" 
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}>
                        {user.role === "SYSTEM_ADMIN" || user.role === "COMPANY_ADMIN" ? <ShieldAlert className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                        {user.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setDeleteUserId(user.id)} className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteUserId}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={deleteUser}
        onCancel={() => setDeleteUserId(null)}
      />
    </div>
  );
}
