"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Users,
  FileText,
  Plane,
  Stethoscope,
  ShieldCheck,
  XCircle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  Clock,
  FileWarning,
  ChevronRight,
} from "lucide-react";
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
import StatusBadge from "@/components/ui/StatusBadge";
import { SkeletonCard, SkeletonTable } from "@/components/ui/SkeletonLoader";
import { useGetAdminDashboardQuery } from "@/store/api/dashboardApi";


import KPICard from "@/components/ui/KPICard";

// ── Time formatter ──
function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const alertTypeIcon: Record<string, React.ElementType> = {
  expiry: Clock,
  incomplete: FileWarning,
  stalled: AlertTriangle,
};

export default function AdminDashboardPage() {
  const { data, isLoading } = useGetAdminDashboardQuery();

  const stats = data?.stats || {
    totalApplicants: 0, activeApplications: 0, deployedThisMonth: 0, pendingMedical: 0, visaApprovalsThisMonth: 0, rejectionRate: 0,
    totalApplicantsChange: 0, activeApplicationsChange: 0, deployedChange: 0, pendingMedicalChange: 0, visaApprovalsChange: 0, rejectionRateChange: 0,
  };
  const countryData = data?.countryBreakdown || [];
  
  // Assign dynamic colors to status distribution
  const statusColors: Record<string, string> = { "PENDING": "#94a3b8", "DOCUMENTATION_GATHERING": "#3b82f6", "PROCESSING": "#8b5cf6", "APPROVED": "#10b981", "REJECTED": "#ef4444", "DEPLOYED": "#14b8a6" };
  const statusDistribution = (data?.statusDistribution || []).map(s => ({ ...s, color: statusColors[s.status] || "#94a3b8" }));
  
  const monthlyDeployments = data?.monthlyDeployments || [];
  const activity = data?.recentActivity || [];
  const alerts = data?.alerts || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonTable rows={5} cols={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Agency-wide overview and analytics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        <KPICard label="Total Applicants" value={stats.totalApplicants} change={stats.totalApplicantsChange} icon={Users} delay={0} />
        <KPICard label="Active Applications" value={stats.activeApplications} change={stats.activeApplicationsChange} icon={FileText} delay={50} />
        <KPICard label="Deployed This Month" value={stats.deployedThisMonth} change={stats.deployedChange} icon={Plane} delay={100} />
        <KPICard label="Pending Medical" value={stats.pendingMedical} change={stats.pendingMedicalChange} icon={Stethoscope} delay={150} />
        <KPICard label="Visa Approvals (Mo)" value={stats.visaApprovalsThisMonth} change={stats.visaApprovalsChange} icon={ShieldCheck} delay={200} />
        <KPICard label="Rejection Rate" value={stats.rejectionRate} change={stats.rejectionRateChange} icon={XCircle} suffix="%" delay={250} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart — Applications by Country */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Applications by Country
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={countryData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="country" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart — Status Distribution */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="count"
              >
                {statusDistribution.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
            {statusDistribution.map((item) => (
              <span key={item.status} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.status.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>

        {/* Line Chart — Monthly Deployments */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Monthly Deployments (12 Mo)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyDeployments}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ fill: "var(--primary)", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Activity Feed + Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Activity Feed */}
        <div className="xl:col-span-3 bg-card border border-border rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Recent Activity</h3>
            <Link
              href="/dashboard/admin/reports/audit"
              className="text-xs text-primary hover:underline font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
            {activity.map((entry) => (
              <Link
                key={entry.id}
                href={`/applicants/${entry.applicantId}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">
                      {entry.applicantName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      — {entry.action}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {entry.fromStatus && (
                      <>
                        <StatusBadge status={entry.fromStatus} size="sm" />
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      </>
                    )}
                    <StatusBadge status={entry.toStatus} size="sm" />
                    <span className="text-[11px] text-muted-foreground ml-auto">
                      by {entry.changedBy}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {formatRelative(entry.timestamp)}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="xl:col-span-2 bg-card border border-border rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Alerts
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
              {alerts.filter((a) => a.severity === "high").length} critical
            </span>
          </div>
          <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
            {alerts.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground text-center">No active alerts.</p>
            ) : alerts.map((alert) => {
              const AlertIcon = alertTypeIcon[alert.type] || AlertTriangle;
              return (
                <Link
                  key={alert.id}
                  href={`/applicants/${alert.applicantId}`}
                  className="flex items-start gap-3 px-5 py-3.5 hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`mt-0.5 p-2 rounded-lg ${
                      alert.severity === "high"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    <AlertIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {alert.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {alert.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 mt-1 shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
