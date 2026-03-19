import { baseApi } from "./baseApi";

export interface CountryApplication {
  id: string;
  status: string;
  destinationCountry: string | null;
  visaType: string | null;
  jobPosition: string | null;
  updatedAt: string;
  applicant: {
    id: string;
    fullName: string;
    passportNumber: string;
    type: string;
  };
  agent: {
    id: string;
    name: string;
  } | null;
}

export interface CountryStats {
  total: number;
  active: number;
  deployed: number;
  rejected: number;
}

export interface CountryApplicationsResponse {
  success: boolean;
  stats: CountryStats;
  data: CountryApplication[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface FetchCountryAppsArgs {
  country?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export const countryApplicationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCountryApplications: builder.query<
      CountryApplicationsResponse,
      FetchCountryAppsArgs
    >({
      query: (args) => {
        const params = new URLSearchParams();
        if (args.country && args.country !== "ALL") params.append("country", args.country);
        if (args.page) params.append("page", args.page.toString());
        if (args.limit) params.append("limit", args.limit.toString());
        if (args.search) params.append("search", args.search);

        return {
          url: `/applications/by-country?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["CountryApplications"],
    }),
  }),
});

export const { useGetCountryApplicationsQuery } = countryApplicationsApi;
