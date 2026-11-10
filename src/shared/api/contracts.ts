import { z } from "zod";

const id = z.uuid();
const timestamp = z.iso.datetime({ offset: true });
const sessionBase = z.object({
  userId: id,
  permissions: z
    .array(
      z.enum([
        "manage_customers",
        "manage_field_operations",
        "manage_platform",
      ]),
    )
    .optional(),
  email: z.email(),
});
export const sessionSchema = z.discriminatedUnion("scope", [
  sessionBase.extend({ scope: z.literal("platform"), companyId: z.null(), membershipId: z.null(), role: z.literal("platform_owner"), timeZone: z.null() }),
  sessionBase.extend({ scope: z.literal("tenant"), companyId: id, membershipId: id, role: z.enum(["commercial", "merchandiser", "manager"]), timeZone: z.string().min(1) }),
]);
export const loginInput = z
  .object({ email: z.email().max(254), password: z.string().min(4).max(128) })
  .strict();
export const loginResponse = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  expiresAt: timestamp,
});
export const customerSchema = z.object({
  id,
  name: z.string(),
  address: z.string(),
});
export const workdaySchema = z.object({
  id,
  company_id: id,
  membership_id: id,
  business_date: z.iso.date(),
  role: z.enum(["commercial", "merchandiser"]).nullable(),
  completed_visits: z.number().int().nonnegative(),
  total_visits: z.number().int().nonnegative(),
  status: z.enum(["active", "completed"]),
  started_at: timestamp,
  ended_at: timestamp.nullable(),
});
export const exhibitionAuditSchema = z
  .object({
    hasShelfStock: z.boolean(),
    noStockReason: z.string().trim().max(1000).optional(),
    brandDisplay: z.enum(["adequate", "inadequate"]),
    pricesVisible: z.boolean(),
  })
  .strict()
  .refine(
    (audit) => audit.hasShelfStock || Boolean(audit.noStockReason?.trim()),
    { message: "El motivo es obligatorio cuando no hay stock." },
  );
export const visitSchema = z.object({
  id,
  company_id: id,
  membership_id: id,
  customer_id: id,
  scheduled_at: timestamp,
  version: z.number().int().nonnegative().optional(),
  stop_order: z.number().int().nullable().optional(),
  planned_role: z.enum(["commercial", "merchandiser"]).nullable().optional(),
  execution_role: z.enum(["commercial", "merchandiser"]).nullable().optional(),
  cancelled_at: timestamp.nullable().optional(),
  cancellation_reason: z.string().nullable().optional(),
  workday_id: id.nullable(),
  status: z.enum(["pending", "active", "completed", "cancelled"]),
  arrived_at: timestamp.nullable(),
  ended_at: timestamp.nullable(),
  result: z.enum(["attended", "closed", "unavailable"]).nullable(),
  observations: z.string().nullable(),
  audit: exhibitionAuditSchema.nullable().optional(),
});
export const agendaSchema = z.array(
  visitSchema.extend({
    customer_name: z.string(),
    customer_address: z.string(),
    customer_ruc: z.string().nullable().optional(),
    customer_district: z.string().nullable().optional(),
    customer_latitude: z.number().nullable().optional(),
    customer_longitude: z.number().nullable().optional(),
    has_evidence: z.boolean(),
  }),
);
export const attachmentSchema = z
  .object({
    mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    base64: z
      .string()
      .min(4)
      .max(1398104)
      .regex(
        /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/,
      ),
  })
  .strict();
export const evidenceSchema = attachmentSchema.nullable();
export const scheduleInput = z
  .object({ customerId: id, scheduledAt: timestamp })
  .strict();
export const closeInput = z
  .object({
    result: z.enum(["attended", "closed", "unavailable"]),
    observations: z.string().trim().max(4000),
    attachment: attachmentSchema.optional(),
    audit: exhibitionAuditSchema.optional(),
  })
  .strict();
export type Session = z.infer<typeof sessionSchema>;
export type Customer = z.infer<typeof customerSchema>;
export type Workday = z.infer<typeof workdaySchema>;
export type Visit = z.infer<typeof agendaSchema>[number];
export type VisitResult = z.infer<typeof closeInput>["result"];
export const fieldRoutes = {
  customers: "/me/customers",
  agenda: "/me/agenda",
  workday: "/me/workday",
  workdays: "/me/workdays",
  schedule: "/me/visits",
  start: "/me/workdays/start",
  end: "/me/workdays/end",
} as const;
export const fieldPath = "/visits/";
export const roleLabels = {
  commercial: "Comercial",
  merchandiser: "Mercaderista",
  manager: "Gerencia",
  platform_owner: "Propietario",
} as const;
