"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, CheckSquare, Loader2 } from "lucide-react";

const EXPORT_FIELDS = [
  { id: "name", label: "Full Name", checked: true },
  { id: "case", label: "Case Number", checked: true },
  { id: "passport", label: "Passport Number", checked: true },
  { id: "dob", label: "Date of Birth", checked: false },
  { id: "gender", label: "Gender", checked: false },
  { id: "phone", label: "Phone", checked: true },
  { id: "email", label: "Email", checked: true },
  { id: "destination", label: "Destination Country", checked: true },
  { id: "visa", label: "Visa Type", checked: true },
  { id: "position", label: "Job Position", checked: true },
  { id: "status", label: "Application Status", checked: true },
  { id: "agent", label: "Assigned Agent", checked: true },
  { id: "fee", label: "Agency Fee", checked: false },
  { id: "salary", label: "Salary Offered", checked: false },
  { id: "created", label: "Created Date", checked: true },
  { id: "updated", label: "Last Updated", checked: true },
];

const COUNTRIES = ["Japan", "UAE", "Qatar", "Australia", "USA"];
const STATUSES = ["PENDING", "DOCUMENTATION_GATHERING", "VERIFICATION", "MEDICAL_PENDING", "VISA_SUBMITTED", "PROCESSING", "APPROVED", "REJECTED", "DEPLOYED"];

export default function ExportPage() {
  const [fields, setFields] = useState(EXPORT_FIELDS);
  const [format, setFormat] = useState<"csv" | "excel">("csv");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dataType, setDataType] = useState<"applicants" | "audit">("applicants");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/export?type=${dataType}`);
      if (!res.ok) throw new Error("Export failed");
      const data = await res.json();
      
      if (!data || data.length === 0) {
        alert("No data found to export.");
        return;
      }
      
      // Option to filter columns just for applicants based on checkbox
      let exportData = data;
      if (dataType === "applicants") {
        const selectedLabels = fields.filter((f) => f.checked).map((f) => f.label);
        exportData = data.map((item: any) => {
          const row: any = {};
          selectedLabels.forEach((lbl) => {
            row[lbl] = item[lbl] || "";
          });
          return row;
        });
      }

      // Quick JSON to CSV conversion
      const replacer = (key: string, value: any) => (value === null ? "" : value);
      const header = Object.keys(exportData[0]);
      const csv = [
        header.join(","), // Header row
        ...exportData.map((row: any) =>
          header
            .map((fieldName) => JSON.stringify(row[fieldName], replacer))
            .join(",")
        ),
      ].join("\r\n");

      // Trigger download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `agency_${dataType}_export_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert("An error occurred during export.");
    } finally {
      setIsExporting(false);
    }
  };

  const toggleField = (id: string) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, checked: !f.checked } : f))
    );
  };

  const selectAll = () => setFields((prev) => prev.map((f) => ({ ...f, checked: true })));
  const deselectAll = () => setFields((prev) => prev.map((f) => ({ ...f, checked: false })));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Export Data</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Select fields and filters to generate a downloadable report.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold">Data & Filters</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Data Source</label>
            <select value={dataType} onChange={(e) => setDataType(e.target.value as "applicants" | "audit")} className="w-full px-3 py-2 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="applicants">Applicants Database</option>
              <option value="audit">System & Audit Logs</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Country</label>
            <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">All</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">All</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">From Date</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">To Date</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
      </div>

      {/* Field Selection */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Select Fields</h3>
          <div className="flex gap-2">
            <button onClick={selectAll} className="text-[11px] text-primary hover:underline font-medium">Select All</button>
            <button onClick={deselectAll} className="text-[11px] text-muted-foreground hover:underline font-medium">Deselect All</button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {fields.map((field) => (
            <label key={field.id} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <input type="checkbox" checked={field.checked} onChange={() => toggleField(field.id)} className="w-4 h-4 rounded border-input text-primary" />
              <span className="text-sm text-foreground">{field.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Format & Download */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold">Format</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setFormat("csv")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-colors ${
              format === "csv" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
            }`}
          >
            <FileText className="w-5 h-5 text-muted-foreground" />
            <div className="text-left">
              <p className="text-sm font-medium">CSV</p>
              <p className="text-[11px] text-muted-foreground">Comma-separated values</p>
            </div>
          </button>
          <button
            onClick={() => setFormat("excel")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-colors ${
              format === "excel" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
            }`}
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <div className="text-left">
              <p className="text-sm font-medium">Excel</p>
              <p className="text-[11px] text-muted-foreground">.xlsx spreadsheet</p>
            </div>
          </button>
        </div>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isExporting ? "Exporting..." : `Export ${format.toUpperCase()}`}
        </button>
      </div>
    </div>
  );
}
