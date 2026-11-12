import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { z } from "zod";
import { APP_CONSTANTS } from "@/config/constants";
import { apiErrorSchema } from "./error-contract";
import { ApiError, apiErrorMessages } from "./error-messages";

/**
 * Ensures every request URL ends with a trailing slash before any query string,
 * matching Next.js `trailingSlash: true` and preventing 308 double round-trips.
 */
function withTrailingSlash(url: string): string {
  if (!url) return "/";
  const qIndex = url.indexOf("?");
  const pathname = qIndex === -1 ? url : url.slice(0, qIndex);
  const query = qIndex === -1 ? "" : url.slice(qIndex);
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return `${normalized}${query}`;
}

function attachInterceptors(instance: AxiosInstance): AxiosInstance {
  // Request interceptor ("ida"): normalizes trailing slashes and standard headers.
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (config.url) {
      config.url = withTrailingSlash(config.url);
    }
    if (!config.headers.has("Content-Type")) {
      config.headers.set("Content-Type", "application/json");
    }
    return config;
  });

  // Response interceptor ("vuelta"): centralizes 401 session expiry, network errors, and ApiError mapping.
  instance.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (error instanceof ApiError) {
        return Promise.reject(error);
      }

      if (!(error instanceof AxiosError) || !error.response) {
        return Promise.reject(
          new ApiError(
            0,
            "connection_lost",
            "No se pudo confirmar la operación. Reintenta con la misma información.",
          ),
        );
      }

      const { status, data } = error.response;
      const parsedError = apiErrorSchema.safeParse(data);
      if (!parsedError.success) {
        return Promise.reject(
          new ApiError(
            status,
            "invalid_api_response",
            "El servidor devolvió un error no reconocido.",
          ),
        );
      }

      if (status === 401 && typeof window !== "undefined") {
        window.dispatchEvent(new Event(APP_CONSTANTS.HTTP.SESSION_EXPIRED_EVENT));
      }

      return Promise.reject(
        new ApiError(
          status,
          parsedError.data.code,
          apiErrorMessages[parsedError.data.code] ??
            "No se pudo completar la operación. Revisa los datos o intenta nuevamente.",
          parsedError.data.requestId,
          parsedError.data.details,
        ),
      );
    },
  );

  return instance;
}

/** Central Axios instance for backend proxy endpoints (`/api/field/*`). */
export const httpClient = attachInterceptors(
  axios.create({
    baseURL: "/api/field",
    withCredentials: true,
    timeout: 15_000,
    headers: {
      "Content-Type": "application/json",
    },
  }),
);

/** Secondary Axios instance for internal Next.js API routes (`/api/*`). */
export const localHttpClient = attachInterceptors(
  axios.create({
    withCredentials: true,
    timeout: 15_000,
    headers: {
      "Content-Type": "application/json",
    },
  }),
);

export interface RequestOptions {
  body?: unknown;
  key?: string;
}

export async function requestWithSchema<T>(
  client: AxiosInstance,
  path: string,
  schema: z.ZodType<T>,
  options: RequestOptions = {},
): Promise<T> {
  const isPost = options.body !== undefined;
  const response = await client.request({
    url: path,
    method: isPost ? "POST" : "GET",
    data: isPost ? options.body : undefined,
    headers: options.key ? { "Idempotency-Key": options.key } : undefined,
  });

  const parsed = schema.safeParse(response.data);
  if (!parsed.success) {
    throw new ApiError(
      502,
      "invalid_api_response",
      "Los datos recibidos no coinciden con el contrato de la API.",
    );
  }
  return parsed.data;
}

