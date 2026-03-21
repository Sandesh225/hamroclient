"use client";

import { useState, useEffect } from "react";
import { Building2, Upload, Loader2, Check } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useGetCompanyProfileQuery, useUpdateCompanyProfileMutation } from "@/store/api/companyApi";
import { useSession } from "next-auth/react";

export default function AgencyProfilePage() {
  const { addToast } = useToast();
  const { data: session } = useSession();
  const { data: profileResponse, isLoading } = useGetCompanyProfileQuery();
  const [updateCompanyProfile, { isLoading: isSaving }] = useUpdateCompanyProfileMutation();

  const [form, setForm] = useState({
    businessName: "",
    address: "",
    phone: "",
    email: "",
    registrationNumber: "",
    website: "",
  });

  useEffect(() => {
    if (profileResponse?.data) {
      setForm({
        businessName: profileResponse.data.businessName || "",
        address: profileResponse.data.address || "",
        phone: profileResponse.data.contactPhone || "",
        email: profileResponse.data.contactEmail || "",
        registrationNumber: profileResponse.data.registrationNumber || "",
        website: profileResponse.data.website || "",
      });
    }
  }, [profileResponse]);

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      if (!form.businessName) {
        addToast("error", "Error", "Business Name is required.");
        return;
      }
      await updateCompanyProfile(form).unwrap();
      addToast("success", "Profile Updated", "Agency profile saved successfully.");
    } catch (error: any) {
      addToast("error", "Error", error?.data?.error || "Failed to update profile.");
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-background border border-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Agency Profile</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Update your agency&apos;s information and branding.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Agency Logo</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-bold text-2xl">H</span>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
              <Upload className="w-4 h-4" />
              Upload New Logo
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">Agency Name</label>
            <input value={form.businessName} onChange={(e) => update("businessName", e.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">Address</label>
            <input value={form.address} onChange={(e) => update("address", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
            <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Registration or License Number</label>
            <input value={form.registrationNumber} onChange={(e) => update("registrationNumber", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Website</label>
            <input value={form.website} onChange={(e) => update("website", e.target.value)} className={inputClass} />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
