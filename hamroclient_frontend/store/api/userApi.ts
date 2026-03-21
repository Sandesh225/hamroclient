import { baseApi } from "./baseApi";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "SYSTEM_ADMIN" | "COMPANY_ADMIN" | "BRANCH_MANAGER" | "AGENT";
  createdAt: string;
  updatedAt: string;
}

interface GetUsersResponse {
  success: boolean;
  data: User[];
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<GetUsersResponse, void>({
      query: () => "/users",
      providesTags: ["User"],
    }),
  }),
});

export const { useGetUsersQuery } = userApi;
