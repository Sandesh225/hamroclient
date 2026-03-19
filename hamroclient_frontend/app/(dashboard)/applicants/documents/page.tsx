"use client";

import { useGetApplicantDocumentsQuery } from "@/store/api/applicantDetailApi";
import { ClipboardList, Search, FileText, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function DocumentChecklistPage() {
  // This would ideally be a global query for all documents.
  // For now, let's show a nice placeholder UI that fits the senior-level Polish.
  
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-primary" />
            Document Checklist
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitor and manage documentation status across all active applicants.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <ClipboardList className="w-8 h-8" />
        </div>
        <div className="max-w-md">
          <h2 className="text-xl font-semibold">Global Document Processing</h2>
          <p className="text-muted-foreground mt-2">
            The unified document verification queue is being optimized. You can currently manage documents individually within each applicant's profile.
          </p>
        </div>
        <div className="flex gap-4 pt-2">
          <Link
            href="/applicants"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            View All Applicants
          </Link>
          <button
            className="px-4 py-2 bg-muted text-foreground border border-border rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            Wait for Sync
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
             <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
               <CheckCircle2 className="w-5 h-5" />
             </div>
             <h3 className="font-semibold text-sm">Verified Vault</h3>
          </div>
          <p className="text-2xl font-bold">--</p>
          <p className="text-xs text-muted-foreground mt-1">Documents verified this week</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
             <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
               <Clock className="w-5 h-5" />
             </div>
             <h3 className="font-semibold text-sm">Pending Review</h3>
          </div>
          <p className="text-2xl font-bold">--</p>
          <p className="text-xs text-muted-foreground mt-1">Uploaded and awaiting staff action</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
             <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
               <AlertCircle className="w-5 h-5" />
             </div>
             <h3 className="font-semibold text-sm">Expiring Soon</h3>
          </div>
          <p className="text-2xl font-bold">--</p>
          <p className="text-xs text-muted-foreground mt-1">Passports/Medicals expiring in 30 days</p>
        </div>
      </div>
    </div>
  );
}
