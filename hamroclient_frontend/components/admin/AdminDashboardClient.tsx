"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  FileText,
  Plane,
  Stethoscope,
  ShieldCheck,
  XCircle,
  ArrowRight,
  AlertTriangle,
  Clock,
  FileWarning,
  ChevronRight,
  MessageSquareOff,
  Filter,
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
import EmptyState from "@/components/ui/EmptyState";
import { useGetAdminDashboardQuery } from "@/store/api/dashboardApi";
import { useGetBranchesQuery } from "@/store/api/branchApi";
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

// Status chart colors using semantic tokens where possible
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

export default function AdminDashboardClient() {
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  
  const { data: branchesData } = useGetBranchesQuery();
  const { data, isLoading, isFetching } = useGetAdminDashboardQuery(
    selectedBranchId ? { branchId: selectedBranchId } : undefined,
    { pollingInterval: 30000 } // Poll every 30 seconds
  );

  const stats = data?.stats || {
    totalApplicants: 0,
    activeApplications: 0,
    deployedThisMonth: 0,
    pendingMedical: 0,
    visaApprovalsThisMonth: 0,
    rejectionRate: 0,
    totalApplicantsChange: 0,
    activeApplicationsChange: 0,
    deployedChange: 0,
    pendingMedicalChange: 0,
    visaApprovalsChange: 0,
    rejectionRateChange: 0,
  };

  const countryData = data?.countryBreakdown || [];

  const statusDistribution = useMemo(
    () =>
      (data?.statusDistribution || []).map((s) => ({
        ...s,
        color: STATUS_COLORS[s.status] || "#94a3b8",
      })),
    [data?.statusDistribution]
  );

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            {isFetching && (
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse ml-1" title="Updating..." />
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Agency-wide overview and analytics
          </p>
        </div>

        {/* Branch Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/30 border border-border px-3 py-2 rounded-lg">
            <Filter className="w-4 h-4" />
            <span>Branch:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-foreground cursor-pointer outline-none"
            >
              <option value="">All Branches</option>
              {branchesData?.data?.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        <KPICard label="Total Applicants" value={stats.totalApplicants} change={stats.totalApplicantsChange} icon={Users} delay={0} />
        <KPICard label="Active Applications" value={stats.activeApplications} change={stats.activeApplicationsChange} icon={FileText} delay={50} color="accent" />
        <KPICard label="Deployed This Month" value={stats.deployedThisMonth} change={stats.deployedChange} icon={Plane} delay={100} color="success" />
        <KPICard label="Pending Medical" value={stats.pendingMedical} change={stats.pendingMedicalChange} icon={Stethoscope} delay={150} color="warning" />
        <KPICard label="Visa Approvals (Mo)" value={stats.visaApprovalsThisMonth} change={stats.visaApprovalsChange} icon={ShieldCheck} delay={200} color="primary" />
        <KPICard label="Rejection Rate" value={stats.rejectionRate} change={stats.rejectionRateChange} icon={XCircle} suffix="%" delay={250} color="destructive" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart — Applications by Country */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Applications by Country
          </h3>
          {countryData.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
              No country data available yet.
            </div>
          ) : (
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
          )}
        </div>

        {/* Donut Chart — Status Distribution */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Status Distribution
          </h3>
          {statusDistribution.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
              No status data available yet.
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Line Chart — Monthly Deployments */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Monthly Deployments (12 Mo)
          </h3>
          {monthlyDeployments.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
              No deployment data available yet.
            </div>
          ) : (
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
          )}
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
            {activity.length === 0 ? (
              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                  <MessageSquareOff className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-foreground">No Recent Activity</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Status changes and updates from your team will appear here once applicants start moving through the pipeline.
                </p>
              </div>
            ) : (
              activity.map((entry) => (
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
              ))
            )}
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
              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                  <ShieldCheck className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-foreground">All Clear</p>
                <p className="text-xs text-muted-foreground mt-1">
                  No active alerts. Everything is running smoothly.
                </p>
              </div>
            ) : (
              alerts.map((alert) => {
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
                          : "bg-accent text-accent-foreground"
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
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
