"use client";

import { useState } from "react";
import type { ApplicantProfile } from "@/store/api/applicantDetailApi";
import { useUpdateApplicantMutation } from "@/store/api/applicantDetailApi";
import {
  User,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Globe,
  Shield,
  Heart,
  Calendar,
  Pencil,
  Save,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface ProfileTabProps {
  applicant: ApplicantProfile;
}

// ── Editable Info Row ──
function InfoRow({
  icon: Icon,
  label,
  value,
  fieldKey,
  isEditing,
  editValues,
  onChange,
  type = "text",
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
  fieldKey?: string;
  isEditing?: boolean;
  editValues?: Record<string, any>;
  onChange?: (key: string, val: string) => void;
  type?: "text" | "date" | "email" | "tel" | "select";
}) {
  if (isEditing && fieldKey && onChange) {
    const currentVal =
      editValues?.[fieldKey] !== undefined
        ? editValues[fieldKey]
        : value || "";

    return (
      <div className="flex items-start gap-3 py-2.5">
        <Icon className="w-4 h-4 text-primary mt-2.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">
            {label}
          </label>
          <input
            type={type === "date" ? "date" : type}
            value={
              type === "date" && currentVal
                ? new Date(currentVal).toISOString().split("T")[0]
                : currentVal
            }
            onChange={(e) => onChange(fieldKey, e.target.value)}
            className="w-full text-sm font-medium text-foreground bg-background border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">
          {value || <span className="text-muted-foreground/50 italic">Not provided</span>}
        </p>
      </div>
    </div>
  );
}

// ── Section Card Wrapper ──
function SectionCard({
  title,
  icon: Icon,
  children,
  isEditing,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isEditing?: boolean;
}) {
  return (
    <div
      className={`bg-card border rounded-xl p-5 transition-all duration-200 ${
        isEditing
          ? "border-primary/30 ring-2 ring-primary/10 shadow-lg shadow-primary/5"
          : "border-border"
      }`}
    >
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        {title}
        {isEditing && (
          <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded ml-auto">
            EDITING
          </span>
        )}
      </h3>
      {children}
    </div>
  );
}

export default function ProfileTab({ applicant }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, any>>({});
  const [updateApplicant, { isLoading: isSaving }] = useUpdateApplicantMutation();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (key: string, value: string) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (Object.keys(editValues).length === 0) {
      setIsEditing(false);
      return;
    }
    try {
      await updateApplicant({ id: applicant.id, data: editValues }).unwrap();
      setSaveSuccess(true);
      setIsEditing(false);
      setEditValues({});
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save:", err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValues({});
  };

  const commonProps = { isEditing, editValues, onChange: handleChange };

  return (
    <div className="space-y-4">
      {/* ── Action Bar ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full animate-in fade-in slide-in-from-left-2 duration-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Profile saved successfully
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || Object.keys(editValues).length === 0}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* ── Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* ── Personal Identity ── */}
        <SectionCard title="Personal Identity" icon={User} isEditing={isEditing}>
          <div className="space-y-1 divide-y divide-border/50">
            <InfoRow icon={User} label="Full Name" value={applicant.fullName} fieldKey="fullName" {...commonProps} />
            <InfoRow icon={Calendar} label="Date of Birth" value={applicant.dateOfBirth ? new Date(applicant.dateOfBirth).toLocaleDateString() : null} fieldKey="dateOfBirth" type="date" {...commonProps} />
            <InfoRow icon={User} label="Gender" value={applicant.gender} fieldKey="gender" {...commonProps} />
            <InfoRow icon={Globe} label="Nationality" value={applicant.nationality} fieldKey="nationality" {...commonProps} />
            <InfoRow icon={MapPin} label="Place of Birth" value={applicant.placeOfBirth} fieldKey="placeOfBirth" {...commonProps} />
            <InfoRow icon={Heart} label="Marital Status" value={applicant.maritalStatus} fieldKey="maritalStatus" {...commonProps} />
            <InfoRow icon={User} label="Religion" value={applicant.religion} fieldKey="religion" {...commonProps} />
            <InfoRow icon={CreditCard} label="National ID" value={applicant.nationalIdNumber} fieldKey="nationalIdNumber" {...commonProps} />
            <InfoRow icon={User} label="Father's Name" value={applicant.fathersName} fieldKey="fathersName" {...commonProps} />
            <InfoRow icon={User} label="Mother's Name" value={applicant.mothersName} fieldKey="mothersName" {...commonProps} />
          </div>
        </SectionCard>

        {/* ── Passport & Travel ── */}
        <SectionCard title="Passport & Travel" icon={CreditCard} isEditing={isEditing}>
          <div className="space-y-1 divide-y divide-border/50">
            <InfoRow icon={CreditCard} label="Passport Number" value={applicant.passportNumber} fieldKey="passportNumber" {...commonProps} />
            <InfoRow icon={MapPin} label="Place of Issue" value={applicant.placeOfIssue} fieldKey="placeOfIssue" {...commonProps} />
            <InfoRow icon={Globe} label="Issuing Country" value={applicant.issuingCountry} fieldKey="issuingCountry" {...commonProps} />
            <InfoRow icon={Calendar} label="Issue Date" value={applicant.passportIssueDate ? new Date(applicant.passportIssueDate).toLocaleDateString() : null} fieldKey="passportIssueDate" type="date" {...commonProps} />
            <InfoRow icon={Calendar} label="Expiry Date" value={applicant.passportExpiryDate ? new Date(applicant.passportExpiryDate).toLocaleDateString() : null} fieldKey="passportExpiryDate" type="date" {...commonProps} />
          </div>

          {/* Skills */}
          {!isEditing && (applicant.skills?.length || 0) > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {applicant.skills?.map((skill) => (
                  <span key={skill} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Travel History */}
          {!isEditing && (applicant.previousTravelHistory?.length || 0) > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Previous Travel</p>
              <div className="flex flex-wrap gap-1.5">
                {applicant.previousTravelHistory?.map((country) => (
                  <span key={country} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                    {country}
                  </span>
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── Contact & Emergency ── */}
        <SectionCard title="Contact Information" icon={Phone} isEditing={isEditing}>
          <div className="space-y-1 divide-y divide-border/50">
            <InfoRow icon={Phone} label="Phone" value={applicant.phone} fieldKey="phone" type="tel" {...commonProps} />
            <InfoRow icon={Mail} label="Email" value={applicant.email} fieldKey="email" type="email" {...commonProps} />
            <InfoRow icon={MapPin} label="Permanent Address" value={applicant.permanentAddress} fieldKey="permanentAddress" {...commonProps} />
            <InfoRow icon={MapPin} label="Current Address" value={applicant.currentAddress} fieldKey="currentAddress" {...commonProps} />
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-xs font-semibold text-destructive mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Emergency Contact
            </h4>
            <div className="space-y-1 divide-y divide-border/50">
              <InfoRow icon={User} label="Name" value={applicant.emergencyContactName} fieldKey="emergencyContactName" {...commonProps} />
              <InfoRow icon={User} label="Relation" value={applicant.emergencyContactRelation} fieldKey="emergencyContactRelation" {...commonProps} />
              <InfoRow icon={Phone} label="Phone" value={applicant.emergencyContactPhone} fieldKey="emergencyContactPhone" type="tel" {...commonProps} />
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
