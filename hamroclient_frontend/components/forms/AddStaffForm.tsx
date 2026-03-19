"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle } from "lucide-react";

// The frontend version of the staff provisioning schema
const staffProvisioningSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Temporary password is required (min 6 chars)"),
  role: z.enum(["ADMIN", "STAFF"]),
  branchId: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === "STAFF" && !data.branchId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Branch is required for Staff members",
      path: ["branchId"],
    });
  }
});

type StaffFormValues = z.infer<typeof staffProvisioningSchema>;

export default function AddStaffForm({ 
  branches, 
  adminEmail 
}: { 
  branches: { id: string; name: string }[],
  adminEmail: string 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<StaffFormValues>({
    resolver: zodResolver(staffProvisioningSchema),
    defaultValues: {
      role: "STAFF",
      password: "GlobalStaff2026!", // Suggested secure default
    }
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: StaffFormValues) => {
    setIsSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/backend/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
           ...data,
           branchId: data.role === "ADMIN" ? undefined : data.branchId
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to provision staff");
      }

      setSuccessMsg(`Account for ${data.name} created successfully! Instruct them to login with the temporary password.`);
      reset(); // Clear form on success
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-6 max-w-2xl">
      <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
        <PlusCircle className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Provision New Account</h2>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 text-green-700 border border-green-500/20 text-sm font-medium">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <input
              {...register("name")}
              placeholder="e.g. Ram Sharma"
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <input
              {...register("email")}
              type="email"
              placeholder="ram.ktm@company.com"
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">System Role</label>
            <select
              {...register("role")}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            >
              <option value="STAFF">Branch Staff</option>
              <option value="ADMIN">System Administrator</option>
            </select>
            {errors.role && <p className="text-destructive text-xs">{errors.role.message}</p>}
          </div>

          <div className={`space-y-2 transition-opacity ${selectedRole === "ADMIN" ? 'opacity-50 pointer-events-none' : ''}`}>
             <label className="text-sm font-medium">Assigned Branch</label>
             <select
               {...register("branchId")}
               disabled={selectedRole === "ADMIN"}
               className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
             >
               <option value="">-- Required for Staff --</option>
               {branches.map(b => (
                 <option key={b.id} value={b.id}>{b.name}</option>
               ))}
             </select>
             {errors.branchId && <p className="text-destructive text-xs">{errors.branchId.message}</p>}
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="bg-muted p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-2 w-full max-w-xs">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                Temporary Password 
                <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Generated</span>
              </label>
              <input
                {...register("password")}
                type="text"
                className="w-full px-3 py-1.5 rounded-md border border-input bg-background text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none"
              />
              {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto mt-6 sm:mt-0 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Provisioning...</>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center sm:text-left">
            * Note: Temporary password will be shown in plain text. Securely communicate this to the employee.
          </p>
        </div>
      </form>
    </div>
  );
}
