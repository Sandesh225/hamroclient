"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars

import { useState, useMemo, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import Link from "next/link";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  PlusCircle,
  Download,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { SkeletonTable } from "@/components/ui/SkeletonLoader";
import { useGetApplicationsQuery, useDeleteApplicantMutation } from "@/store/api/applicantApi";

// ── Types ──
interface ApplicantRow {
  id: string;
  fullName: string;
  caseNumber: string;
  passportNumber: string;
  phone: string;
  type: string;
  destination: string | null;
  jobPosition: string | null;
  status: string;
  assignedAgent: string | null;
  updatedAt: string;
}

const COUNTRIES = ["Japan", "UAE", "Qatar", "Australia", "USA"];
const STATUSES = [
  "PENDING", "DOCUMENTATION_GATHERING", "VERIFICATION", "MEDICAL_PENDING",
  "VISA_SUBMITTED", "PROCESSING", "APPROVED", "REJECTED", "DEPLOYED", "COMPLETED",
];

type SortKey = "fullName" | "status" | "updatedAt";
type SortDir = "asc" | "desc";

export default function ApplicantsPage() {
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const pageSize = 20;

  // Debounce search input — prevents API calls on every keystroke
  const debouncedSearch = useDebounce(search, 300);

  const { data: applicantsResponse, isLoading } = useGetApplicationsQuery({ 
    page, 
    limit: pageSize,
    search: debouncedSearch || undefined,
    country: filterCountry || undefined,
    status: filterStatus || undefined,
    sortBy: sortKey,
    sortDir
  });

  const [deleteApplicant, { isLoading: isDeleting }] = useDeleteApplicantMutation();

  const rawApplicants = applicantsResponse?.data || [];

  // Map server response to row shape
  const processed: ApplicantRow[] = useMemo(() => {
    return rawApplicants.map((a) => {
      // The API response includes fields not on ApplicantProfile type
      // (destinationCountry, jobPosition, latestStatus come from the joined application)
      const raw = a as unknown as Record<string, string | null>;
      return {
        id: a.id,
        fullName: a.fullName,
        caseNumber: `HC-${a.id.slice(0, 6)}`,
        passportNumber: a.passportNumber,
        phone: a.phone || "—",
        type: a.type,
        destination: raw.destinationCountry ?? null,
        jobPosition: raw.jobPosition ?? null,
        status: raw.latestStatus || "PENDING",
        assignedAgent: null,
        updatedAt: a.updatedAt,
      };
    });
  }, [rawApplicants]);

  const totalPages = applicantsResponse?.meta?.pages || 1;
  const paginated = processed;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown className="w-3 h-3 text-muted-foreground/40" />;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === paginated.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map((a) => a.id)));
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFilterCountry("");
    setFilterStatus("");
    setPage(1);
  };

  const hasFilters = !!search || !!filterCountry || !!filterStatus;

  // ── Bulk Export: Generate CSV from selected rows ──
  const handleExport = useCallback(() => {
    const selectedRows = paginated.filter((a) => selected.has(a.id));
    if (selectedRows.length === 0) return;

    const headers = ["Full Name", "Case #", "Passport", "Phone", "Type", "Destination", "Position", "Status", "Updated"];
    const csvRows = selectedRows.map((r) => [
      r.fullName,
      r.caseNumber,
      r.passportNumber,
      r.phone,
      r.type,
      r.destination || "",
      r.jobPosition || "",
      r.status.replace(/_/g, " "),
      new Date(r.updatedAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `applicants_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [paginated, selected]);

  // ── Bulk Delete: Confirm then delete all selected ──
  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selected);
    try {
      await Promise.all(ids.map((id) => deleteApplicant(id).unwrap()));
      setSelected(new Set());
      setShowDeleteModal(false);
    } catch {
      // RTK Query will propagate the error via cache invalidation
      setShowDeleteModal(false);
    }
  }, [selected, deleteApplicant]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10" />
        <SkeletonTable rows={8} cols={6} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Selected Applicants"
        message={`Are you sure you want to delete ${selected.size} selected applicant(s)? This action cannot be undone. All associated applications, documents, and notes will also be permanently removed.`}
        confirmLabel={isDeleting ? "Deleting..." : "Delete All"}
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleBulkDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Applicants</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage applicant profiles and track visa processing.
          </p>
        </div>
        <Link
          href="/applicants/new"
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Add Applicant
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, case #, passport, phone..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
            showFilters || hasFilters
              ? "bg-primary/10 text-primary border-primary/30"
              : "bg-card text-muted-foreground border-border hover:bg-muted"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasFilters && (
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {[filterCountry, filterStatus].filter(Boolean).length}
            </span>
          )}
        </button>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}

        {/* Bulk Actions (visible when selected) */}
        {selected.size > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground">
              {selected.size} selected
            </span>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-foreground text-xs font-medium hover:bg-muted/80 transition-colors border border-border"
            >
              <Download className="w-3 h-3" />
              Export CSV
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors border border-destructive/20"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Filters Row */}
      {showFilters && (
        <div className="flex items-center gap-3 flex-wrap p-4 bg-muted/30 rounded-xl border border-border">
          <select
            value={filterCountry}
            onChange={(e) => { setFilterCountry(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-lg bg-background border border-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Countries</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-lg bg-background border border-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
      )}

      {/* Table */}
      {processed.length === 0 ? (
        <EmptyState
          title="No Applicants Found"
          message={
            hasFilters
              ? "No applicants match your current filters. Try adjusting your search."
              : "You haven't added any applicants yet. Start by creating your first applicant profile."
          }
          actionLabel={hasFilters ? "Clear Filters" : "Add Applicant"}
          actionHref={hasFilters ? undefined : "/applicants/new"}
          onAction={hasFilters ? clearFilters : undefined}
        />
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selected.size === paginated.length && paginated.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-input"
                      aria-label="Select all applicants"
                    />
                  </th>
                  <th
                    className="px-4 py-3 text-left font-medium cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => toggleSort("fullName")}
                  >
                    <span className="flex items-center gap-1">
                      Name <SortIcon col="fullName" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Case #</th>
                  <th className="px-4 py-3 text-left font-medium">Destination</th>
                  <th
                    className="px-4 py-3 text-left font-medium cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => toggleSort("status")}
                  >
                    <span className="flex items-center gap-1">
                      Status <SortIcon col="status" />
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 text-right font-medium cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => toggleSort("updatedAt")}
                  >
                    <span className="flex items-center gap-1 justify-end">
                      Updated <SortIcon col="updatedAt" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.map((applicant) => (
                  <tr
                    key={applicant.id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(applicant.id)}
                        onChange={() => toggleSelect(applicant.id)}
                        className="w-4 h-4 rounded border-input"
                        aria-label={`Select ${applicant.fullName}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/applicants/${applicant.id}`} className="block">
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {applicant.fullName}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {applicant.type} · {applicant.passportNumber}
                        </p>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-muted-foreground">
                        {applicant.caseNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-foreground text-sm">{applicant.destination || "—"}</p>
                        {applicant.jobPosition && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[140px]">
                            {applicant.jobPosition}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={applicant.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs text-muted-foreground">
                        {new Date(applicant.updatedAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {paginated.length > 0 ? (page - 1) * pageSize + 1 : 0}
              </span>
              –
              <span className="font-medium text-foreground">
                {Math.min(page * pageSize, applicantsResponse?.meta?.total || processed.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {applicantsResponse?.meta?.total || 0}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded-lg bg-background border border-input text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                      page === pageNum
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border border-input hover:bg-muted"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 rounded-lg bg-background border border-input text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
