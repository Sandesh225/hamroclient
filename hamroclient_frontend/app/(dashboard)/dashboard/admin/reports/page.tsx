"use client";

import { useState } from "react";
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
  LineChart,
  Line,
} from "recharts";
import { Calendar, Download } from "lucide-react";

const DATE_PRESETS = ["This Week", "This Month", "Last 3 Months", "This Year", "Custom"];

const COUNTRY_TABLE = [
  { country: "Japan", total: 67, active: 28, deployed: 22, rejected: 5 },
  { country: "UAE", total: 89, active: 35, deployed: 38, rejected: 8 },
  { country: "Qatar", total: 42, active: 15, deployed: 20, rejected: 3 },
  { country: "Australia", total: 31, active: 18, deployed: 8, rejected: 2 },
  { country: "USA", total: 18, active: 10, deployed: 4, rejected: 1 },
];

const STATUS_DATA = [
  { status: "Pending", count: 24, color: "#94a3b8" },
  { status: "Processing", count: 31, color: "#8b5cf6" },
  { status: "Submitted", count: 18, color: "#3b82f6" },
  { status: "Approved", count: 42, color: "#10b981" },
  { status: "Rejected", count: 12, color: "#ef4444" },
  { status: "Deployed", count: 14, color: "#14b8a6" },
];

const MONTHLY_DATA = [
  { month: "Apr", apps: 23, deployed: 8 },
  { month: "May", apps: 31, deployed: 12 },
  { month: "Jun", apps: 28, deployed: 15 },
  { month: "Jul", apps: 35, deployed: 11 },
  { month: "Aug", apps: 42, deployed: 18 },
  { month: "Sep", apps: 38, deployed: 14 },
  { month: "Oct", apps: 45, deployed: 22 },
  { month: "Nov", apps: 41, deployed: 19 },
  { month: "Dec", apps: 33, deployed: 16 },
  { month: "Jan", apps: 39, deployed: 21 },
  { month: "Feb", apps: 36, deployed: 17 },
  { month: "Mar", apps: 29, deployed: 14 },
];

export default function ReportsPage() {
  const [preset, setPreset] = useState("This Month");

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
          <h3 className="text-sm font-semibold mb-4">Applications vs Deployments (12 Mo)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={MONTHLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="apps" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Applications" />
              <Bar dataKey="deployed" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Deployed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={STATUS_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="count">
                {STATUS_DATA.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {STATUS_DATA.map((s) => (
              <span key={s.status} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.status} ({s.count})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Country Breakdown Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border font-semibold text-foreground">
          Country-wise Breakdown
        </div>
        <div className="overflow-x-auto">
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
              {COUNTRY_TABLE.map((row) => (
                <tr key={row.country} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">{row.country}</td>
                  <td className="px-5 py-3 text-right">{row.total}</td>
                  <td className="px-5 py-3 text-right">{row.active}</td>
                  <td className="px-5 py-3 text-right text-emerald-600 font-medium">{row.deployed}</td>
                  <td className="px-5 py-3 text-right text-red-500 font-medium">{row.rejected}</td>
                  <td className="px-5 py-3 text-right">
                    {((row.rejected / row.total) * 100).toFixed(1)}%
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
