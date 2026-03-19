"use client";

import { useState } from "react";
import {
  Globe,
  Clock,
  ChevronDown,
  GripVertical,
  Loader2,
} from "lucide-react";

interface KanbanCardProps {
  id: string;
  applicantName: string;
  applicantId: string;
  destinationCountry: string | null;
  visaType: string | null;
  jobPosition: string | null;
  status: string;
  daysInStage: number;
  allStatuses: string[];
  onStatusChange: (applicationId: string, newStatus: string) => void;
  isUpdating: boolean;
}

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  DOCUMENTATION_GATHERING: "Documentation Gathering",
  VERIFICATION: "Verification",
  MEDICAL_PENDING: "Medical Pending",
  VISA_SUBMITTED: "Visa Submitted",
  PROCESSING: "Processing",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  DEPLOYED: "Deployed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function getDaysColor(days: number) {
  if (days <= 3) return "text-emerald-600 bg-emerald-50";
  if (days <= 7) return "text-amber-600 bg-amber-50";
  if (days <= 14) return "text-orange-600 bg-orange-50";
  return "text-red-600 bg-red-50";
}

export default function KanbanCard({
  id,
  applicantName,
  destinationCountry,
  visaType,
  jobPosition,
  status,
  daysInStage,
  allStatuses,
  onStatusChange,
  isUpdating,
}: KanbanCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="bg-card border border-border rounded-lg p-3.5 shadow-sm hover:shadow-md transition-shadow group cursor-default">
      {/* Top Row: Grip + Name */}
      <div className="flex items-start gap-2 mb-2">
        <GripVertical className="w-4 h-4 text-muted-foreground/30 mt-0.5 shrink-0 group-hover:text-muted-foreground transition-colors cursor-grab" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {applicantName}
          </p>
          {destinationCountry && (
            <div className="flex items-center gap-1 mt-0.5">
              <Globe className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {destinationCountry}
                {visaType ? ` · ${visaType}` : ""}
              </span>
            </div>
          )}
          {jobPosition && (
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {jobPosition}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Row: Days indicator + Status Changer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${getDaysColor(daysInStage)}`}
        >
          <Clock className="w-3 h-3" />
          {daysInStage}d
        </span>

        {/* Status Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={isUpdating}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border hover:bg-muted transition-colors disabled:opacity-50"
          >
            {isUpdating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                Move
                <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>

          {showDropdown && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              {/* Dropdown */}
              <div className="absolute right-0 bottom-full mb-1 z-50 w-52 bg-popover border border-border rounded-lg shadow-lg py-1 max-h-64 overflow-y-auto">
                {allStatuses
                  .filter((s) => s !== status)
                  .map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        onStatusChange(id, s);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors text-foreground"
                    >
                      {statusLabels[s] || s.replace(/_/g, " ")}
                    </button>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
