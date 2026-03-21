import { baseApi } from "./baseApi";

interface CreateBranchPayload {
  name: string;
  location?: string;
  companyId?: string; // Support for System Admin override
}

interface Branch {
  id: string;
  name: string;
  location?: string | null;
  _count?: {
    users: number;
    applications: number;
  };
}

interface GetBranchesResponse {
  success: boolean;
  data: Branch[];
}

export const branchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBranches: builder.query<GetBranchesResponse, { companyId?: string } | void>({
      query: (params) => {
        const companyId = typeof params === "object" ? params?.companyId : undefined;
        return {
          url: "/branches",
          params: companyId ? { companyId } : undefined,
        };
      },
      providesTags: ["Branch"],
    }),
    createBranch: builder.mutation<{ success: boolean; data: Branch }, CreateBranchPayload>({
      query: (body) => ({
        url: "/branches",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Branch"],
    }),
  }),
});

export const { useGetBranchesQuery, useCreateBranchMutation } = branchApi;
