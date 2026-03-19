"use client";

import { useState } from "react";
import {
  X,
  User,
  FileText,
  Clock,
  Stethoscope,
  StickyNote,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Edit2,
  Upload,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Send,
  Loader2,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  useGetApplicantByIdQuery,
  useGetApplicantApplicationsQuery,
  useGetApplicantDocumentsQuery,
  useGetApplicantNotesQuery,
  useAddApplicantNoteMutation,
} from "@/store/api/applicantDetailApi";

interface ApplicantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  applicantId: string | null;
}

// ── UI Data ──

const TAB_ITEMS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "documents", label: "Docs", icon: FileText },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "medical", label: "Medical", icon: Stethoscope },
  { id: "notes", label: "Notes", icon: StickyNote },
];

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const noteTypeColors: Record<string, string> = {
  General: "bg-blue-50 text-blue-700 border-blue-200",
  "Follow-Up": "bg-amber-50 text-amber-700 border-amber-200",
  Warning: "bg-red-50 text-red-700 border-red-200",
  Call: "bg-green-50 text-green-700 border-green-200",
  Email: "bg-violet-50 text-violet-700 border-violet-200",
};

export default function ApplicantDrawer({
  isOpen,
  onClose,
  applicantId,
}: ApplicantDrawerProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState("General");
  const { data: profile, isLoading: isProfileLoading } = useGetApplicantByIdQuery(applicantId || "", { skip: !applicantId });
  const { data: documentsData, isLoading: isDocsLoading } = useGetApplicantDocumentsQuery(applicantId || "", { skip: !applicantId });
  const { data: notesData, isLoading: isNotesLoading } = useGetApplicantNotesQuery(applicantId || "", { skip: !applicantId });
  const { data: appsData, isLoading: isAppsLoading } = useGetApplicantApplicationsQuery(applicantId || "", { skip: !applicantId });
  const [addNote, { isLoading: isAddingNote }] = useAddApplicantNoteMutation();

  if (!isOpen || !applicantId) return null;

  const activeApp = appsData?.[0]; // Default to the first application
  const data = profile ? {
    ...profile,
    caseNumber: `HC-${profile.id.slice(0, 6).toUpperCase()}`,
    destination: activeApp?.destinationCountry || "N/A",
    jobPosition: activeApp?.jobPosition || "N/A",
    status: activeApp?.status || "PENDING",
    address: profile.currentAddress || "N/A",
    bloodGroup: "N/A", // Not stored in schema yet
    passportExpiry: profile.passportExpiryDate,
  } : null;

  const handleAddNote = async () => {
    if (!noteText.trim() || !applicantId) return;
    try {
      await addNote({ applicantId, text: noteText, type: noteType }).unwrap();
      setNoteText("");
    } catch (err) {
      console.error(err);
    }
  };

  if (isProfileLoading || !data) {
    return (
      <>
        <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="fixed right-0 top-0 h-full w-full max-w-[480px] z-70 bg-card border-l border-border shadow-2xl flex flex-col items-center justify-center animate-[slideIn_0.2s_ease-out]">
           <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  // Fallback for missing mock data properties that the drawer depends on
  const daysUntilExpiry = null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-[480px] z-70 bg-card border-l border-border shadow-2xl flex flex-col animate-[slideIn_0.2s_ease-out]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
                {data.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{data.fullName}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-mono text-muted-foreground">{data.caseNumber}</span>
                  <StatusBadge status={data.status} />
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {data.destination}</span>
            <span>•</span>
            <span>{data.jobPosition}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-5 border-b border-border shrink-0">
          {TAB_ITEMS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="p-5 space-y-4">
              {[
                { title: "Personal Information", fields: [
                  { label: "Date of Birth", value: formatDate(data.dateOfBirth), icon: Calendar },
                  { label: "Gender", value: data.gender },
                  { label: "Nationality", value: data.nationality },
                  { label: "Marital Status", value: data.maritalStatus },
                  { label: "Blood Group", value: data.bloodGroup },
                ]},
                { title: "Passport", fields: [
                  { label: "Passport #", value: data.passportNumber, icon: CreditCard },
                  { label: "Expiry", value: formatDate(data.passportExpiry) },
                ]},
                { title: "Contact", fields: [
                  { label: "Phone", value: data.phone, icon: Phone },
                  { label: "Email", value: data.email, icon: Mail },
                  { label: "Address", value: data.address, icon: MapPin },
                ]},
              ].map((section) => (
                <div key={section.title} className="border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">{section.title}</h3>
                    <button className="p-1 rounded hover:bg-muted transition-colors">
                      <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {section.fields.map((field) => (
                      <div key={field.label} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{field.label}</span>
                        <span className="font-medium text-foreground">{field.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <div className="p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-foreground">Document Completion</span>
                  <span className="text-xs font-bold text-primary">
                    {Math.round(((documentsData || []).filter((d) => d.s3Url).length / Math.max((documentsData || []).length, 1)) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: `${((documentsData || []).filter((d) => d.s3Url).length / Math.max((documentsData || []).length, 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {isDocsLoading && <div className="p-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></div>}
              
              <div className="space-y-2">
                {(documentsData || []).map((doc) => {
                  const isUploaded = !!doc.s3Url;
                  const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
                  
                  return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      isUploaded && !isExpired ? "bg-emerald-500" : isExpired ? "bg-red-500" : "bg-amber-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                      <p className="text-[11px] text-muted-foreground">{doc.category}</p>
                    </div>
                    {isUploaded && !isExpired ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : isExpired ? (
                      <span className="flex items-center gap-1 text-[10px] text-red-600 font-medium">
                        <AlertTriangle className="w-3 h-3" /> Expired
                      </span>
                    ) : (
                      <button className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        <Upload className="w-3 h-3" /> Upload
                      </button>
                    )}
                  </div>
                )})}
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === "timeline" && (
            <div className="p-5">
              {/* Status action buttons */}
              <div className="flex items-center gap-2 mb-5">
                <StatusBadge status={data.status} size="md" />
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                  Mark as Verifying
                </button>
              </div>

              <div className="space-y-0 relative">
                <div className="absolute left-[13px] top-6 bottom-6 w-px bg-border" />
                {isAppsLoading && <div className="p-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></div>}
                
                {/* Timeline mock replacement since no timeline API is specified yet */}
                {!isAppsLoading && (appsData || []).map((app) => (
                  <div key={app.id} className="flex gap-4 relative pb-6 last:pb-0">
                    <div className="w-7 h-7 rounded-full bg-card border-2 border-border flex items-center justify-center z-10 shrink-0">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Application Created: {app.destinationCountry}</p>
                      {app.status && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <StatusBadge status={app.status} />
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
                        <span>{app.visaType}</span>
                        <span>•</span>
                        <span>{formatRelative(app.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

            <div className="p-5 space-y-4 text-center">
                <p className="text-sm text-muted-foreground">Medical functionality not yet fully integrated with remote API.</p>
            </div>

          {/* Notes Tab */}
          {activeTab === "notes" && (
            <div className="p-5 space-y-4">
              {/* Add Note */}
              <div className="border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value)}
                    className="px-2 py-1 rounded-lg bg-background border border-input text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {["General", "Follow-Up", "Warning", "Call", "Email"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Add a note..."
                />
                <button
                  disabled={!noteText.trim() || isAddingNote}
                  onClick={handleAddNote}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {isAddingNote ? <Loader2 className="w-3 h-3 animate-spin"/> : <Send className="w-3 h-3" />} Add Note
                </button>
              </div>

              {/* Notes List */}
              {isNotesLoading ? (
                <div className="p-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></div>
              ) : (notesData || []).map((note) => (
                <div key={note.id} className="border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${noteTypeColors[note.type] || noteTypeColors.General}`}>
                      {note.type}
                    </span>
                    <span className="text-xs text-muted-foreground">{note.createdBy?.name || "System"}</span>
                    <span className="text-[11px] text-muted-foreground/60 ml-auto">{formatRelative(note.createdAt)}</span>
                  </div>
                  <p className="text-sm text-foreground">{note.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
