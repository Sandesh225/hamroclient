import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ 
    baseUrl: "/api/backend",
  }),
  tagTypes: ["Applicant", "Application", "Document", "Note", "StaffDashboard", "CountryApplications"],
  endpoints: () => ({}),
});
