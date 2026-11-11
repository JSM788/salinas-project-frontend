import { z } from "zod";
import { phoneSchema } from './phone';
import { pageSchema, pageQuerySchema } from "./pagination";
import type { Session } from "./contracts";

export const memberRoleSchema = z.enum([
  "commercial",
  "merchandiser",
  "manager",
]);
const id = z.uuid();
export const companySchema = z.object({
  id,
  name: z.string(),
  slug: z.string(),
  status: z.enum(["active", "suspended"]),
  suspendedAt: z.iso.datetime({ offset: true }).nullable(),
  timeZone: z.string(),
  hostnames: z.array(z.string()),
  managerEmail: z.email().nullable(),
  activeUserCount: z.number().int().nonnegative(),
  totalUserCount: z.number().int().nonnegative(),
});
export const teamMemberSchema = z.object({
  id,
  userId: id,
  companyId: id,
  displayName: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.email(),
  role: memberRoleSchema,
  active: z.boolean(),
  activatedAt: z.iso.datetime({offset:true}).nullable().default(null),
  passwordChangedAt: z.iso.datetime({offset:true}).nullable().default(null),
  invitationStatus: z.enum(["pending", "accepted", "expired"]).default("accepted"),
  deliveryStatus: z.enum(["pending", "sent", "failed"]).nullable().default(null),
});
export const platformMemberSchema = teamMemberSchema.extend({
  isPlatformOwner: z.boolean(),
});
export const createCompanyInput = z
  .object({
    name: z.string().trim().min(1).max(150),
    manager: z
      .object({
        displayName: z.string().trim().min(1).max(150),
        phone: phoneSchema,
        email: z.email().max(254),
      })
      .strict()
      .optional(),
    timeZone: z
      .string()
      .min(1)
      .refine((value) => {
        try {
          new Intl.DateTimeFormat("en", { timeZone: value });
          return true;
        } catch {
          return false;
        }
      }, "Zona horaria no válida"),
    hostname: z
      .string()
      .trim()
      .toLowerCase()
      .max(253)
      .regex(
        /^(?:localhost|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?|127\.0\.0\.1)$/,
      ),
  })
  .strict();
export const editCompanyInput = z
  .object({
    name: z.string().trim().min(1).max(150),
    timeZone: z
      .string()
      .min(1)
      .refine((value) => {
        try {
          new Intl.DateTimeFormat("en", { timeZone: value });
          return true;
        } catch {
          return false;
        }
      }, "Zona horaria no válida"),
    hostname: z
      .string()
      .trim()
      .toLowerCase()
      .max(253)
      .regex(
        /^(?:localhost|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?|127\.0\.0\.1)$/,
      )
      .optional(),
  })
  .strict();
export type EditCompanyInput = z.infer<typeof editCompanyInput>;
export const createMemberInput = z
  .object({
    displayName: z.string().trim().min(1).max(150),
    phone: phoneSchema,
    email: z
      .email()
      .max(254)
      .transform((value) => value.toLowerCase()),
    password: z.string().min(1).max(128).optional(),
    role: memberRoleSchema,
  })
  .strict();
export const memberStatusInput = z.object({ active: z.boolean() }).strict();
export const teamProfileInput = createMemberInput.omit({ role: true }).strict();
export const editMemberInput = createMemberInput
  .extend({
    password: z.string().min(1).max(128).optional(),
  });
export const companyStatusInput = z
  .object({ status: z.enum(["active", "suspended"]) })
  .strict();
export type PlatformCompany = z.infer<typeof companySchema>;
export type PlatformMember = z.infer<typeof platformMemberSchema>;
export type TeamMember = z.infer<typeof teamMemberSchema>;
export type CreateCompany = z.infer<typeof createCompanyInput>;
export type CreateMember = z.infer<typeof createMemberInput>;
export const companiesSchema = pageSchema(companySchema);
export const platformMembersSchema = pageSchema(platformMemberSchema);
export const teamMembersSchema = pageSchema(teamMemberSchema);
export const companyFiltersSchema = pageQuerySchema.extend({status:z.enum(["active","suspended"]).optional()}).strict();
export const memberFiltersSchema = pageQuerySchema.extend({role:memberRoleSchema.optional(),active:z.enum(["true","false"]).optional()}).strict();
export function initialCompanyId(
  companies: PlatformCompany[],
  ownCompanyId: string,
  requested: string | null,
) {
  const candidate = requested === null ? ownCompanyId : requested;
  return companies.some((company) => company.id === candidate) ? candidate : "";
}

