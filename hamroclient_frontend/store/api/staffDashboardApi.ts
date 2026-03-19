import { baseApi } from "./baseApi";

// ── Types ──
export interface DashboardMetrics {
  applicationsRegisteredThisWeek: number;
  missingDocuments: number;
  pendingDecisions: number;
  activeApplicants: number;
}

export interface UrgentTask {
  id: string;
  type: "missing_doc" | "follow_up" | "expiring" | "decision";
  title: string;
  description: string;
  applicantId: string;
  applicantName: string;
  priority: "high" | "medium" | "low";
  createdAt: string;
}

export interface RecentApplicant {
  id: string;
  fullName: string;
  passportNumber: string;
  type: string;
  latestStatus: string;
  destinationCountry: string | null;
  updatedAt: string;
}

export interface StaffDashboardResponse {
  metrics: DashboardMetrics;
  urgentTasks: UrgentTask[];
  recentApplicants: RecentApplicant[];
}

// ── API Slice ──
export const staffDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStaffDashboard: builder.query<StaffDashboardResponse, void>({
      query: () => "/staff/dashboard",
      providesTags: ["StaffDashboard"],
    }),
  }),
});

export const { useGetStaffDashboardQuery } = staffDashboardApi;
