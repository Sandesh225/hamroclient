"use client";

import type { ApplicantNote } from "@/store/api/applicantDetailApi";
import { useState } from "react";
import {
  useUpdateApplicantNoteMutation,
  useDeleteApplicantNoteMutation,
} from "@/store/api/applicantDetailApi";
import {
  MessageSquare,
  Phone,
  Mail,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  Send,
  Loader2,
  Trash2,
  Pencil,
  X,
  Save,
} from "lucide-react";

interface NotesTabProps {
  notes: ApplicantNote[];
  applicantId: string;
  onAddNote: (text: string, type: string) => Promise<void>;
  isSubmitting: boolean;
}

const noteTypeConfig: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  GENERAL: {
    icon: MessageSquare,
    color: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800",
    label: "General",
  },
  FOLLOW_UP: {
    icon: RefreshCw,
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
    label: "Follow Up",
  },
  WARNING: {
    icon: AlertTriangle,
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
    label: "Warning",
  },
  UPDATE: {
    icon: CheckCircle,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
    label: "Update",
  },
  CALL: {
    icon: Phone,
    color: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800",
    label: "Phone Call",
  },
  EMAIL: {
    icon: Mail,
    color: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
    label: "Email",
  },
};

const NOTE_TYPES = Object.keys(noteTypeConfig);

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotesTab({
  notes,
  applicantId,
  onAddNote,
  isSubmitting,
}: NotesTabProps) {
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState("GENERAL");

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState("");
  const [editNoteType, setEditNoteType] = useState("GENERAL");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [updateNote, { isLoading: isUpdating }] = useUpdateApplicantNoteMutation();
  const [deleteNote] = useDeleteApplicantNoteMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    await onAddNote(newNote.trim(), noteType);
    setNewNote("");
    setNoteType("GENERAL");
  };

  const handleEditClick = (note: ApplicantNote) => {
    setEditingId(note.id);
    setEditNoteText(note.text);
    setEditNoteType(note.type);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditNoteText("");
  };

  const handleSaveEdit = async (noteId: string) => {
    if (!editNoteText.trim()) return;
    try {
      await updateNote({
        id: noteId,
        applicantId,
        data: { text: editNoteText.trim(), type: editNoteType },
      }).unwrap();
      setEditingId(null);
    } catch (err) {
      console.error("Failed to update note:", err);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this activity note?")) return;
    setDeletingId(noteId);
    try {
      await deleteNote({ id: noteId, applicantId }).unwrap();
    } catch (err) {
      console.error("Failed to delete note:", err);
      setDeletingId(null); // Reset on error
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Add Note Form ── */}
      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-xl p-5"
      >
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Add Activity Note
        </h3>

        {/* Note Type Selector */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {NOTE_TYPES.map((type) => {
            const config = noteTypeConfig[type];
            const Icon = config.icon;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setNoteType(type)}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  noteType === type
                    ? "bg-primary text-primary-foreground border-primary"
                    : `${config.color} hover:opacity-80`
                }`}
              >
                <Icon className="w-3 h-3" />
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Text Input */}
        <div className="flex gap-3">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="e.g., Called applicant on Tuesday, requested updated bank statement..."
            rows={3}
            className="flex-1 bg-background border border-input rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <button
            type="submit"
            disabled={!newNote.trim() || isSubmitting}
            className="self-end px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Post
          </button>
        </div>
      </form>

      {/* ── Timeline ── */}
      {notes.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 flex flex-col items-center text-center">
          <MessageSquare className="w-10 h-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            No activity notes yet. Add the first one above.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />

          <div className="space-y-0">
            {notes.map((note) => {
              const isEditing = editingId === note.id;
              const isDeleting = deletingId === note.id;
              
              // If editing, use the edited type's config, otherwise use original
              const displayType = isEditing ? editNoteType : note.type;
              const config = noteTypeConfig[displayType] || noteTypeConfig.GENERAL;
              const Icon = config.icon;

              return (
                <div key={note.id} className="relative flex gap-4 pb-6 group/timeline">
                  {/* Timeline dot */}
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 ${config.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content Container */}
                  <div className={`flex-1 bg-card border rounded-xl p-4 transition-all relative group/note
                    ${isEditing ? "border-primary/30 ring-2 ring-primary/10" : "border-border hover:shadow-sm"}
                    ${isDeleting ? "opacity-50 pointer-events-none" : ""}  
                  `}>
                    
                    {/* Actions Menu (Top Right) */}
                    {!isEditing && (
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover/note:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditClick(note)}
                          className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          title="Edit note"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="p-1.5 rounded-md text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="Delete note"
                        >
                          {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${config.color}`}
                        >
                          {config.label}
                        </span>
                        {note.createdBy && (
                          <span className="text-xs text-muted-foreground">
                            by <span className="font-medium text-foreground">{note.createdBy.name}</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground pr-10">
                        {formatDateTime(note.createdAt)}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3 mt-3">
                        {/* Edit Note Type Selector */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {NOTE_TYPES.map((type) => {
                            const typeConf = noteTypeConfig[type];
                            const TypeIcon = typeConf.icon;
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setEditNoteType(type)}
                                className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border transition-colors ${
                                  editNoteType === type
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background text-muted-foreground border-border hover:bg-muted"
                                }`}
                              >
                                <TypeIcon className="w-3 h-3" />
                                {typeConf.label}
                              </button>
                            );
                          })}
                        </div>
                        
                        <textarea
                          value={editNoteText}
                          onChange={(e) => setEditNoteText(e.target.value)}
                          rows={3}
                          className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        />
                        
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={handleCancelEdit}
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(note.id)}
                            disabled={isUpdating || !editNoteText.trim()}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                          >
                            {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {note.text}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
