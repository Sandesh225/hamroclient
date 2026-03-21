"use client";

import { useState } from "react";
import { Search, Filter, ChevronRight, Loader2 } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { useGetAuditLogsQuery } from "@/store/api/auditApi";

export default function AuditLogPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterAgent, setFilterAgent] = useState("");
  const [filterAction, setFilterAction] = useState("");

  const { data, isLoading } = useGetAuditLogsQuery({
    search: debouncedSearch,
    agent: filterAgent,
    action: filterAction,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
  };

  const logs = data?.data || [];

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
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applicant or notes..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </form>
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Fetching audit logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No matching audit records found for this company.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
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
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate" title={log.notes || ""}>
                      {log.notes || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
