import { baseApi } from "./baseApi";

import { ApplicantProfile } from "./applicantDetailApi";

// ── Types ──
interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface CreateApplicantPayload {
  fullName: string;
  type: string;
  gender?: string;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
  mobile?: string;
  email?: string;
  city?: string;
  destinationCountry?: string;
  jobPosition?: string;
  visaType?: string;
  notes?: string;
}

export const applicantApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getApplications: builder.query<{ success: boolean; data: ApplicantProfile[]; meta: PaginationMeta }, { 
      page?: number; 
      limit?: number;
      search?: string;
      country?: string;
      status?: string;
      agent?: string;
      sortBy?: string;
      sortDir?: string;
    }>({
      query: ({ page = 1, limit = 50, search, country, status, agent, sortBy, sortDir } = {}) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (search) params.append("search", search);
        if (country) params.append("country", country);
        if (status) params.append("status", status);
        if (agent) params.append("agent", agent);
        if (sortBy) params.append("sortBy", sortBy);
        if (sortDir) params.append("sortDir", sortDir);
        return `/applicants?${params.toString()}`;
      },
      providesTags: ["Application"],
    }),
    createApplicant: builder.mutation<{ success: boolean; data?: ApplicantProfile; error?: string }, CreateApplicantPayload>({
      query: (body) => ({
        url: "/applicants",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Application", "Applicant", "AdminDashboard", "StaffDashboard"],
    }),
    deleteApplicant: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/applicants/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Application", "Applicant", "AdminDashboard", "StaffDashboard"],
    }),
  }),
});

export const { useGetApplicationsQuery, useCreateApplicantMutation, useDeleteApplicantMutation } = applicantApi;

