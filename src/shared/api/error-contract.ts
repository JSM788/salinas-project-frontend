import { z } from 'zod';

export const fieldIssueSchema = z.object({
  path: z.array(z.union([z.string(), z.number().int().nonnegative()])),
  code: z.string().optional(),
  message: z.string(),
});
export type FieldIssue = z.infer<typeof fieldIssueSchema>;
export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  requestId: z.string().optional(),
  details: z.array(fieldIssueSchema).optional(),
});
