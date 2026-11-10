import { z } from "zod";
export const invitationSchema = z.object({
  purpose: z.enum(["activation", "password_reset"]),
  companyId: z.uuid(), companyName: z.string(), tenantHost: z.string(), email: z.email(),
  role: z.enum(["manager", "commercial", "merchandiser"]), expiresAt: z.iso.datetime({offset:true}),
});
export const acceptInvitationInput = z.object({password:z.string().min(1).max(128)}).strict();
export const acceptedInvitationSchema = z.object({companyId:z.uuid(),tenantHost:z.string(),email:z.email(),purpose:z.enum(["activation","password_reset"])});
export const resentInvitationSchema = z.object({id:z.uuid(),invitationStatus:z.enum(["pending","accepted","expired"]),deliveryStatus:z.literal("pending")});
