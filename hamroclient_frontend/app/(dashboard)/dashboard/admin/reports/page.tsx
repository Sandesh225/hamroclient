"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Loader2 } from "lucide-react";
import { useGetAdminDashboardQuery } from "@/store/api/dashboardApi";

const DATE_PRESETS = ["This Week", "This Month", "Last 3 Months", "This Year", "Custom"];

// Try to use semantic/design tokens for generic statuses
const STATUS_COLORS: Record<string, string> = {
  PENDING: "#94a3b8",
  DOCUMENTATION_GATHERING: "#3b82f6",
  VERIFICATION: "#6366f1",
  MEDICAL_PENDING: "#f59e0b",
  VISA_SUBMITTED: "#8b5cf6",
  PROCESSING: "#8b5cf6",
  APPROVED: "#10b981",
  REJECTED: "#ef4444",
  DEPLOYED: "#14b8a6",
  COMPLETED: "#06b6d4",
  CANCELLED: "#6b7280",
};

export default function ReportsPage() {
  const [preset, setPreset] = useState("This Month");
  const { data, isLoading, isError } = useGetAdminDashboardQuery();

  const monthlyDeployments = data?.monthlyDeployments || [];
  const statusDistribution = useMemo(
    () =>
      (data?.statusDistribution || []).map((s) => ({
        ...s,
        color: STATUS_COLORS[s.status] || "#94a3b8",
      })),
    [data?.statusDistribution]
  );
  const countryBreakdown = data?.countryBreakdown || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-muted-foreground gap-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm font-medium">Loading analytics data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-destructive gap-3">
        <p className="text-sm font-medium">Failed to load analytics data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Detailed breakdowns and trends across all operations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {DATE_PRESETS.slice(0, 4).map((p) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                preset === p
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">Applications vs Deployments (6 Mo)</h3>
          {monthlyDeployments.length === 0 ? (
            <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
              No historical data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyDeployments}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="apps" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Applications" />
                <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Deployed" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">Status Distribution</h3>
          {statusDistribution.length === 0 ? (
             <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
             No status data available.
           </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="count">
                    {statusDistribution.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {statusDistribution.map((s) => (
                  <span key={s.status} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.status.replace(/_/g, " ")} ({s.count})
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Country Breakdown Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border font-semibold text-foreground">
          Country-wise Breakdown
        </div>
        <div className="overflow-x-auto">
          {countryBreakdown.length === 0 ? (
             <div className="px-5 py-8 text-center text-sm text-muted-foreground">
               No country data recorded yet.
             </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Country</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                  <th className="px-5 py-3 text-right font-medium">Active</th>
                  <th className="px-5 py-3 text-right font-medium">Deployed</th>
                  <th className="px-5 py-3 text-right font-medium">Rejected</th>
                  <th className="px-5 py-3 text-right font-medium">Reject Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {countryBreakdown.map((row) => (
                  <tr key={row.country} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{row.country}</td>
                    <td className="px-5 py-3 text-right">{row.total}</td>
                    <td className="px-5 py-3 text-right">{row.active}</td>
                    <td className="px-5 py-3 text-right text-emerald-600 font-medium">{row.deployed}</td>
                    <td className="px-5 py-3 text-right text-red-500 font-medium">{row.rejected}</td>
                    <td className="px-5 py-3 text-right">
                      {row.total > 0 ? ((row.rejected / row.total) * 100).toFixed(1) : "0.0"}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
