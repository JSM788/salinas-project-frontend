import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiRequest } from "../client";
import {
  managedCustomerSchema,
  customerAssigneeSchema,
  assignCustomersInput,
  assignmentResponse,
  createCustomerInput,
  importCustomersInput,
  importCustomersResponse,
  type CreateCustomerInput,
  type ImportCustomersInput,
} from "../customer-management";
import { pageSchema, queryPath } from "../pagination";

export interface CustomerQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  district?: string;
  zone?: string;
  assignment?: "assigned" | "unassigned";
  membershipId?: string;
  role?: "commercial" | "merchandiser";
}

export const customersApi = {
  list(params: CustomerQueryParams = {}) {
    return apiRequest(
      queryPath(API_ENDPOINTS.CUSTOMERS.ROOT, { ...params }),
      pageSchema(managedCustomerSchema),
    );
  },

  assignees(role?: "commercial" | "merchandiser") {
    return apiRequest(
      queryPath(API_ENDPOINTS.CUSTOMERS.ASSIGNEES, { role }),
      pageSchema(customerAssigneeSchema),
    );
  },

  create(payload: CreateCustomerInput, idempotencyKey: string) {
    const body = createCustomerInput.parse(payload);
    return apiRequest(API_ENDPOINTS.CUSTOMERS.ROOT, managedCustomerSchema, {
      body,
      key: idempotencyKey,
    });
  },

  assign(customerIds: string[], membershipId: string, idempotencyKey: string) {
    const body = assignCustomersInput.parse({ customerIds, membershipId });
    return apiRequest(API_ENDPOINTS.CUSTOMERS.ASSIGN, assignmentResponse, {
      body,
      key: idempotencyKey,
    });
  },

  import(payload: ImportCustomersInput, idempotencyKey: string) {
    const body = importCustomersInput.parse(payload);
    return apiRequest(API_ENDPOINTS.CUSTOMERS.IMPORT, importCustomersResponse, {
      body,
      key: idempotencyKey,
    });
  },
};

