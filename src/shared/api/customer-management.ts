import { z } from "zod";

const id = z.uuid();
export const fieldRoleSchema = z.enum(["commercial", "merchandiser"]);
export const customerAssigneeSchema = z.object({
  displayName: z.string().nullable().optional(),
  id,
  email: z.email(),
  role: fieldRoleSchema,
});
export const managedCustomerSchema = z.object({
  id,
  name: z.string(),
  address: z.string(),
  ruc: z.string().nullable(),
  district: z.string().nullable(),
  zone: z.string().nullable(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  condition: z.enum(["Al día", "Con atraso"]).nullable(),
  lastPurchaseDate: z.iso.date().nullable(),
  assignments: z.array(
    z.object({ membershipId: id, email: z.email(), displayName: z.string().nullable().optional(), role: fieldRoleSchema }),
  ),
});
export const createCustomerInput = z
  .object({
    name: z.string().trim().min(1).max(150),
    address: z.string().trim().min(1).max(300),
    ruc: z.string().regex(/^\d{11}$/),
    district: z.string().trim().min(1).max(100),
    zone: z.string().trim().max(100).optional(),
    latitude: z.number().min(-90).max(90).nullable().optional(),
    longitude: z.number().min(-180).max(180).nullable().optional(),
    commercialMembershipId: id.optional(),
    merchandiserMembershipId: id.optional(),
  })
  .strict();
export const importCustomerItemInput = z
  .object({
    name: z.string().trim().min(1).max(150),
    address: z.string().trim().min(1).max(300),
    ruc: z.string().regex(/^\d{11}$/),
    district: z.string().trim().min(1).max(100),
    zone: z.string().trim().max(100).optional(),
    latitude: z.number().min(-90).max(90).nullable().optional(),
    longitude: z.number().min(-180).max(180).nullable().optional(),
  })
  .strict();
export const importCustomersInput = z
  .object({
    items: z.array(importCustomerItemInput).min(1).max(500),
  })
  .strict();
export const importCustomersResponse = z.object({
  imported: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
});
export const assignCustomersInput = z
  .object({
    customerIds: z
      .array(id)
      .min(1)
      .max(200)
      .refine((ids) => new Set(ids).size === ids.length),
    membershipId: id,
  })
  .strict();
export const assignmentResponse = z.object({
  updated: z.number().int().nonnegative(),
});
export type ManagedCustomer = z.infer<typeof managedCustomerSchema>;
export type CustomerAssignee = z.infer<typeof customerAssigneeSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerInput>;
export type ImportCustomerItemInput = z.infer<typeof importCustomerItemInput>;
export type ImportCustomersInput = z.infer<typeof importCustomersInput>;
