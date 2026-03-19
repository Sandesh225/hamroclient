"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Users, FileText, Kanban, BarChart3, ArrowRight, Loader2 } from "lucide-react";
import { useGetApplicationsQuery } from "@/store/api/applicantApi";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuickAction {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
  category: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: "applicants", label: "All Applicants", description: "View and manage all applicants", href: "/applicants", icon: Users, category: "Navigate" },
  { id: "new-applicant", label: "Add New Applicant", description: "Create a new applicant profile", href: "/applicants/new", icon: Users, category: "Actions" },
  { id: "applications", label: "Active Applications", description: "View all active applications", href: "/applications", icon: FileText, category: "Navigate" },
  { id: "pipeline", label: "Pipeline Tracker", description: "Visual Kanban board for applications", href: "/applications/board", icon: Kanban, category: "Navigate" },
  { id: "dashboard-staff", label: "Staff Dashboard", description: "Your command center", href: "/dashboard/staff", icon: BarChart3, category: "Navigate" },
  { id: "dashboard-admin", label: "Admin Dashboard", description: "Analytics and overview", href: "/dashboard/admin", icon: BarChart3, category: "Navigate" },
];

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { data: searchData, isFetching } = useGetApplicationsQuery(
    { search: query, limit: 5 },
    { skip: query.length < 2 }
  );

  const apiResults: QuickAction[] = (searchData?.data || []).map((app: any) => ({
    id: app.id,
    label: app.fullName,
    description: `Case: HC-${app.id.slice(0, 6)} • ${app.destinationCountry || app.destination || "Not specified"}`,
    href: `/applicants/${app.id}`,
    icon: Users,
    category: "Applicants",
  }));

  const staticFiltered = query
    ? QUICK_ACTIONS.filter(
        (a) =>
          a.label.toLowerCase().includes(query.toLowerCase()) ||
          a.description.toLowerCase().includes(query.toLowerCase())
      )
    : QUICK_ACTIONS;

  const filtered = query.length >= 2 ? [...apiResults, ...staticFiltered] : staticFiltered;

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[selectedIndex]) {
          router.push(filtered[selectedIndex].href);
          onClose();
        }
        break;
      case "Escape":
        onClose();
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Palette */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-xl w-full mx-4 overflow-hidden animate-[scaleIn_0.15s_ease-out]">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, actions, applicants..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border">
            ESC
          </kbd>
        </div>

        <div className="max-h-72 overflow-y-auto py-2">
          {isFetching ? (
            <div className="px-5 py-8 text-center flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mb-2" />
              <p className="text-sm">Searching...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No results for &ldquo;{query}&rdquo;
              </p>
            </div>
          ) : (
            filtered.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => {
                    router.push(action.href);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center gap-3 w-full px-5 py-2.5 text-left transition-colors ${
                    idx === selectedIndex
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {action.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {action.description}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 shrink-0">
                    {action.category}
                  </span>
                  {idx === selectedIndex && (
                    <ArrowRight className="w-3 h-3 text-primary shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-5 py-2.5 border-t border-border bg-muted/30 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 font-mono bg-muted rounded border border-border">↑↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 font-mono bg-muted rounded border border-border">↵</kbd>
            select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 font-mono bg-muted rounded border border-border">esc</kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
}
