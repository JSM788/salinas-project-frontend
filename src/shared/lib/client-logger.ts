import { apiRequest } from "@/shared/api/client";
import { clientLogResponseSchema, type LogLevel } from "@/shared/api/platform";

export interface FrontendLogPayload {
  level?: LogLevel;
  event: string;
  message: string;
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  companyId?: string | null;
  companyName?: string | null;
  screen?: string | null;
  details?: Record<string, unknown> | null;
}

/** Sends a structured frontend log entry to the backend logs/frontend/ channel (best-effort). */
export async function logFrontendEvent(payload: FrontendLogPayload): Promise<void> {
  try {
    await apiRequest("/logs/client", clientLogResponseSchema, {
      body: {
        source: "frontend",
        level: payload.level ?? "info",
        event: payload.event,
        message: payload.message,
        userId: payload.userId ?? null,
        userEmail: payload.userEmail ?? null,
        userName: payload.userName ?? null,
        companyId: payload.companyId ?? null,
        companyName: payload.companyName ?? null,
        screen:
          payload.screen ??
          (typeof window !== "undefined" ? window.location.pathname : null),
        details: payload.details ?? null,
      },
    });
  } catch {
    // Logging must never break the UI flow.
  }
}
