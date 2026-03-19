import { baseApi } from "./baseApi";

// ── Types ──
export interface BoardApplication {
  id: string;
  status: string;
  applicantName: string;
  applicantId: string;
  destinationCountry: string | null;
  visaType: string | null;
  jobPosition: string | null;
  lastStatusChangeAt: string;
  updatedAt: string;
}

export interface BoardColumn {
  id: string;
  title: string;
  statuses: string[];
  applications: BoardApplication[];
}

// ── API Slice ──
export const applicationBoardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getApplicationsForBoard: builder.query<BoardApplication[], void>({
      query: () => "/applications/board",
      providesTags: ["Application"],
    }),

    updateApplicationStatus: builder.mutation<
      { success: boolean },
      { applicationId: string; status: string }
    >({
      query: ({ applicationId, ...body }) => ({
        url: `/applications/${applicationId}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Application", "StaffDashboard"],
    }),
  }),
});

export const {
  useGetApplicationsForBoardQuery,
  useUpdateApplicationStatusMutation,
} = applicationBoardApi;
