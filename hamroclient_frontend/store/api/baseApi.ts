import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ 
    baseUrl: "/api/backend",
    prepareHeaders: async (headers) => {
      const session = await getSession();
      
      // Pass tenancy context directly in headers for easier backend processing
      if (session?.user?.companyId) {
        headers.set("X-Company-ID", session.user.companyId);
      }
      if (session?.user?.branchId) {
        headers.set("X-Branch-ID", session.user.branchId);
      }
      if (session?.user?.role) {
        headers.set("X-User-Role", session.user.role);
      }
      
      return headers;
    },
  }),
  // "User" must be present here if any injected endpoint uses it as a tag
  tagTypes: [
    "User",
    "Applicant",
    "Application",
    "Document",
    "Note",
    "StaffDashboard",
    "AdminDashboard",
    "CountryApplications",
    "Dashboard",
    "Branch",
    "Staff",
    "Company",
    "AuditLog",
    "CompanyProfile"
  ],
  endpoints: () => ({}),
});