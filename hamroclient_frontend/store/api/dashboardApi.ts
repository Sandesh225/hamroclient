import { baseApi } from "./baseApi";

// ── Types ──
export interface AdminDashboardStats {
  totalApplicants: number;
  activeApplications: number;
  deployedThisMonth: number;
  pendingMedical: number;
  visaApprovalsThisMonth: number;
  rejectionRate: number;
  totalApplicantsChange: number;
  activeApplicationsChange: number;
  deployedChange: number;
  pendingMedicalChange: number;
  visaApprovalsChange: number;
  rejectionRateChange: number;
}

export interface CountryBreakdown {
  country: string;
  total: number;
  active: number;
  deployed: number;
  rejected: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface MonthlyDeployment {
  month: string;
  count: number;
  apps: number;
}

export interface ActivityEntry {
  id: string;
  applicantName: string;
  applicantId: string;
  action: string;
  fromStatus: string | null;
  toStatus: string;
  changedBy: string;
  timestamp: string;
}

export interface AlertItem {
  id: string;
  type: "expiry" | "incomplete" | "stalled";
  title: string;
  description: string;
  applicantId: string;
  applicantName: string;
  severity: "high" | "medium";
}

export interface AdminDashboardResponse {
  stats: AdminDashboardStats;
  countryBreakdown: CountryBreakdown[];
  statusDistribution: StatusDistribution[];
  monthlyDeployments: MonthlyDeployment[];
  recentActivity: ActivityEntry[];
  alerts: AlertItem[];
}

// ── API Slice ──
export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query<AdminDashboardResponse, { branchId?: string } | void>({
      query: (params) => {
        const branchId = typeof params === "object" ? params?.branchId : undefined;
        return {
          url: "/dashboard/admin/stats",
          params: branchId ? { branchId } : undefined,
        };
      },
      providesTags: ["AdminDashboard"],
    }),
  }),
});

export const { useGetAdminDashboardQuery } = dashboardApi;
