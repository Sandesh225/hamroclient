import { baseApi } from "./baseApi";

export interface AuditLogEntry {
  id: string;
  date: string;
  action: string;
  applicant: string;
  changedBy: string;
  fromStatus: string | null;
  toStatus: string | null;
  notes: string | null;
}

export interface AuditLogResponse {
  success: boolean;
  data: AuditLogEntry[];
}

interface FetchAuditLogArgs {
  search?: string;
  agent?: string;
  action?: string;
}

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<AuditLogResponse, FetchAuditLogArgs>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args.search) params.append("search", args.search);
        if (args.agent) params.append("agent", args.agent);
        if (args.action) params.append("action", args.action);

        return {
          url: `/dashboard/admin/audit?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["AuditLog" as any], // Typing workaround for missing tag
    }),
  }),
});

export const { useGetAuditLogsQuery } = auditApi;
