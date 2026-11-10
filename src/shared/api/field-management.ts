import { z } from "zod";
import { pageQuerySchema } from "./pagination";
import { agendaSchema, scheduleInput, workdaySchema } from "./contracts";

export const fieldMemberSchema = z.object({
  displayName: z.string().nullable().optional(),
  id: z.uuid(),
  email: z.email(),
  role: z.enum(["commercial", "merchandiser"]),
});
export type FieldMember = z.infer<typeof fieldMemberSchema>;
const memberIdentity = {
  member_email: z.email(),
  member_role: z.enum(["commercial", "merchandiser"]).nullable(),
};
export const teamAgendaSchema = z.array(
  agendaSchema.element.extend(memberIdentity),
);
export const teamWorkdaysSchema = z.array(workdaySchema.extend(memberIdentity));
export const teamScheduleInput = scheduleInput
  .extend({ membershipId: z.uuid() })
  .strict();
export const fieldFiltersSchema = z
  .object({
    page: z.coerce.number().int().min(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().trim().max(200).optional(),
    status: z.enum(["pending", "active", "completed", "cancelled"]).optional(),
    workdayDate: z.iso.date().optional(),
    membershipId: z.uuid().optional(),
    role: z.enum(["commercial", "merchandiser"]).optional(),
    date: z.iso.date().optional(),
    dateFrom: z.iso.date().optional(),
    dateTo: z.iso.date().optional(),
  })
  .strict();
export const syncWeeklyRoutesInput = z
  .object({
    membershipId: z.uuid(),
    days: z
      .array(
        z
          .object({
            date: z.iso.date(),
            customerIds: z.array(z.uuid()).max(6),
          })
          .strict(),
      )
      .min(1)
      .max(7),
  })
  .strict();
export const syncWeeklyRoutesResponse = z.object({
  scheduled: z.number().int().nonnegative(),
});
export type SyncWeeklyRoutesInput = z.infer<typeof syncWeeklyRoutesInput>;
export type FieldFilters = z.input<typeof fieldFiltersSchema>;
export type MemberIdentity = z.infer<typeof teamAgendaSchema>[number];
export const teamRoutes = {
  members: "/field-operations/members",
  agenda: "/field-operations/agenda",
  workdays: "/field-operations/workdays",
  schedule: "/field-operations/visits",
  syncRoutes: "/field-operations/routes/sync",
  customers: (id: string) =>
    `/field-operations/members/${z.uuid().parse(id)}/customers`,
  evidence: (id: string) =>
    `/field-operations/visits/${z.uuid().parse(id)}/evidence`,
} as const;
export function fieldQuery(filters: FieldFilters): string {
  const parsed = fieldFiltersSchema.parse(filters);
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(parsed))
    if (value !== undefined) query.set(key, String(value));
  return query.size ? `?${query}` : "";
}
