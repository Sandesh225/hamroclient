"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProfileTab from "@/components/staff/ProfileTab";
import ApplicationsTab from "@/components/staff/ApplicationsTab";
import DocumentsTab from "@/components/staff/DocumentsTab";
import NotesTab from "@/components/staff/NotesTab";
import {
  useGetApplicantByIdQuery,
  useGetApplicantApplicationsQuery,
  useGetApplicantDocumentsQuery,
  useGetApplicantNotesQuery,
  useAddApplicantNoteMutation,
  useAssignApplicantMutation,
  useGetAgentsByBranchQuery,
} from "@/store/api/applicantDetailApi";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/Toast";
import {
  ArrowLeft,
  User,
  FileText,
  FolderOpen,
  MessageSquare,
  Loader2,
  Briefcase,
  Clock,
} from "lucide-react";
import { SkeletonProfilePage } from "@/components/ui/SkeletonLoader";



// ── Tab Config ──
const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "applications", label: "Applications", icon: FileText },
  { id: "documents", label: "Documents", icon: FolderOpen },
  { id: "notes", label: "Activity Notes", icon: MessageSquare },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ApplicantDetailPage() {
  const params = useParams();
  const applicantId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const { data: applicant, isLoading: isApplicantLoading, error } = useGetApplicantByIdQuery(applicantId);
  const { data: applications = [], isLoading: isAppsLoading } = useGetApplicantApplicationsQuery(applicantId);
  const { data: documents = [], isLoading: isDocsLoading } = useGetApplicantDocumentsQuery(applicantId);
  const { data: notes = [], isLoading: isNotesLoading } = useGetApplicantNotesQuery(applicantId);
  const [addNote, { isLoading: isSubmittingNote }] = useAddApplicantNoteMutation();
  const [assignAgent, { isLoading: isAssigning }] = useAssignApplicantMutation();
  
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const isManager = ["SYSTEM_ADMIN", "COMPANY_ADMIN", "BRANCH_MANAGER"].includes(userRole as string);

  // Fetch agents for the same branch as the applicant
  const { data: agentsRes, isLoading: isAgentsLoading } = useGetAgentsByBranchQuery(
    applicant?.branchId || "",
    { skip: !applicant?.branchId || !isManager }
  );
  const agents = agentsRes?.data || [];

  const { addToast } = useToast();

  const handleAssign = async (agentId: string) => {
    if (!agentId) return;
    try {
      await assignAgent({ applicantId, agentId }).unwrap();
      addToast("success", "Applicant assigned", "The applicant has been successfully assigned to the agent.");
    } catch (err) {
      console.error("Assignment failed", err);
      addToast("error", "Assignment failed", "Could not assign the applicant. Please try again.");
    }
  };

  const handleAddNote = async (text: string, type: string) => {
    try {
      await addNote({ applicantId, text, type }).unwrap();
    } catch (err) {
      console.error("Failed to add note", err);
    }
  };

  const isLoading = isApplicantLoading || isAppsLoading || isDocsLoading || isNotesLoading;

  if (isLoading) {
    return <SkeletonProfilePage />;
  }

  if (error || !applicant) {
    return (
      <div className="flex h-[50vh] items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <p className="text-destructive font-medium border border-destructive/20 bg-destructive/10 p-4 rounded-lg">
            Could not load the applicant details. They may have been removed or do not exist.
          </p>
          <Link href="/applicants" className="text-sm text-primary hover:underline">
            Return to Applicants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start gap-4">
        <Link
          href="/applicants"
          className="mt-1 p-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </Link>

        {/* Dynamic Fallback Avatar */}
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20 shrink-0 uppercase">
          {applicant.fullName
            .split(" ")
            .map((n: string) => n[0])
            .slice(0, 2)
            .join("")}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {applicant.fullName}
            </h1>
            <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {applicant.type}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Passport: {applicant.passportNumber} · {applicant.nationality} ·{" "}
            {applicant.phone || "No phone"}
          </p>
        </div>

        {/* ── Assignment Section (Only for Managers) ── */}
        {isManager && (
          <div className="shrink-0 flex items-center gap-2">
            <div className="text-right hidden sm:block mr-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Assigned Agent</p>
              <p className="text-sm font-medium">{applicant.assignedTo?.name || "Unassigned"}</p>
            </div>
            <select
              disabled={isAssigning || isAgentsLoading}
              value={applicant.assignedToId || ""}
              onChange={(e) => handleAssign(e.target.value)}
              className="h-9 px-3 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer disabled:opacity-50 min-w-[140px]"
            >
              <option value="">Select Agent...</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Briefcase className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{applications.length}</p>
            <p className="text-[11px] text-muted-foreground">Applications</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <FolderOpen className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{documents.length}</p>
            <p className="text-[11px] text-muted-foreground">Documents</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <MessageSquare className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{notes.length}</p>
            <p className="text-[11px] text-muted-foreground">Notes</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-foreground">{new Date(applicant.createdAt).toLocaleDateString()}</p>
            <p className="text-[11px] text-muted-foreground">Registered</p>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="border-b border-border">
        <nav className="flex gap-0 -mb-px overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.id === "applications" && applications.length > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {applications.length}
                  </span>
                )}
                {tab.id === "documents" && documents.length > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {documents.length}
                  </span>
                )}
                {tab.id === "notes" && notes.length > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {notes.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Tab Content ── */}
      <div>
        {activeTab === "profile" && <ProfileTab applicant={applicant} />}
        {activeTab === "applications" && (
          <ApplicationsTab applications={applications} applicantId={applicantId} />
        )}
        {activeTab === "documents" && (
          <DocumentsTab documents={documents} applicantId={applicantId} />
        )}
        {activeTab === "notes" && (
          <NotesTab
            notes={notes}
            applicantId={applicantId}
            onAddNote={handleAddNote}
            isSubmitting={isSubmittingNote}
          />
        )}
      </div>
    </div>
  );
}
