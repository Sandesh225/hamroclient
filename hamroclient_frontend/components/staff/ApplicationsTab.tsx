"use client";

import { useState } from "react";
import type { ApplicantApplication } from "@/store/api/applicantDetailApi";
import {
  useUpdateApplicationMutation,
  useDeleteApplicationMutation,
} from "@/store/api/applicantDetailApi";
import Link from "next/link";
import {
  Globe,
  Briefcase,
  Building2,
  CalendarDays,
  ArrowRight,
  Pencil,
  Save,
  X,
  Trash2,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface ApplicationsTabProps {
  applications: ApplicantApplication[];
  applicantId: string;
}

const statusBadge: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300",
  DOCUMENTATION_GATHERING: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300",
  VERIFICATION: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300",
  MEDICAL_PENDING: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300",
  VISA_SUBMITTED: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300",
  PROCESSING: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300",
  REJECTED: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300",
  DEPLOYED: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300",
  COMPLETED: "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/50 dark:text-green-300",
  CANCELLED: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-900/50 dark:text-gray-400",
};

export default function ApplicationsTab({
  applications,
  applicantId,
}: ApplicationsTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<ApplicantApplication>>({});
  const [successId, setSuccessId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [updateApp, { isLoading: isUpdating }] = useUpdateApplicationMutation();
  const [deleteApp] = useDeleteApplicationMutation();

  const handleEditClick = (app: ApplicantApplication) => {
    setEditingId(app.id);
    setEditValues({
      destinationCountry: app.destinationCountry || "",
      visaType: app.visaType || "",
      jobPosition: app.jobPosition || "",
      employerAbroad: app.employerAbroad || "",
      applicationDate: app.applicationDate || "",
      submissionDate: app.submissionDate || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleSave = async (appId: string) => {
    try {
      if (Object.keys(editValues).length === 0) return;
      await updateApp({ id: appId, data: editValues, applicantId }).unwrap();
      setEditingId(null);
      setSuccessId(appId);
      setTimeout(() => setSuccessId(null), 3000);
    } catch (err) {
      console.error("Failed to update application:", err);
    }
  };

  const handleDelete = async (appId: string) => {
    if (!confirm("Are you sure you want to delete this application? This action cannot be undone.")) return;
    setDeletingId(appId);
    try {
      await deleteApp({ id: appId, applicantId }).unwrap();
    } catch (err) {
      console.error("Failed to delete application:", err);
      setDeletingId(null); // Reset on error so user can try again
    }
  };

  const handleChange = (field: keyof ApplicantApplication, value: string) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  if (applications.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 flex flex-col items-center text-center">
        <Briefcase className="w-10 h-10 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">
          No applications found for this applicant.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {applications.map((app) => {
        const isEditing = editingId === app.id;
        const isSuccess = successId === app.id;
        const isDeleting = deletingId === app.id;

        return (
          <div
            key={app.id}
            className={`bg-card border rounded-xl p-5 transition-all duration-200 relative group
              ${isEditing ? "border-primary/30 ring-2 ring-primary/10 shadow-lg shadow-primary/5" : "border-border hover:shadow-md"}
              ${isDeleting ? "opacity-50 pointer-events-none" : ""}
            `}
          >
            {/* Header / Status Row */}
            <div className="flex items-start justify-between mb-4">
              <span
                className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
                  statusBadge[app.status] || "bg-muted text-muted-foreground border-border"
                }`}
              >
                {isSuccess && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                {app.status.replace(/_/g, " ")}
              </span>

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                      className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted transition-colors"
                      title="Cancel Edit"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleSave(app.id)}
                      disabled={isUpdating}
                      className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      title="Save Changes"
                    >
                      {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Application"
                    >
                      {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleEditClick(app)}
                      className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Edit Application"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <Link
                      href={`/applications/${app.id}`}
                      className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="View Details"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="space-y-3">
              {isEditing ? (
                // ── Edit Mode Fields ──
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Destination Country</label>
                      <input
                        value={editValues.destinationCountry || ""}
                        onChange={(e) => handleChange("destinationCountry", e.target.value)}
                        className="w-full text-sm bg-background border border-border rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-primary/30 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Visa Type</label>
                      <input
                        value={editValues.visaType || ""}
                        onChange={(e) => handleChange("visaType", e.target.value)}
                        className="w-full text-sm bg-background border border-border rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-primary/30 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Job Position</label>
                      <input
                        value={editValues.jobPosition || ""}
                        onChange={(e) => handleChange("jobPosition", e.target.value)}
                        className="w-full text-sm bg-background border border-border rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-primary/30 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Employer Abroad</label>
                      <input
                        value={editValues.employerAbroad || ""}
                        onChange={(e) => handleChange("employerAbroad", e.target.value)}
                        className="w-full text-sm bg-background border border-border rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-primary/30 outline-none"
                      />
                    </div>
                  </div>
                </>
              ) : (
                // ── Read-Only Display ──
                <>
                  {(app.destinationCountry || app.visaType) && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="font-medium text-foreground">
                        {app.destinationCountry || "Not assigned"}
                      </span>
                      {app.visaType && (
                        <span className="text-xs text-muted-foreground">— {app.visaType}</span>
                      )}
                    </div>
                  )}
                  {app.jobPosition && (
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-foreground">{app.jobPosition}</span>
                    </div>
                  )}
                  {app.employerAbroad && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{app.employerAbroad}</span>
                    </div>
                  )}
                  {!app.destinationCountry && !app.jobPosition && !app.employerAbroad && (
                    <div className="text-sm text-muted-foreground italic">No details assigned yet.</div>
                  )}
                </>
              )}
            </div>

            {/* Footer Dates */}
            <div className="mt-4 pt-3 border-t border-border/50">
              {isEditing ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" /> Application Date
                    </label>
                    <input
                      type="date"
                      value={editValues.applicationDate ? new Date(editValues.applicationDate).toISOString().split('T')[0] : ""}
                      onChange={(e) => handleChange("applicationDate", e.target.value)}
                      className="w-full text-xs bg-background border border-border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" /> Submission Date
                    </label>
                    <input
                      type="date"
                      value={editValues.submissionDate ? new Date(editValues.submissionDate).toISOString().split('T')[0] : ""}
                      onChange={(e) => handleChange("submissionDate", e.target.value)}
                      className="w-full text-xs bg-background border border-border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    Applied: {app.applicationDate ? new Date(app.applicationDate).toLocaleDateString() : "TBD"}
                  </div>
                  {app.submissionDate && (
                    <div className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      Submitted: {new Date(app.submissionDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
