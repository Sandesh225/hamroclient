"use client";

import { useState } from "react";
import type { ApplicantDocument } from "@/store/api/applicantDetailApi";
import {
  useGetSecureDocumentUrlQuery,
  useUpdateDocumentStatusMutation,
  useDeleteDocumentMutation,
} from "@/store/api/applicantDetailApi";
import {
  X,
  ShieldCheck,
  Ban,
  UploadCloud,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  DownloadCloud,
} from "lucide-react";

interface DocumentReviewModalProps {
  document: ApplicantDocument;
  applicantId: string;
  onClose: () => void;
}

export default function DocumentReviewModal({
  document,
  applicantId,
  onClose,
}: DocumentReviewModalProps) {
  const { data, isLoading, isError } = useGetSecureDocumentUrlQuery(document.id);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateDocumentStatusMutation();
  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();

  const [expiryDate, setExpiryDate] = useState(
    document.expiryDate ? new Date(document.expiryDate).toISOString().split("T")[0] : ""
  );
  const [isAttested, setIsAttested] = useState(document.isAttested);

  const handleUpdate = async (status: boolean | null) => {
    try {
      const payload: Partial<ApplicantDocument> = {
        isAttested,
      };

      if (expiryDate) {
        payload.expiryDate = new Date(expiryDate).toISOString();
      }

      if (status !== null) {
        payload.isVerified = status;
      }

      await updateStatus({
        id: document.id,
        applicantId,
        data: payload,
      }).unwrap();

    } catch (err) {
      console.error("Failed to update document status:", err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this document? This removes the file from secure storage and cannot be undone.")) return;
    try {
      await deleteDocument({ docId: document.id, applicantId }).unwrap();
      onClose();
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl h-[85vh] bg-card border border-border shadow-2xl rounded-2xl flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* ── Left Column: Document Viewer ── */}
        <div className="flex-1 bg-muted/30 border-b md:border-b-0 md:border-r border-border flex flex-col relative">
          <div className="absolute top-4 left-4 z-10">
             <span className="bg-background/80 backdrop-blur border border-border px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm">
               {document.title}
             </span>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center text-muted-foreground gap-3">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm font-medium">Generating secure viewing link...</p>
              </div>
            ) : isError || !data?.success ? (
              <div className="flex flex-col items-center text-destructive gap-3 text-center px-4">
                <AlertTriangle className="w-8 h-8" />
                <p className="text-sm font-medium">Failed to load secure document.</p>
                <p className="text-xs opacity-80">The file might have been moved or the signature expired.</p>
              </div>
            ) : data.mimeType === "application/pdf" ? (
              <div className="w-full h-full flex flex-col relative">
                <iframe
                  src={`${data.signedUrl}#view=FitH`}
                  title={document.title}
                  className="w-full h-full rounded-xl border border-border/50 shadow-inner"
                />
                {/* Fallback link always visible or below in case of issues */}
                <div className="mt-4 flex justify-center">
                  <a 
                    href={data.signedUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground hover:text-foreground rounded-lg text-xs font-medium border border-border transition-colors"
                  >
                    <DownloadCloud className="w-4 h-4" /> Open PDF in new tab
                  </a>
                </div>
              </div>
            ) : (
              <img 
                src={data.signedUrl} 
                alt={document.title}
                className="max-w-full max-h-full object-contain rounded-xl shadow-inner border border-border/50"
              />
            )}
          </div>
        </div>

        {/* ── Right Column: Metadata & Controls ── */}
        <div className="w-full md:w-[400px] flex flex-col bg-card shrink-0">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Review Document</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* Meta Info */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Details</p>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1 text-muted-foreground">Category</td>
                    <td className="py-1 font-medium">{document.category}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-muted-foreground">Uploaded</td>
                    <td className="py-1 font-medium">{new Date(document.uploadedAt).toLocaleDateString()}</td>
                  </tr>
                  {document.countrySpecific && document.countrySpecific !== "ALL" && (
                    <tr>
                      <td className="py-1 text-muted-foreground">Country</td>
                      <td className="py-1 font-medium">{document.countrySpecific}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Verification Status Controls */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-3">Verification</p>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleUpdate(true)}
                  disabled={isUpdating}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    document.isVerified 
                      ? "border-emerald-500 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/30" 
                      : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-xs font-semibold">Verified</span>
                </button>
                
                <button
                  onClick={() => handleUpdate(false)}
                  disabled={isUpdating}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    !document.isVerified 
                      ? "border-amber-500 bg-amber-50/50 text-amber-700 dark:bg-amber-950/30" 
                      : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Ban className="w-5 h-5" />
                  <span className="text-xs font-semibold">Rejected / Reset</span>
                </button>
              </div>
            </div>

            {/* Additional Metadata Updates */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAttested}
                    onChange={(e) => setIsAttested(e.target.checked)}
                    className="w-4 h-4 rounded text-primary border-border focus:ring-primary/30"
                  />
                  <span className="text-sm font-medium text-foreground">
                    Document is officially attested (MOFA/Embassy)
                  </span>
                </label>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => handleUpdate(null)}
                  disabled={isUpdating || (isAttested === document.isAttested && expiryDate === (document.expiryDate ? new Date(document.expiryDate).toISOString().split('T')[0] : ""))}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50 transition-colors"
                >
                  {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Save Metadata
                </button>
              </div>
            </div>

          </div>

          {/* Danger Zone */}
          <div className="p-5 border-t border-border bg-destructive/5">
            <button
               onClick={handleDelete}
               disabled={isDeleting}
               className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-destructive border border-destructive/20 hover:bg-destructive hover:text-destructive-foreground rounded-lg transition-colors"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Permanently Delete File
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
