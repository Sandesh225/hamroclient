"use client";

import { useState, useRef } from "react";
import type { ApplicantDocument } from "@/store/api/applicantDetailApi";
import {
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
} from "@/store/api/applicantDetailApi";
import {
  FileText,
  ShieldCheck,
  Clock,
  XCircle,
  ExternalLink,
  Filter,
  Upload,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  CloudUpload,
  File,
} from "lucide-react";
import DocumentReviewModal from "./DocumentReviewModal";

interface DocumentsTabProps {
  documents: ApplicantDocument[];
  applicantId: string;
}

const categoryLabels: Record<string, string> = {
  IDENTITY: "Identity",
  ACADEMIC: "Academic",
  FINANCIAL: "Financial",
  MEDICAL: "Medical",
  VISA_SPECIFIC: "Visa Specific",
  OTHER: "Other",
};

const categoryColors: Record<string, string> = {
  IDENTITY: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
  ACADEMIC: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
  FINANCIAL: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  MEDICAL: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800",
  VISA_SPECIFIC: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
  OTHER: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/50 dark:text-gray-400 dark:border-gray-700",
};

// ── Upload Modal ──
function UploadModal({
  applicantId,
  onClose,
}: {
  applicantId: string;
  onClose: () => void;
}) {
  const [uploadDocument, { isLoading }] = useUploadDocumentMutation();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("OTHER");
  const [countrySpecific, setCountrySpecific] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (!title) setTitle(droppedFile.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (!title) setTitle(selected.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSubmit = async () => {
    if (!file || !title) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("applicantId", applicantId);
    formData.append("title", title);
    formData.append("category", category);
    if (countrySpecific) formData.append("countrySpecific", countrySpecific);

    try {
      await uploadDocument(formData).unwrap();
      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <CloudUpload className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Upload Document</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {success ? (
          <div className="p-12 flex flex-col items-center text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
            <p className="text-lg font-semibold text-foreground">Upload Successful!</p>
            <p className="text-sm text-muted-foreground">Document has been saved.</p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : file
                  ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/30 dark:border-emerald-700"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.xls,.xlsx"
              />
              {file ? (
                <div className="flex items-center gap-3 justify-center">
                  <File className="w-8 h-8 text-emerald-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground truncate max-w-[250px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} · Click or drop to replace
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">
                    Drop file here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOC, JPG, PNG, XLS — max 10MB
                  </p>
                </>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Document Title *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="e.g. Passport Scan, Medical Certificate"
              />
            </div>

            {/* Category + Country */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Country Specific
                </label>
                <select
                  value={countrySpecific}
                  onChange={(e) => setCountrySpecific(e.target.value)}
                  className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="">All Countries</option>
                  <option value="JAPAN">Japan</option>
                  <option value="UAE">UAE</option>
                  <option value="QATAR">Qatar</option>
                  <option value="AUSTRALIA">Australia</option>
                  <option value="USA">USA</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {!success && (
          <div className="flex items-center justify-end gap-2 p-5 pt-0">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-xs font-medium px-4 py-2 rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !file || !title}
              className="text-xs font-semibold px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Documents Tab ──
export default function DocumentsTab({ documents, applicantId }: DocumentsTabProps) {
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [showUpload, setShowUpload] = useState(false);
  const [reviewingDoc, setReviewingDoc] = useState<ApplicantDocument | null>(null);
  
  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const categories = Array.from(new Set(documents.map((d) => d.category)));

  const filtered =
    filterCategory === "ALL"
      ? documents
      : documents.filter((d) => d.category === filterCategory);

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    setDeletingId(docId);
    try {
      await deleteDocument({ applicantId, docId }).unwrap();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Action Bar ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <button
            onClick={() => setFilterCategory("ALL")}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              filterCategory === "ALL"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            All ({documents.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                filterCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {categoryLabels[cat] || cat} ({documents.filter((d) => d.category === cat).length})
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload Document
        </button>
      </div>

      {/* ── Empty State ── */}
      {documents.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="w-7 h-7 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No documents yet</p>
          <p className="text-xs text-muted-foreground mb-4">
            Upload passports, certificates, medical records, and more.
          </p>
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload First Document
          </button>
        </div>
      ) : (
        /* ── Document Grid ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className={`bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all group relative ${
                deletingId === doc.id ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {/* Delete button */}
              <button
                onClick={() => handleDelete(doc.id)}
                disabled={isDeleting}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 opacity-0 group-hover:opacity-100 transition-all"
                title="Delete document"
              >
                {deletingId === doc.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>

              <div className="flex items-start gap-2 mb-3">
                <div className="p-2 rounded-lg bg-muted shrink-0">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate pr-8">
                    {doc.title}
                  </p>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                      categoryColors[doc.category] ||
                      "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {categoryLabels[doc.category] || doc.category}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-1.5 mb-3">
                {doc.isVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                ) : doc.isAttested ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800">
                    <ShieldCheck className="w-3 h-3" />
                    Attested
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800">
                    <Clock className="w-3 h-3" />
                    Pending Review
                  </span>
                )}
              </div>

              {/* Meta */}
              <div className="text-[11px] text-muted-foreground space-y-0.5">
                <p>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                {doc.expiryDate && (
                  <p className="flex items-center gap-1">
                    {new Date(doc.expiryDate) < new Date() ? (
                      <>
                        <XCircle className="w-3 h-3 text-destructive" />
                        <span className="text-destructive font-medium">
                          Expired: {new Date(doc.expiryDate).toLocaleDateString()}
                        </span>
                      </>
                    ) : (
                      <>Expires: {new Date(doc.expiryDate).toLocaleDateString()}</>
                    )}
                  </p>
                )}
                {doc.countrySpecific && doc.countrySpecific !== "ALL" && (
                  <p>Country: {doc.countrySpecific}</p>
                )}
              </div>

              {/* Review Button */}
              <button
                onClick={() => setReviewingDoc(doc)}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-xs font-semibold text-primary hover:bg-primary/20 opacity-0 group-hover:opacity-100 transition-all w-full justify-center"
              >
                Review Document
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal
          applicantId={applicantId}
          onClose={() => setShowUpload(false)}
        />
      )}

      {/* Review Modal */}
      {reviewingDoc && (
        <DocumentReviewModal
          document={reviewingDoc}
          applicantId={applicantId}
          onClose={() => setReviewingDoc(null)}
        />
      )}
    </div>
  );
}
