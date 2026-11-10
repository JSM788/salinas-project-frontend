import { z } from "zod";
import { apiRequest } from "./client";

export const pageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().trim().max(200).optional(),
});
export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  [index: number]: T;
}
export function pageSchema<T extends z.ZodType>(item: T): z.ZodType<Page<z.infer<T>>> {
  const paged = z
    .object({
      items: z.array(item),
      page: z.number().int().positive(),
      pageSize: z.number().int().positive(),
      total: z.number().int().nonnegative(),
    })
    .transform((val) => {
      const result = { ...val } as Page<z.infer<T>>;
      for (let i = 0; i < val.items.length; i++) {
        result[i] = val.items[i];
      }
      return result;
    });

  return z.preprocess((val) => {
    if (Array.isArray(val)) {
      return {
        items: val,
        page: 1,
        pageSize: Math.max(val.length, 1),
        total: val.length,
      };
    }
    return val;
  }, paged) as unknown as z.ZodType<Page<z.infer<T>>>;
}
export function queryPath(path: string, values: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (value !== undefined && value !== "") query.set(key, String(value));
  return query.size ? `${path}?${query}` : path;
}
/** Directories deliberately traverse every page; result lists use one page only. */
export async function loadDirectory<T>(path: string, schema: z.ZodType<T>): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  while (true) {
    const result = await apiRequest(queryPath(path, { page, pageSize: 100 }), pageSchema(schema));
    items.push(...result.items);
    if (page * result.pageSize >= result.total) return items;
    page++;
  }
}
