/**
 * Centralized API Endpoints (Source of Truth)
 * No raw API URL strings should ever be written inside components or pages.
 */

export const API_ENDPOINTS = {
  // Identity & Auth
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    ME: "/me",
  },

  // Field Operations
  FIELD_OPERATIONS: {
    AGENDA: "/field-operations/agenda",
    WORKDAYS: "/field-operations/workdays",
    SYNC_ROUTES: "/field-operations/routes/sync",
    MEMBERS: "/field-operations/members",
    VISIT_EVIDENCE: (visitId: string) => `/field-operations/visits/${visitId}/evidence`,
    MEMBER_CUSTOMERS: (membershipId: string) =>
      `/field-operations/members/${membershipId}/customers`,
  },

  // Personal Field Operator (Mobile / Self)
  ME_FIELD: {
    CUSTOMERS: "/me/customers",
    AGENDA: "/me/agenda",
    WORKDAY: "/me/workday",
    WORKDAYS: "/me/workdays",
    SCHEDULE: "/me/visits",
    VISIT_EVIDENCE: (visitId: string) => `/me/visits/${visitId}/evidence`,
    START_WORKDAY: "/me/workdays/start",
    END_WORKDAY: "/me/workdays/end",
  },

  // Customer Management
  CUSTOMERS: {
    ROOT: "/customers",
    ASSIGNEES: "/customers/assignees",
    ASSIGN: "/customers/assign",
    ASSIGNMENTS: "/customers/assignments",
    IMPORT: "/customers/import",
    DETAIL: (customerId: string) => `/customers/${customerId}`,
  },

  // Team Management
  TEAM: {
    MEMBERS: "/team/members",
    MEMBER_PROFILE: (membershipId: string) => `/team/members/${membershipId}`,
    MEMBER_DETAILS: (membershipId: string) => `/team/members/${membershipId}/details`,
    RESEND_INVITATION: (membershipId: string) =>
      `/team/members/${membershipId}/invitation`,
    HISTORY: (membershipId: string) => `/team/members/${membershipId}/history`,
  },

  // Platform (Global Owner)
  PLATFORM: {
    COMPANIES: "/platform/companies",
    COMPANY_DETAIL: (companyId: string) => `/platform/companies/${companyId}`,
    COMPANY_STATUS: (companyId: string) => `/platform/companies/${companyId}/status`,
    COMPANY_MEMBERS: (companyId: string) =>
      `/platform/companies/${companyId}/members`,
    MEMBER_STATUS: (companyId: string, memberId: string) =>
      `/platform/companies/${companyId}/members/${memberId}/status`,
    AUDIT_LOGS: "/platform/audit",
  },

  // Next.js Internal Route Handlers
  LOCAL_API: {
    PLACES_AUTOCOMPLETE: "/api/places/autocomplete",
    PLACES_DETAILS: "/api/places/details",
  },
} as const;
