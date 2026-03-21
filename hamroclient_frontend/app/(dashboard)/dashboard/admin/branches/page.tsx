"use client";

import { useState } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useGetBranchesQuery, useCreateBranchMutation } from "@/store/api/branchApi";
import { Loader2, Plus, Building2, MapPin, Users, FileText } from "lucide-react";
import Link from "next/link";

export default function BranchManagementPage() {
  const { data, isLoading, error } = useGetBranchesQuery();
  const [createBranch, { isLoading: isCreating }] = useCreateBranchMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: "", location: "" });
  const [formError, setFormError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.name) {
      setFormError("Branch Name is required");
      return;
    }

    try {
      await createBranch(newBranch).unwrap();
      setIsModalOpen(false);
      setNewBranch({ name: "", location: "" });
      setFormError("");
    } catch (err: any) {
      setFormError(err?.data?.error || "Failed to create branch");
    }
  };

  const branches = data?.data || [];

  return (
    <RoleGuard allowedRoles={["COMPANY_ADMIN", "SYSTEM_ADMIN"]}>
      <div className="p-8 animate-[slideIn_0.3s_ease-out]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Manage Branches</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Add and monitor your agency&apos;s physical locations.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Branch
          </button>
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="flex items-center justify-center p-12 bg-card border border-border rounded-2xl">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-sm">
            Failed to load branches. Please check your connection.
          </div>
        )}

        {/* Branch Grid */}
        {!isLoading && !error && branches.length === 0 && (
          <div className="text-center p-12 bg-card border border-border border-dashed rounded-2xl">
            <Building2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No branches found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Click the button above to add your first branch.
            </p>
          </div>
        )}

        {!isLoading && !error && branches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((branch) => (
              <div key={branch.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg text-foreground">{branch.name}</h3>
                  </div>
                  {branch.location && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
                      <MapPin className="w-4 h-4" />
                      {branch.location}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
                  <div className="flex flex-col items-center p-3 bg-secondary/50 rounded-xl">
                    <Users className="w-4 h-4 text-muted-foreground mb-1" />
                    <span className="text-xl font-bold text-foreground">{branch._count?.users || 0}</span>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Staff</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-secondary/50 rounded-xl">
                    <FileText className="w-4 h-4 text-muted-foreground mb-1" />
                    <span className="text-xl font-bold text-foreground">{branch._count?.applications || 0}</span>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Cases</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Branch Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-foreground">Add New Branch</h2>
                <p className="text-sm text-muted-foreground mt-1">Create a new location for your agency.</p>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl">
                    {formError}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Branch Name *</label>
                  <input
                    type="text"
                    required
                    value={newBranch.name}
                    onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                    placeholder="e.g. Kathmandu Branch"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Location</label>
                  <input
                    type="text"
                    value={newBranch.location}
                    onChange={(e) => setNewBranch({ ...newBranch, location: e.target.value })}
                    placeholder="e.g. Putalisadak, Kathmandu"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
