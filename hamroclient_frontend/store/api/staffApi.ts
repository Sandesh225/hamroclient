import { baseApi } from "./baseApi";

// ── Types ──
interface InviteStaffPayload {
  email: string;
  role: "COMPANY_ADMIN" | "BRANCH_MANAGER" | "AGENT";
  branchId: string;
}

interface InviteStaffResponse {
  success: boolean;
  message: string;
  inviteLink: string;
}

// ── API Slice ──
export const staffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    inviteStaff: builder.mutation<InviteStaffResponse, InviteStaffPayload>({
      query: (body) => ({
        url: "/auth/invite",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Staff"],
    }),
  }),
});

export const { useInviteStaffMutation } = staffApi;
