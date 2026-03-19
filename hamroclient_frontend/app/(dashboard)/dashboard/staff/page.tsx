"use client";

import { useState } from "react";
import Link from "next/link";
import KPICard from "@/components/ui/KPICard";
import StatusBadge from "@/components/ui/StatusBadge";
import { SkeletonCard, SkeletonTable } from "@/components/ui/SkeletonLoader";
import {
  FileText,
  AlertTriangle,
  Clock,
  Users,
  ArrowRight,
  Phone,
  FileWarning,
  CalendarClock,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useGetStaffDashboardQuery } from "@/store/api/staffDashboardApi";

const taskIconMap: Record<string, React.ElementType> = {
  missing_doc: FileWarning,
  follow_up: Phone,
  expiring: CalendarClock,
  decision: ShieldCheck,
};

const priorityBadge: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/30",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  low: "bg-muted text-muted-foreground border-border",
};

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function StaffDashboardPage() {
  const { data, isLoading } = useGetStaffDashboardQuery();
  
  const metrics = data?.metrics || { applicationsRegisteredThisWeek: 0, missingDocuments: 0, pendingDecisions: 0, activeApplicants: 0 };
  const urgentTasks = data?.urgentTasks || [];
  const recentApplicants = data?.recentApplicants || [];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-14" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-2"><SkeletonTable rows={5} cols={1} /></div>
          <div className="xl:col-span-3"><SkeletonTable rows={5} cols={5} /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Staff Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Your command center — see what needs attention right now.
        </p>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Registered This Week"
          value={metrics.applicationsRegisteredThisWeek || 0}
          icon={FileText}
          trend="↑ 3 from last week"
          color="primary"
        />
        <KPICard
          title="Missing Documents"
          value={metrics.missingDocuments || 0}
          icon={AlertTriangle}
          trend="Needs attention"
          color="destructive"
        />
        <KPICard
          title="Pending Decisions"
          value={metrics.pendingDecisions || 0}
          icon={Clock}
          trend="Awaiting embassy response"
          color="accent"
        />
        <KPICard
          title="Active Applicants"
          value={metrics.activeApplicants || 0}
          icon={Users}
          trend="Total in pipeline"
          color="muted"
        />
      </div>

      {/* ── Two-Column: Urgent Tasks & Recent Applicants ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* ── Urgent Tasks Feed ── */}
        <div className="xl:col-span-2 bg-card border border-border rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">My Urgent Tasks</h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
              {urgentTasks.filter((t) => t.priority === "high").length} high
            </span>
          </div>
          <div className="divide-y divide-border max-h-[480px] overflow-y-auto">
            {urgentTasks.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground text-center">No urgent tasks assigned.</p>
            ) : urgentTasks.map((task) => {
              const TaskIcon = taskIconMap[task.type] || AlertTriangle;
              return (
                <Link
                  key={task.id}
                  href={`/applicants/${task.applicantId}`}
                  className="flex items-start gap-3 px-5 py-4 hover:bg-muted/50 transition-colors group"
                >
                  <div className="mt-0.5 p-2 rounded-lg bg-muted group-hover:bg-background transition-colors">
                    <TaskIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-foreground truncate">
                        {task.title}
                      </p>
                      <span
                        className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${priorityBadge[task.priority]}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                    <p className="text-[11px] text-muted-foreground/70 mt-1">
                      {formatRelativeTime(task.createdAt)}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/40 mt-1 group-hover:text-foreground transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Recently Updated Applicants ── */}
        <div className="xl:col-span-3 bg-card border border-border rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">
              Recently Updated Applicants
            </h2>
            <Link
              href="/applicants"
              className="text-xs text-primary hover:underline font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Name</th>
                  <th className="px-5 py-3 text-left font-medium">Passport</th>
                  <th className="px-5 py-3 text-left font-medium">
                    Destination
                  </th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      No recent applicants.
                    </td>
                  </tr>
                ) : recentApplicants.map((applicant) => (
                  <tr
                    key={applicant.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/applicants/${applicant.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {applicant.fullName}
                      </Link>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {applicant.type}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                      {applicant.passportNumber}
                    </td>
                    <td className="px-5 py-3.5 text-foreground">
                      {applicant.destinationCountry || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={applicant.latestStatus} />
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs text-muted-foreground">
                      {formatRelativeTime(applicant.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
