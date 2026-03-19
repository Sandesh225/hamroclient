"use client";

import { useState } from "react";
import KanbanCard from "@/components/staff/KanbanCard";
import type { BoardApplication } from "@/store/api/applicationBoardApi";
import { Loader2 } from "lucide-react";

// ── Column Definitions ──
const PIPELINE_COLUMNS = [
  {
    id: "pending_docs",
    title: "Pending Docs",
    statuses: ["PENDING", "DOCUMENTATION_GATHERING"],
    headerColor: "bg-amber-500",
  },
  {
    id: "ready_to_lodge",
    title: "Ready for Embassy",
    statuses: ["VERIFICATION", "MEDICAL_PENDING"],
    headerColor: "bg-blue-500",
  },
  {
    id: "lodged_processing",
    title: "Embassy / Processing",
    statuses: ["VISA_SUBMITTED", "PROCESSING"],
    headerColor: "bg-violet-500",
  },
  {
    id: "decision_received",
    title: "Decision Received",
    statuses: ["APPROVED", "REJECTED"],
    headerColor: "bg-emerald-500",
  },
];

const ALL_STATUSES = [
  "PENDING",
  "DOCUMENTATION_GATHERING",
  "VERIFICATION",
  "MEDICAL_PENDING",
  "VISA_SUBMITTED",
  "PROCESSING",
  "APPROVED",
  "REJECTED",
  "DEPLOYED",
  "COMPLETED",
  "CANCELLED",
];

interface KanbanBoardProps {
  applications: BoardApplication[];
  onStatusChange: (applicationId: string, newStatus: string) => void;
  updatingId: string | null;
}

function getDaysInStage(lastStatusChangeAt: string): number {
  const changed = new Date(lastStatusChangeAt).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - changed) / 86400000));
}

export default function KanbanBoard({
  applications,
  onStatusChange,
  updatingId,
}: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
      {PIPELINE_COLUMNS.map((column) => {
        const columnApps = applications.filter((app) =>
          column.statuses.includes(app.status)
        );

        return (
          <div
            key={column.id}
            className="bg-muted/30 border border-border rounded-xl overflow-hidden min-h-[300px]"
          >
            {/* Column Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
              <div
                className={`w-2.5 h-2.5 rounded-full ${column.headerColor}`}
              />
              <h3 className="text-sm font-semibold text-foreground">
                {column.title}
              </h3>
              <span className="ml-auto text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {columnApps.length}
              </span>
            </div>

            {/* Cards Container */}
            <div className="p-3 space-y-3">
              {columnApps.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-muted-foreground/60">
                    No applications
                  </p>
                </div>
              ) : (
                columnApps.map((app) => (
                  <KanbanCard
                    key={app.id}
                    id={app.id}
                    applicantName={app.applicantName}
                    applicantId={app.applicantId}
                    destinationCountry={app.destinationCountry}
                    visaType={app.visaType}
                    jobPosition={app.jobPosition}
                    status={app.status}
                    daysInStage={getDaysInStage(app.lastStatusChangeAt)}
                    allStatuses={ALL_STATUSES}
                    onStatusChange={onStatusChange}
                    isUpdating={updatingId === app.id}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
