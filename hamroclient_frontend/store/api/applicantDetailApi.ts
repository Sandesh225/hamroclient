import { baseApi } from "./baseApi";

// ── Types ──
export interface ApplicantProfile {
  id: string;
  fullName: string;
  type: string;
  dateOfBirth: string | null;
  gender: string | null;
  nationality: string | null;
  placeOfBirth: string | null;
  maritalStatus: string | null;
  religion: string | null;
  nationalIdNumber: string | null;
  fathersName: string | null;
  mothersName: string | null;
  passportNumber: string;
  placeOfIssue: string | null;
  issuingCountry: string | null;
  passportIssueDate: string | null;
  passportExpiryDate: string | null;
  photoUrl: string | null;
  phone: string | null;
  email: string | null;
  permanentAddress: string | null;
  currentAddress: string | null;
  emergencyContactName: string | null;
  emergencyContactRelation: string | null;
  emergencyContactPhone: string | null;
  skills: string[];
  previousTravelHistory: string[];
  branchId: string | null;
  assignedToId: string | null;
  assignedTo?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicantApplication {
  id: string;
  status: string;
  destinationCountry: string | null;
  visaType: string | null;
  jobPosition: string | null;
  employerAbroad: string | null;
  applicationDate: string | null;
  submissionDate: string | null;
  approvalDate: string | null;
  updatedAt: string;
}

export interface ApplicantDocument {
  id: string;
  title: string;
  category: string;
  s3Url: string;
  uploadedAt: string;
  expiryDate: string | null;
  isVerified: boolean;
  isAttested: boolean;
  countrySpecific: string | null;
}

export interface ApplicantNote {
  id: string;
  text: string;
  type: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  } | null;
}

// ── API Slice ──
export const applicantDetailApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getApplicantById: builder.query<ApplicantProfile, string>({
      query: (id) => `/applicants/${id}`,
      transformResponse: (response: any) => response.data ?? response,
      providesTags: (_result, _err, id) => [{ type: "Applicant", id }],
    }),

    getApplicantApplications: builder.query<ApplicantApplication[], string>({
      query: (id) => `/applicants/${id}/applications`,
      transformResponse: (response: any) => response.data ?? response,
      providesTags: (_result, _err, id) => [
        { type: "Application", id: `applicant-${id}` },
      ],
    }),

    getApplicantDocuments: builder.query<ApplicantDocument[], string>({
      query: (id) => `/applicants/${id}/documents`,
      transformResponse: (response: any) => response.data ?? response,
      providesTags: (_result, _err, id) => [
        { type: "Document", id: `applicant-${id}` },
      ],
    }),

    getApplicantNotes: builder.query<ApplicantNote[], string>({
      query: (id) => `/applicants/${id}/notes`,
      transformResponse: (response: any) => response.data ?? response,
      providesTags: (_result, _err, id) => [
        { type: "Note", id: `applicant-${id}` },
      ],
    }),

    addApplicantNote: builder.mutation<
      ApplicantNote,
      { applicantId: string; text: string; type: string }
    >({
      query: ({ applicantId, ...body }) => ({
        url: `/applicants/${applicantId}/notes`,
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => response.data ?? response,
      invalidatesTags: (_result, _err, { applicantId }) => [
        { type: "Note", id: `applicant-${applicantId}` },
      ],
    }),

    updateApplicant: builder.mutation<
      ApplicantProfile,
      { id: string; data: Partial<ApplicantProfile> }
    >({
      query: ({ id, data }) => ({
        url: `/applicants/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: any) => response.data ?? response,
      invalidatesTags: (_result, _err, { id }) => [{ type: "Applicant", id }],
    }),

    uploadDocument: builder.mutation<
      ApplicantDocument,
      FormData
    >({
      query: (formData) => ({
        url: `/upload`,
        method: "POST",
        body: formData,
      }),
      transformResponse: (response: any) => response.data ?? response,
      invalidatesTags: (_result, _err, formData) => {
        const applicantId = formData.get("applicantId") as string;
        return [{ type: "Document", id: `applicant-${applicantId}` }];
      },
    }),

    deleteDocument: builder.mutation<
      void,
      { applicantId: string; docId: string }
    >({
      query: ({ applicantId, docId }) => ({
        url: `/applicants/${applicantId}/documents/${docId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, { applicantId }) => [
        { type: "Document", id: `applicant-${applicantId}` },
      ],
    }),

    updateApplication: builder.mutation<
      ApplicantApplication,
      { id: string; data: Partial<ApplicantApplication>, applicantId: string }
    >({
      query: ({ id, data }) => ({
        url: `/applications/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: any) => response.data ?? response,
      invalidatesTags: (_result, _err, { applicantId }) => [
        { type: "Application", id: `applicant-${applicantId}` },
      ],
    }),

    deleteApplication: builder.mutation<
      void,
      { id: string; applicantId: string }
    >({
      query: ({ id }) => ({
        url: `/applications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, { applicantId }) => [
        { type: "Application", id: `applicant-${applicantId}` },
      ],
    }),

    updateApplicantNote: builder.mutation<
      ApplicantNote,
      { id: string; data: Partial<ApplicantNote>, applicantId: string }
    >({
      query: ({ id, data }) => ({
        url: `/notes/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: any) => response.data ?? response,
      invalidatesTags: (_result, _err, { applicantId }) => [
        { type: "Note", id: `applicant-${applicantId}` },
      ],
    }),

    deleteApplicantNote: builder.mutation<
      void,
      { id: string; applicantId: string }
    >({
      query: ({ id }) => ({
        url: `/notes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, { applicantId }) => [
        { type: "Note", id: `applicant-${applicantId}` },
      ],
    }),

    getSecureDocumentUrl: builder.query<
      { success: boolean; signedUrl: string; mimeType: string },
      string
    >({
      query: (id) => `/documents/${id}/view`,
    }),

    updateDocumentStatus: builder.mutation<
      ApplicantDocument,
      { id: string; applicantId: string; data: Partial<ApplicantDocument> }
    >({
      query: ({ id, data }) => ({
        url: `/documents/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: any) => response.data ?? response,
      invalidatesTags: (_result, _err, { applicantId }) => [
        { type: "Document", id: `applicant-${applicantId}` },
      ],
    }),

    assignApplicant: builder.mutation<
      { success: boolean; data: any },
      { applicantId: string; agentId: string }
    >({
      query: ({ applicantId, agentId }) => ({
        url: `/applicants/${applicantId}/assign`,
        method: "PATCH",
        body: { agentId },
      }),
      invalidatesTags: (_result, _err, { applicantId }) => [
        { type: "Applicant", id: applicantId },
        { type: "Note", id: `applicant-${applicantId}` },
      ],
    }),

    getAgentsByBranch: builder.query<{ success: boolean; data: { id: string; name: string; email: string }[] }, string>({
      query: (branchId) => `/branches/${branchId}/agents`,
    }),

  }),
});

export const {
  useGetApplicantByIdQuery,
  useGetApplicantApplicationsQuery,
  useGetApplicantDocumentsQuery,
  useGetApplicantNotesQuery,
  useAddApplicantNoteMutation,
  useUpdateApplicantMutation,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
  useUpdateApplicationMutation,
  useDeleteApplicationMutation,
  useUpdateApplicantNoteMutation,
  useDeleteApplicantNoteMutation,
  useGetSecureDocumentUrlQuery,
  useUpdateDocumentStatusMutation,
  useAssignApplicantMutation,
  useGetAgentsByBranchQuery,
} = applicantDetailApi;

