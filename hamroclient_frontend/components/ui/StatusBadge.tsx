"use client";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: "bg-slate-100 border-slate-200", text: "text-slate-600", label: "New" },
  DOCUMENTATION_GATHERING: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", label: "Docs Collecting" },
  VERIFICATION: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", label: "Verifying" },
  MEDICAL_PENDING: { bg: "bg-orange-50 border-orange-200", text: "text-orange-700", label: "Medical" },
  VISA_SUBMITTED: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", label: "Submitted" },
  PROCESSING: { bg: "bg-violet-50 border-violet-200", text: "text-violet-700", label: "Processing" },
  APPROVED: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", label: "Approved" },
  REJECTED: { bg: "bg-red-50 border-red-200", text: "text-red-700", label: "Rejected" },
  DEPLOYED: { bg: "bg-teal-50 border-teal-200", text: "text-teal-700", label: "Deployed" },
  COMPLETED: { bg: "bg-green-50 border-green-200", text: "text-green-800", label: "Completed" },
  CANCELLED: { bg: "bg-gray-100 border-gray-200", text: "text-gray-500", label: "Cancelled" },
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    bg: "bg-muted border-border",
    text: "text-muted-foreground",
    label: status.replace(/_/g, " "),
  };

  const sizeClasses = size === "sm"
    ? "text-[10px] px-2 py-0.5"
    : "text-xs px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center font-semibold uppercase rounded-full border ${config.bg} ${config.text} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
}

export { STATUS_CONFIG };
