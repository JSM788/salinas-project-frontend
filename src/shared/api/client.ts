import { z } from "zod";
import { httpClient, requestWithSchema, type RequestOptions } from "./http";

export { ApiError, errorText } from "./error-messages";
export { httpClient, localHttpClient } from "./http";

export async function apiRequest<T>(
  path: string,
  schema: z.ZodType<T>,
  options: RequestOptions = {},
): Promise<T> {
  return requestWithSchema(httpClient, path, schema, options);
}