import { APP_ROUTES } from "@/config/routes";

export interface RoutePolicy {
  prefix: string;
  scope?: "platform" | "tenant";
  allowedRoles?: readonly ("platform_owner" | "manager")[];
  requirePermission?: "manage_customers" | "manage_field_operations";
}

export const ROUTE_POLICIES: readonly RoutePolicy[] = [
  {
    prefix: APP_ROUTES.ADMIN.COMPANIES,
    scope: "platform",
    allowedRoles: ["platform_owner"],
  },
  {
    prefix: APP_ROUTES.ADMIN.USERS,
    scope: "platform",
    allowedRoles: ["platform_owner"],
  },
  {
    prefix: APP_ROUTES.ADMIN.ROOT,
    scope: "platform",
    allowedRoles: ["platform_owner"],
  },
  {
    prefix: APP_ROUTES.TEAM,
    scope: "tenant",
    allowedRoles: ["manager"],
  },
  {
    prefix: APP_ROUTES.CUSTOMERS,
    scope: "tenant",
    allowedRoles: ["manager"],
  },
  {
    prefix: APP_ROUTES.ROUTES,
    scope: "tenant",
    allowedRoles: ["manager"],
  },
  {
    prefix: APP_ROUTES.VISITS,
    scope: "tenant",
    allowedRoles: ["manager"],
  },
  {
    prefix: APP_ROUTES.SALES,
    scope: "tenant",
    allowedRoles: ["manager"],
  },
  {
    prefix: APP_ROUTES.REQUESTS,
    scope: "tenant",
    allowedRoles: ["manager"],
  },
  {
    prefix: APP_ROUTES.EXPENSES,
    scope: "tenant",
    allowedRoles: ["manager"],
  },
  {
    prefix: APP_ROUTES.DASHBOARD,
    scope: "tenant",
    allowedRoles: ["manager"],
  },
  {
    prefix: APP_ROUTES.CATALOG,
    scope: "tenant",
    allowedRoles: ["manager"],
  },
  {
    prefix: APP_ROUTES.INVENTORY,
    scope: "tenant",
    allowedRoles: ["manager"],
  },
  {
    prefix: APP_ROUTES.FINANCE,
    scope: "tenant",
    allowedRoles: ["manager"],
  },
  {
    prefix: APP_ROUTES.REPORTS,
    scope: "tenant",
    allowedRoles: ["manager"],
  },
  {
    prefix: APP_ROUTES.SETTINGS,
    scope: "tenant",
    allowedRoles: ["manager"],
  },
];

export const isPlatformOwner = (session: Session) =>
  session.scope === "platform";
const allowedWebRoles: ReadonlySet<string> = new Set(["platform_owner", "manager"]);
export const canAccessWeb = (session: Session) => allowedWebRoles.has(session.role);
export const canReadTeam = (session: Session) =>
  canAccessWeb(session) &&
  !isPlatformOwner(session) &&
  session.permissions?.some(
    (permission) =>
      permission === "manage_customers" ||
      permission === "manage_field_operations",
  ) === true;

export const landingRoute = (session: Session): string => {
  if (!canAccessWeb(session)) return `${APP_ROUTES.LOGIN}/`;
  return isPlatformOwner(session)
    ? `${APP_ROUTES.ADMIN.COMPANIES}/`
    : `${APP_ROUTES.CUSTOMERS}/`;
};

export function canAccessRoute(session: Session, path: string): boolean {
  if (!canAccessWeb(session)) return false;
  const normalized = path.replace(/\/$/, "");

  // Match against declarative route policies
  for (const policy of ROUTE_POLICIES) {
    if (normalized === policy.prefix || normalized.startsWith(`${policy.prefix}/`)) {
      if (policy.scope && session.scope !== policy.scope) return false;
      if (policy.allowedRoles && !policy.allowedRoles.includes(session.role as "platform_owner" | "manager")) return false;
      if (policy.requirePermission && !session.permissions?.includes(policy.requirePermission)) return false;
      if (policy.prefix === APP_ROUTES.TEAM && !canReadTeam(session)) return false;
      return true;
    }
  }

  // Deny by default
  return false;
}
