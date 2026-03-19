"use client";

import { useState } from "react";
import { Search, Filter, ChevronRight } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";

const MOCK_AUDIT = [
  { id: "log1", date: "2026-03-18T04:00:00Z", action: "Status Change", applicant: "Ram B. Tamang", changedBy: "Anita Shrestha", fromStatus: "PENDING", toStatus: "DOCUMENTATION_GATHERING", notes: "Initial document collection started" },
  { id: "log2", date: "2026-03-18T01:15:00Z", action: "Status Change", applicant: "Gita Adhikari", changedBy: "Rajesh Pokharel", fromStatus: "PROCESSING", toStatus: "APPROVED", notes: "Visa approved by embassy" },
  { id: "log3", date: "2026-03-17T22:00:00Z", action: "Document Upload", applicant: "Sita Sharma", changedBy: "Anita Shrestha", fromStatus: null, toStatus: null, notes: "Uploaded police clearance certificate" },
  { id: "log4", date: "2026-03-17T18:00:00Z", action: "Status Change", applicant: "Hari P. Oli", changedBy: "System", fromStatus: "VERIFICATION", toStatus: "MEDICAL_PENDING", notes: "Auto-advanced after document verification" },
  { id: "log5", date: "2026-03-17T15:00:00Z", action: "Status Change", applicant: "Puja Gurung", changedBy: "Rajesh Pokharel", fromStatus: "MEDICAL_PENDING", toStatus: "VISA_SUBMITTED", notes: null },
  { id: "log6", date: "2026-03-17T12:00:00Z", action: "Note Added", applicant: "Sunil Thapa", changedBy: "Anita Shrestha", fromStatus: null, toStatus: null, notes: "Follow up call about pending documents" },
  { id: "log7", date: "2026-03-16T08:00:00Z", action: "Status Change", applicant: "Deepak B.K.", changedBy: "Embassy", fromStatus: "PROCESSING", toStatus: "REJECTED", notes: "Visa application denied — insufficient documentation" },
  { id: "log8", date: "2026-03-15T14:00:00Z", action: "Applicant Created", applicant: "Manoj Shrestha", changedBy: "Anita Shrestha", fromStatus: null, toStatus: "PENDING", notes: "Walk-in applicant registered at Kathmandu branch" },
];

export default function AuditLogPage() {
  const [search, setSearch] = useState("");
  const [filterAgent, setFilterAgent] = useState("");
  const [filterAction, setFilterAction] = useState("");

  const filtered = MOCK_AUDIT.filter((log) => {
    if (search && !log.applicant.toLowerCase().includes(search.toLowerCase()) && !log.action.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterAgent && log.changedBy !== filterAgent) return false;
    if (filterAction && log.action !== filterAction) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Complete history of all status changes and actions.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applicant or action..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select value={filterAgent} onChange={(e) => setFilterAgent(e.target.value)} className="px-3 py-2 rounded-lg bg-card border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">All Users</option>
          <option value="Anita Shrestha">Anita Shrestha</option>
          <option value="Rajesh Pokharel">Rajesh Pokharel</option>
          <option value="System">System</option>
        </select>
        <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="px-3 py-2 rounded-lg bg-card border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">All Actions</option>
          <option value="Status Change">Status Change</option>
          <option value="Document Upload">Document Upload</option>
          <option value="Note Added">Note Added</option>
          <option value="Applicant Created">Applicant Created</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Date/Time</th>
                <th className="px-4 py-3 text-left font-medium">Action</th>
                <th className="px-4 py-3 text-left font-medium">Applicant</th>
                <th className="px-4 py-3 text-left font-medium">Changed By</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.date).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-1 rounded-lg bg-muted text-foreground">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{log.applicant}</td>
                  <td className="px-4 py-3 text-muted-foreground">{log.changedBy}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {log.fromStatus && (
                        <>
                          <StatusBadge status={log.fromStatus} />
                          <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        </>
                      )}
                      {log.toStatus && <StatusBadge status={log.toStatus} />}
                      {!log.fromStatus && !log.toStatus && <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                    {log.notes || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
