import { baseApi } from "./baseApi";

export interface Company {
  id: string;
  businessName: string;
  registrationNumber?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  _count?: {
    branches: number;
    users: number;
  };
}

interface GetCompaniesResponse {
  success: boolean;
  data: Company[];
}

interface ProvisionCompanyPayload {
  businessName: string;
  registrationNumber?: string;
  contactEmail: string;
  contactPhone?: string;
  adminName: string;
  adminEmail: string;
}

interface UpdateCompanyProfilePayload {
  businessName: string;
  address?: string;
  phone?: string;
  email?: string;
  registrationNumber?: string;
  website?: string;
}

interface GetCompanyProfileResponse {
  success: boolean;
  data: {
    id: string;
    businessName: string;
    registrationNumber?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    address?: string | null;
    website?: string | null;
  };
}

export const companyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCompanies: builder.query<GetCompaniesResponse, void>({
      query: () => "/companies",
      providesTags: ["Company"],
    }),
    provisionCompany: builder.mutation<{ success: boolean; data: any }, ProvisionCompanyPayload>({
      query: (body) => ({
        url: "/companies",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Company"],
    }),
    getCompanyProfile: builder.query<GetCompanyProfileResponse, void>({
      query: () => "/companies/profile",
      providesTags: ["CompanyProfile" as any],
    }),
    updateCompanyProfile: builder.mutation<{ success: boolean; data: any }, UpdateCompanyProfilePayload>({
      query: (body) => ({
        url: "/companies/profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["CompanyProfile" as any],
    }),
  }),
});

export const { 
  useGetCompaniesQuery, 
  useProvisionCompanyMutation,
  useGetCompanyProfileQuery,
  useUpdateCompanyProfileMutation
} = companyApi;
