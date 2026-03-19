"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetCountryApplicationsQuery } from "@/store/api/countryApplicationsApi";
import Link from "next/link";
import {
  Globe,
  Briefcase,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Plane,
  FileText,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

const COUNTRIES = ["ALL", "JAPAN", "UAE", "QATAR", "AUSTRALIA", "USA", "OTHER"];

const statusBadge: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300",
  DOCUMENTATION_GATHERING: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300",
  VERIFICATION: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300",
  MEDICAL_PENDING: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300",
  VISA_SUBMITTED: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300",
  PROCESSING: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300",
  REJECTED: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300",
  DEPLOYED: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300",
  COMPLETED: "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/50 dark:text-green-300",
  CANCELLED: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-900/50 dark:text-gray-400",
};

export default function ApplicationsByCountryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const countryParam = searchParams.get("country") || "ALL";
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Handle Search Debounce
  // In a real app, use useDebounce hook. Adding simple delay here.
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset page on new search
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
  };

  const { data, isLoading, isFetching } = useGetCountryApplicationsQuery({
    country: countryParam,
    page,
    limit,
    search: debouncedSearch,
  });

  const handleCountrySelect = (c: string) => {
    setPage(1);
    setSearch("");
    setDebouncedSearch("");
    router.push(`/applications/by-country?country=${c}`);
  };

  const applications = data?.data || [];
  const stats = data?.stats || { total: 0, active: 0, deployed: 0, rejected: 0 };
  const meta = data?.meta;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Header & Tabs ── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Globe className="w-8 h-8 text-primary" />
          Applications By Country
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Filter and manage applicant files by destination country.
        </p>

        {/* Scrollable Tabs */}
        <div className="mt-6 border-b border-border overflow-x-auto scrollbar-hide">
          <nav className="flex gap-6 min-w-max px-1">
            {COUNTRIES.map((c) => {
              const isActive = countryParam === c;
              return (
                <button
                  key={c}
                  onClick={() => handleCountrySelect(c)}
                  className={`pb-4 px-1 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  {c === "ALL" ? "All Countries" : c}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── KPI Metrics Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {isLoading ? "..." : stats.total}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Active Processing</p>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {isLoading ? "..." : stats.active}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Plane className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Deployed</p>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {isLoading ? "..." : stats.deployed}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
              <XCircle className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Rejected</p>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {isLoading ? "..." : stats.rejected}
          </p>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="bg-card border border-border rounded-xl p-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name or passport..."
            className="w-full pl-9 pr-24 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-md hover:bg-primary/90 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* ── Data Table ── */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Passport / Type</th>
                <th className="px-6 py-4">Destination</th>
                <th className="px-6 py-4">Visa / Job Title</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading || isFetching ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-muted rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-muted rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-muted rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-28 bg-muted rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-5 w-24 bg-muted rounded-full"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-muted rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <AlertTriangle className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
                    <p>No applications found for this filter.</p>
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">{app.applicant.fullName}</p>
                      {app.agent && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" /> Agent: {app.agent.name}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{app.applicant.passportNumber}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{app.applicant.type}</p>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {app.destinationCountry || <span className="text-muted-foreground italic">TBD</span>}
                    </td>
                    <td className="px-6 py-4">
                      {app.visaType && <p className="font-medium text-foreground">{app.visaType}</p>}
                      {app.jobPosition && <p className="text-xs text-muted-foreground mt-0.5">{app.jobPosition}</p>}
                      {!app.visaType && !app.jobPosition && <span className="text-muted-foreground italic">TBD</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                          statusBadge[app.status] || "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {app.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/applicants/${app.applicant.id}`}
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                        title="View Applicant File"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {meta && meta.totalPages > 1 && (
          <div className="border-t border-border p-4 flex items-center justify-between bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing {limit * (page - 1) + 1} to {Math.min(limit * page, meta.total)} of {meta.total} entries
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 text-xs font-medium bg-card text-foreground border border-border rounded-md hover:bg-muted disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page === meta.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 text-xs font-medium bg-card text-foreground border border-border rounded-md hover:bg-muted disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
