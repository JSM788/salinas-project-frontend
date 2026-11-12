import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiRequest } from "../client";
import { pageSchema, queryPath } from "../pagination";
import {
  companiesSchema,
  companySchema,
  platformMemberSchema,
  platformMembersSchema,
  type PlatformCompany,
  type PlatformMember,
} from "../platform";

export interface CompanyQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

export interface CompanyMembersQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  active?: string;
}

export const platformApi = {
  companies(params: CompanyQueryParams = {}) {
    return apiRequest(
      queryPath(API_ENDPOINTS.PLATFORM.COMPANIES, { ...params }),
      companiesSchema,
    );
  },

  setCompanyStatus(companyId: string, status: "active" | "suspended", idempotencyKey: string) {
    return apiRequest(
      API_ENDPOINTS.PLATFORM.COMPANY_STATUS(companyId),
      companySchema,
      {
        body: { status },
        key: idempotencyKey,
      },
    );
  },

  companyMembers(companyId: string, params: CompanyMembersQueryParams = {}) {
    return apiRequest(
      queryPath(API_ENDPOINTS.PLATFORM.COMPANY_MEMBERS(companyId), { ...params }),
      platformMembersSchema,
    );
  },

  setMemberStatus(
    companyId: string,
    memberId: string,
    active: boolean,
    idempotencyKey: string,
  ) {
    return apiRequest(
      API_ENDPOINTS.PLATFORM.MEMBER_STATUS(companyId, memberId),
      platformMemberSchema,
      {
        body: { active },
        key: idempotencyKey,
      },
    );
  },
};

