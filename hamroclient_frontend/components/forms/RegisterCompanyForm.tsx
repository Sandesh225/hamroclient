"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProvisionCompanyMutation } from "@/store/api/companyApi";
import { 
  Building2, 
  Mail, 
  Phone, 
  User, 
  FileText, 
  Loader2, 
  CheckCircle2,
  Copy,
  ExternalLink
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useState } from "react";

const registerSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  registrationNumber: z.string().optional(),
  contactEmail: z.string().email("Invalid contact email"),
  contactPhone: z.string().optional(),
  adminName: z.string().min(2, "Admin name is required"),
  adminEmail: z.string().email("Invalid admin email"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterCompanyFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function RegisterCompanyForm({ onSuccess, onCancel }: RegisterCompanyFormProps) {
  const [provisionCompany, { isLoading }] = useProvisionCompanyMutation();
  const [provisionedData, setProvisionedData] = useState<{ inviteLink: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const result = await provisionCompany(data).unwrap();
      if (result.success) {
        toast.success("Agency provisioned successfully!");
        setProvisionedData({ inviteLink: result.data.inviteLink });
        if (onSuccess) {
          // We wait for the user to copy the link before closing, 
          // or handle it in the success state UI below.
        }
      }
    } catch (err: any) {
      toast.error(err.data?.error || "Failed to provision agency");
    }
  };

  const copyLink = () => {
    if (provisionedData?.inviteLink) {
      navigator.clipboard.writeText(provisionedData.inviteLink);
      toast.success("Invitation link copied to clipboard!");
    }
  };

  if (provisionedData) {
    return (
      <div className="p-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Agency Provisioned!</h2>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            The company has been created. Please share this secure activation link with the primary administrator.
          </p>
        </div>

        <div className="bg-muted/50 border border-border p-4 rounded-xl flex items-center gap-3 group">
          <div className="truncate text-xs font-mono text-muted-foreground flex-1 text-left">
            {provisionedData.inviteLink}
          </div>
          <button 
            onClick={copyLink}
            className="p-2 hover:bg-background rounded-lg transition-colors text-primary group-hover:scale-110"
            title="Copy Link"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <button 
            onClick={() => window.open(provisionedData.inviteLink, '_blank')}
            className="premium-button flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open Activation Page
          </button>
          <button 
            onClick={onCancel}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Close Provisioning Wizard
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Provision New Agency</h2>
          <p className="text-sm text-muted-foreground">Setup a new organizational workspace and its master admin.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Company Details
          </h3>
          
          <div className="space-y-1">
            <label className="text-xs font-medium ml-1">Business Name</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                {...register("businessName")}
                className="form-input-premium pl-10"
                placeholder="e.g. Aussie Manpower Solutions"
              />
            </div>
            {errors.businessName && <p className="text-[10px] text-destructive ml-1">{errors.businessName.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium ml-1">Registration Number (Optional)</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                {...register("registrationNumber")}
                className="form-input-premium pl-10"
                placeholder="e.g. REG-123456"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium ml-1">Contact Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  {...register("contactEmail")}
                  className="form-input-premium pl-10"
                  placeholder="info@company.com"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium ml-1">Contact Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  {...register("contactPhone")}
                  className="form-input-premium pl-10"
                  placeholder="+977..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Master Admin Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4" />
            Master Admin
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-medium ml-1">Admin Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                {...register("adminName")}
                className="form-input-premium pl-10"
                placeholder="e.g. John Doe"
              />
            </div>
            {errors.adminName && <p className="text-[10px] text-destructive ml-1">{errors.adminName.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium ml-1">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                {...register("adminEmail")}
                className="form-input-premium pl-10"
                placeholder="admin@company.com"
              />
            </div>
            {errors.adminEmail && <p className="text-[10px] text-destructive ml-1">{errors.adminEmail.message}</p>}
          </div>

          <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl text-xs text-primary leading-relaxed mt-4">
            <strong>Note:</strong> The administrator will receive a secure link to set their password and activate the agency. A default "Head Office" branch will be created automatically.
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="premium-button flex items-center gap-2 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Provisioning...
            </>
          ) : (
            <>
              <Building2 className="w-4 h-4" />
              Provision Agency
            </>
          )}
        </button>
      </div>
    </form>
  );
}
