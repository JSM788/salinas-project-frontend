import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiRequest } from "../client";
import { agendaSchema, workdaySchema } from "../contracts";
import { syncWeeklyRoutesResponse } from "../field-management";
import { pageSchema, queryPath } from "../pagination";

export interface AgendaQueryParams {
  membershipId?: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  pageSize?: number;
}

export interface WorkdaysQueryParams {
  date?: string;
  pageSize?: number;
}

export interface SyncWeeklyRoutesPayload {
  membershipId: string;
  days: Array<{ date: string; customerIds: string[] }>;
}

export const fieldOperationsApi = {
  getAgenda(params: AgendaQueryParams) {
    return apiRequest(
      queryPath(API_ENDPOINTS.FIELD_OPERATIONS.AGENDA, { ...params }),
      pageSchema(agendaSchema.element),
    );
  },

  getWorkdays(params: WorkdaysQueryParams) {
    return apiRequest(
      queryPath(API_ENDPOINTS.FIELD_OPERATIONS.WORKDAYS, { ...params }),
      pageSchema(workdaySchema),
    );
  },

  syncWeeklyRoutes(
    payload: SyncWeeklyRoutesPayload,
    idempotencyKey: string,
  ) {
    return apiRequest(
      API_ENDPOINTS.FIELD_OPERATIONS.SYNC_ROUTES,
      syncWeeklyRoutesResponse,
      {
        key: idempotencyKey,
        body: payload,
      },
    );
  },
};
