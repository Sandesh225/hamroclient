"use client";

import { useState } from "react";
import { Building2, Upload, Loader2, Check } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function AgencyProfilePage() {
  const { addToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    agencyName: "HamroClient Manpower Pvt. Ltd.",
    address: "Putalisadak, Kathmandu",
    phone: "+977-01-4123456",
    email: "info@hamroclient.com",
    licenseNumber: "MP-2024-KTM-0042",
    website: "https://hamroclient.com",
  });

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSaving(false);
    addToast("success", "Profile Updated", "Agency profile saved successfully.");
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-background border border-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors";

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
            <input value={form.agencyName} onChange={(e) => update("agencyName", e.target.value)} className={inputClass} />
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
            <label className="block text-sm font-medium text-foreground mb-1.5">License Number</label>
            <input value={form.licenseNumber} onChange={(e) => update("licenseNumber", e.target.value)} className={inputClass} />
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
