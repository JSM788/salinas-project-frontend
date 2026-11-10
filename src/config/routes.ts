/**
 * Centralized Application Routes (Source of Truth)
 * - Admin global zone: /admin/*
 * - Tenant company operation zone: /team, /customers, /routes, /visits, /sales, etc.
 */

export const APP_ROUTES = {
  ROOT: "/",
  LOGIN: "/login",
  INVITATION: (token: string) => `/invitation/${encodeURIComponent(token)}`,
  INVITATION_PREFIX: "/invitation",

  ADMIN: {
    ROOT: "/admin",
    COMPANIES: "/admin/companies",
    USERS: "/admin/users",
  },

  TEAM: "/team",
  CUSTOMERS: "/customers",
  CUSTOMER_DETAIL: (id: string) => `/customers/${id}`,
  ROUTES: "/routes",
  VISITS: "/visits",
  WORKDAY_DETAIL: (id: string) => `/visits/workday/${id}`,
  ACTIVE_VISIT: "/visits/active-visit",
  SALES: "/sales",
  NEW_QUOTE: "/sales/quotes/new",
  QUOTE_DETAIL: (id: string) => `/sales/quotes/${id}`,
  NEW_ORDER: "/sales/orders/new",
  ORDER_DETAIL: (id: string) => `/sales/orders/${id}`,
  REQUESTS: "/requests",
  EXPENSES: "/expenses",

  DASHBOARD: "/dashboard",
  CATALOG: "/catalog",
  INVENTORY: "/inventory",
  FINANCE: "/finance",
  REPORTS: "/reports",
  SETTINGS: "/settings",
} as const;
