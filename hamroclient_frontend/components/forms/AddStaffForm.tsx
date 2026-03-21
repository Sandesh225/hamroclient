"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useInviteStaffMutation } from "@/store/api/staffApi";
import { useGetBranchesQuery } from "@/store/api/branchApi";
import { useGetCompaniesQuery } from "@/store/api/companyApi";
import { Copy, CheckCircle2, Info, Building, Users } from "lucide-react";

// ── Validation Schema ──
const staffSchema = z.object({
  email: z.string().email("Valid email is required"),
  role: z.enum(["COMPANY_ADMIN", "BRANCH_MANAGER", "AGENT"]),
  companyId: z.string().optional().or(z.literal("")),
  branchId: z.string().min(1, "Branch must be selected"),
});

type StaffFormData = z.infer<typeof staffSchema>;

// Premium styles from global theme
const selectClass = "form-select-premium";
const inputClass = "form-input-premium";

const ROLE_DESCRIPTIONS = {
  AGENT: "Can manage their own assigned applicants and view their pipeline status.",
  BRANCH_MANAGER: "Full visibility and management power for all applicants and agents within their assigned branch.",
  COMPANY_ADMIN: "Full agency oversight. Can manage all branches, staff, and configurations.",
};

interface AddStaffFormProps {
  onSuccess?: () => void;
}

export default function AddStaffForm({ onSuccess }: AddStaffFormProps) {
  const { data: session } = useSession();
  const isSystemAdmin = (session?.user as any)?.role === "SYSTEM_ADMIN";

  const [inviteStaff, { isLoading: isSubmitting }] = useInviteStaffMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      email: "",
      role: "AGENT",
      branchId: "",
      companyId: "",
    },
  });

  const watchedRole = watch("role");
  const watchedCompanyId = watch("companyId");

  // Fetch all companies if System Admin
  const { data: companiesData } = useGetCompaniesQuery(undefined, { skip: !isSystemAdmin });
  
  // Fetch branches dynamically based on selection or initial context
  const { data: branchesData, isFetching: isFetchingBranches } = useGetBranchesQuery(
    isSystemAdmin && watchedCompanyId ? { companyId: watchedCompanyId } : undefined,
    { skip: isSystemAdmin && !watchedCompanyId }
  );

  const displayBranches = branchesData?.data || [];

  const onSubmit = async (data: StaffFormData) => {
    setFormError(null);
    setInviteLink(null);

    if (isSystemAdmin && !data.companyId) {
      setFormError("Company must be selected");
      return;
    }

    // If Company Admin, we don't need to send companyId (backend derives from token)
    // But System Admin MUST send it.
    const payload = {
      ...data,
      companyId: isSystemAdmin ? data.companyId : undefined,
    };

    try {
      const result = await inviteStaff(payload).unwrap();
      setInviteLink(result.inviteLink);
      reset({ role: "AGENT", email: "", branchId: "", companyId: watchedCompanyId });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      setFormError(error.data?.error || "Failed to send invite. Please try again.");
    }
  };

  const copyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Invite New Staff</h2>
          <p className="text-sm text-muted-foreground">Provision access to the agency platform</p>
        </div>
      </div>

      {formError && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-2xl mb-6 text-sm flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
          {formError}
        </div>
      )}

      {inviteLink && (
        <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl mb-6 space-y-3 animate-in fade-in zoom-in duration-300">
          <p className="text-sm font-semibold text-primary flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Invite link generated!
          </p>
          <div className="flex items-center gap-2">
            <input 
              readOnly 
              value={inviteLink} 
              className="flex-1 bg-background/50 border border-primary/10 px-4 py-2.5 rounded-xl text-xs font-mono text-muted-foreground focus:outline-none"
            />
            <button 
              onClick={copyToClipboard}
              className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
              title="Copy link"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Note: This link is temporary and unique. Share it securely with the staff member to complete their profile registration.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-5">
          {/* Company Selection (System Admin ONLY) */}
          {isSystemAdmin && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" />
                Select Agency *
              </label>
              <select
                {...register("companyId")}
                className={selectClass}
                disabled={isSubmitting}
              >
                <option value="">Select Company</option>
                {companiesData?.data.map((c) => (
                  <option key={c.id} value={c.id}>{c.businessName}</option>
                ))}
              </select>
              {errors.companyId && <p className="text-xs text-destructive">{errors.companyId.message}</p>}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              Email Address *
            </label>
            <input
              type="email"
              {...register("email")}
              className={inputClass}
              placeholder="name@agency.com"
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Access Role *
              </label>
              <select
                {...register("role")}
                className={selectClass}
                disabled={isSubmitting}
              >
                <option value="AGENT">Agent</option>
                <option value="BRANCH_MANAGER">Branch Manager</option>
                <option value="COMPANY_ADMIN">Company Admin</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Branch Assignment *
              </label>
              <select
                {...register("branchId")}
                className={selectClass}
                disabled={isSubmitting || (isSystemAdmin && !watchedCompanyId)}
              >
                {isSystemAdmin && !watchedCompanyId ? (
                  <option value="">Select Company first</option>
                ) : (
                  <>
                    <option value="">Select Branch</option>
                    {displayBranches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </>
                )}
              </select>
              {errors.branchId && <p className="text-xs text-destructive font-medium mt-1">{errors.branchId.message}</p>}
              {isFetchingBranches && <p className="text-[10px] text-primary animate-pulse">Loading branches...</p>}
            </div>
          </div>
        </div>

        {/* Dynamic Role Information Card */}
        <div className="p-4 rounded-xl bg-secondary/50 border border-border mt-4 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-primary shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              {watchedRole.replace("_", " ")} Permissions
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {ROLE_DESCRIPTIONS[watchedRole as keyof typeof ROLE_DESCRIPTIONS]}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full premium-button h-12 flex items-center justify-center gap-2 group"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Generate & Secure Invite
              <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
