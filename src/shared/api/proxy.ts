import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorSchema as errorSchema, type FieldIssue } from './error-contract';
import {
  companySchema,
  platformMemberSchema,
  teamMemberSchema,
  createCompanyInput,
  editCompanyInput,
  createMemberInput,
  memberStatusInput,
  editMemberInput,
  teamProfileInput,
  companyStatusInput,
  companyFiltersSchema,
  memberFiltersSchema,
  platformAuditEntrySchema,
  platformAuditQuerySchema,
  clientLogInputSchema,
  clientLogResponseSchema,
  platformLogEventSchema,
  platformLogEventsQuerySchema,
  platformLogUsersSchema,
  platformLogUsersQuerySchema,
  platformLogsSummaryResponseSchema,
  platformLogsSummaryQuerySchema,
  platformLogFilesSchema,
  platformLogFilesQuerySchema,
  platformLogFileContentSchema,
} from "./platform";
import { pageQuerySchema, pageSchema } from "./pagination";
import { accessHistorySchema } from "./access-history";
import { invitationSchema, acceptInvitationInput, acceptedInvitationSchema, resentInvitationSchema } from "./invitations";
import {
  fieldMemberSchema,
  fieldFiltersSchema,
  teamAgendaSchema,
  teamWorkdaysSchema,
  teamScheduleInput,
  syncWeeklyRoutesInput,
  syncWeeklyRoutesResponse,
} from "./field-management";
import {
  managedCustomerSchema,
  customerAssigneeSchema,
  createCustomerInput,
  importCustomersInput,
  importCustomersResponse,
  assignCustomersInput,
  assignmentResponse,
} from "./customer-management";
import {
  agendaSchema,
  closeInput,
  customerSchema,
  evidenceSchema,
  loginInput,
  loginResponse,
  scheduleInput,
  sessionSchema,
  visitSchema,
  workdaySchema,
} from "./contracts";

const cookieName = "field_session";
interface Config {
  url: string;
  timeoutMs: number;
  secure: boolean;
}
const empty = z.object({}).strict();
const personalFilters = z.object({ page: z.coerce.number().int().min(1).optional(), pageSize: z.coerce.number().int().min(1).max(100).optional(), search: z.string().trim().max(200).optional(), status: z.enum(["pending", "active", "completed", "cancelled"]).optional(), workdayDate: z.iso.date().optional(), date: z.iso.date().optional(), dateFrom: z.iso.date().optional(), dateTo: z.iso.date().optional() }).strict();
const customerFilters = pageQuerySchema.extend({district:z.string().max(100).optional(),zone:z.string().max(100).optional(),membershipId:z.uuid().optional(),role:z.enum(["commercial","merchandiser"]).optional(),assignment:z.enum(["assigned","unassigned"]).optional()}).strict();
const publicInvitation = /^invitations\/[A-Za-z0-9_-]{43}(?:\/accept)?$/;
function routeFor(path: string, method: string) {
  if (method === "GET") {
    const accessHistory = /^(?:platform\/companies\/([a-f0-9-]+)\/members|team\/members)\/([a-f0-9-]+)\/access-history$/.exec(path);
    if (accessHistory && (!accessHistory[1] || z.uuid().safeParse(accessHistory[1]).success) && z.uuid().safeParse(accessHistory[2]).success)
      return {output:accessHistorySchema,query:pageQuerySchema.pick({page:true,pageSize:true}).strict()};
    if (/^invitations\/[A-Za-z0-9_-]{43}$/.test(path)) return {output:invitationSchema};
    if (path === "platform/companies")
      return { output: pageSchema(companySchema), query:companyFiltersSchema };
    if (path === "platform/audit-logs")
      return { output: pageSchema(platformAuditEntrySchema), query: platformAuditQuerySchema };
    if (path === "platform/logs/summary")
      return { output: platformLogsSummaryResponseSchema, query: platformLogsSummaryQuerySchema };
    if (path === "platform/logs/users")
      return { output: platformLogUsersSchema, query: platformLogUsersQuerySchema };
    if (path === "platform/logs/events")
      return { output: pageSchema(platformLogEventSchema), query: platformLogEventsQuerySchema };
    if (path === "platform/logs/files")
      return { output: platformLogFilesSchema, query: platformLogFilesQuerySchema };
    if (/^platform\/logs\/files\/(backend|frontend|mobile)\/[A-Za-z0-9._-]+\.log$/.test(path))
      return { output: platformLogFileContentSchema };
    if (path === "team/members") return { output: pageSchema(teamMemberSchema), query:memberFiltersSchema };
    const companyMembers = /^platform\/companies\/([a-f0-9-]+)\/members$/.exec(
      path,
    );
    if (companyMembers && z.uuid().safeParse(companyMembers[1]).success)
      return { output: pageSchema(platformMemberSchema), query:memberFiltersSchema };
    if (path === "field-operations/members")
      return { output: pageSchema(fieldMemberSchema), query:fieldFiltersSchema };
    if (path === "field-operations/agenda")
      return { output: pageSchema(teamAgendaSchema.element), query: fieldFiltersSchema };
    if (path === "field-operations/workdays")
      return { output: pageSchema(teamWorkdaysSchema.element), query: fieldFiltersSchema };
    const memberCustomers =
      /^field-operations\/members\/([a-f0-9-]+)\/customers$/.exec(path);
    if (memberCustomers && z.uuid().safeParse(memberCustomers[1]).success)
      return { output: pageSchema(customerSchema), query:customerFilters };
    const teamEvidence =
      /^field-operations\/visits\/([a-f0-9-]+)\/evidence$/.exec(path);
    if (teamEvidence && z.uuid().safeParse(teamEvidence[1]).success)
      return { output: evidenceSchema };
    if (path === "customers") return { output: pageSchema(managedCustomerSchema), query:customerFilters };
    if (path === "customers/assignees")
      return { output: pageSchema(customerAssigneeSchema), query:customerFilters };
    if (path === "me") return { output: sessionSchema };
    if (path === "me/customers") return { output: pageSchema(customerSchema), query:customerFilters };
    if (path === "me/agenda") return { output: pageSchema(agendaSchema.element), query: personalFilters };
    if (path === "me/workday") return { output: workdaySchema.nullable() };
    if (path === "me/workdays") return { output: pageSchema(workdaySchema), query: personalFilters };
    const evidence = /^me\/visits\/([a-f0-9-]+)\/evidence$/.exec(path);
    if (evidence && z.uuid().safeParse(evidence[1]).success)
      return { output: evidenceSchema };
  }
  if (method === "POST") {
    const teamDetails = /^team\/members\/([a-f0-9-]+)\/details$/.exec(path);
    if (teamDetails && z.uuid().safeParse(teamDetails[1]).success)
      return { input: teamProfileInput, output: teamMemberSchema, key: true };
    if (/^invitations\/[A-Za-z0-9_-]{43}\/accept$/.test(path)) return {input:acceptInvitationInput,output:acceptedInvitationSchema};
    if (/^(?:platform\/companies\/[a-f0-9-]{36}\/members|team\/members)\/[a-f0-9-]{36}\/invitation$/.test(path)) return {input:empty,output:resentInvitationSchema,key:true};
    if (/^field-operations\/visits\/[a-f0-9-]{36}\/(reschedule|cancel)$/.test(path)) return {input:path.endsWith("reschedule")?z.object({scheduledAt:z.iso.datetime({offset:true}),expectedVersion:z.number().int().nonnegative()}).strict():z.object({expectedVersion:z.number().int().nonnegative(),reason:z.string().trim().max(1000).optional()}).strict(),output:visitSchema,key:true};
    if (path === "logs/client")
      return { input: clientLogInputSchema, output: clientLogResponseSchema };
    if (path === "platform/companies")
      return { input: createCompanyInput, output: companySchema, key: true };
    const companyStatus = /^platform\/companies\/([a-f0-9-]+)\/status$/.exec(
      path,
    );
    if (companyStatus && z.uuid().safeParse(companyStatus[1]).success)
      return { input: companyStatusInput, output: companySchema, key: true };
    const companyDetails = /^platform\/companies\/([a-f0-9-]+)\/details$/.exec(
      path,
    );
    if (companyDetails && z.uuid().safeParse(companyDetails[1]).success)
      return { input: editCompanyInput, output: companySchema, key: true };
    const companyMembers = /^platform\/companies\/([a-f0-9-]+)\/members$/.exec(
      path,
    );
    if (companyMembers && z.uuid().safeParse(companyMembers[1]).success)
      return {
        input: createMemberInput,
        output: platformMemberSchema,
        key: true,
      };
    const memberDetails =
      /^platform\/companies\/([a-f0-9-]+)\/members\/([a-f0-9-]+)\/details$/.exec(
        path,
      );
    if (
      memberDetails &&
      memberDetails.slice(1).every((value) => z.uuid().safeParse(value).success)
    )
      return {
        input: editMemberInput,
        output: platformMemberSchema,
        key: true,
      };
    const memberStatus =
      /^platform\/companies\/([a-f0-9-]+)\/members\/([a-f0-9-]+)\/status$/.exec(
        path,
      );
    if (
      memberStatus &&
      memberStatus.slice(1).every((value) => z.uuid().safeParse(value).success)
    )
      return {
        input: memberStatusInput,
        output: platformMemberSchema,
        key: true,
      };
    if (path === "field-operations/visits")
      return { input: teamScheduleInput, output: visitSchema, key: true };
    if (path === "field-operations/routes/sync")
      return { input: syncWeeklyRoutesInput, output: syncWeeklyRoutesResponse, key: true };
    if (path === "customers")
      return { input: createCustomerInput, output: managedCustomerSchema };
    if (path === "customers/import")
      return { input: importCustomersInput, output: importCustomersResponse };
    if (path === "customers/assignments")
      return { input: assignCustomersInput, output: assignmentResponse };
    if (path === "auth/login")
      return { input: loginInput, output: loginResponse };
    if (path === "auth/logout")
      return { input: empty, output: z.object({ loggedOut: z.boolean() }) };
    if (path === "me/visits")
      return { input: scheduleInput, output: visitSchema, key: true };
    if (["me/workdays/start", "me/workdays/end"].includes(path))
      return { input: empty, output: workdaySchema, key: true };
    const visit = /^me\/visits\/([a-f0-9-]+)\/(check-in|close)$/.exec(path);
    if (visit && z.uuid().safeParse(visit[1]).success)
      return {
        input: visit[2] === "close" ? closeInput : empty,
        output: visitSchema,
        key: true,
      };
  }
  return null;
}
export function createProxy(config: Config, upstream: typeof fetch = fetch) {
  return async (request: NextRequest, segments: string[]) => {
    const requestId = crypto.randomUUID();
    const error = (status: number, code: string, message: string, details?: FieldIssue[]) =>
      NextResponse.json(
        { code, message, requestId, ...(details ? { details } : {}) },
        {
          status,
          headers: { "Cache-Control": "no-store", "X-Request-Id": requestId },
        },
      );
    const path = segments.join("/");
    const authority = request.headers.get("host");
    if (
      !authority ||
      !/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?(?::[0-9]{1,5})?$/i.test(authority)
    )
      return error(400, "invalid_host", "El dominio de acceso no es válido.");
    let publicUrl: URL;
    try {
      publicUrl = new URL(`${request.nextUrl.protocol}//${authority}`);
    } catch {
      return error(400, "invalid_host", "El dominio de acceso no es válido.");
    }
    const route = routeFor(path, request.method);
    if (!route)
      return error(
        404,
        "unsupported_route",
        "Esta función todavía no está disponible.",
      );
    let search = "";
    if (request.nextUrl.search) {
      if (!("query" in route) || !route.query)
        return error(
          400,
          "unsupported_parameters",
          "La solicitud contiene parámetros no admitidos.",
        );
      const values: Record<string, string> = {};
      for (const [name, value] of Array.from(
        request.nextUrl.searchParams.entries(),
      )) {
        if (name in values)
          return error(
            400,
            "unsupported_parameters",
            "La solicitud contiene parámetros repetidos.",
          );
        values[name] = value;
      }
      const filters = route.query.safeParse(values);
      if (!filters.success)
        return error(
          400,
          "unsupported_parameters",
          "Revisa los filtros de la consulta.",
        );
      search = `?${new URLSearchParams(
        Object.entries(filters.data)
          .filter(([, value]) => value !== undefined)
          .map(([name, value]) => [name, String(value)]),
      )}`;
    }
    if (
      request.method === "POST" &&
      request.headers.get("origin") !== publicUrl.origin
    )
      return error(
        403,
        "invalid_origin",
        "No se pudo verificar el origen de la solicitud.",
      );
    const token = request.cookies.get(cookieName)?.value;
    const unauthenticated = path === "auth/login" || publicInvitation.test(path);
    if (!unauthenticated && (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)))
      return error(
        401,
        "authentication_required",
        "Inicia sesión para continuar.",
      );
    const headers = new Headers({ "Content-Type": "application/json" });
    headers.set("X-Client-Channel", "web");
    const hostname = publicUrl.hostname.toLowerCase();
    const skipTenantHost =
      (hostname === "localhost" || hostname === "127.0.0.1");
    if (!skipTenantHost) headers.set("X-Tenant-Host", hostname);
    if (!unauthenticated) headers.set("Authorization", `Bearer ${token}`);
    let body: string | undefined;
    if ("input" in route && route.input) {
      if (
        request.headers.get("content-type")?.split(";")[0] !==
        "application/json"
      )
        return error(
          415,
          "invalid_content_type",
          "Se requiere una solicitud JSON.",
        );
      const text = await request.text();
      const bodyLimit = /^me\/visits\/[a-f0-9-]+\/close$/.test(path)
        ? 1500000
        : path === "customers/import"
          ? 524288
          : 32768;
      if (new TextEncoder().encode(text).length > bodyLimit)
        return error(
          413,
          "request_too_large",
          "La solicitud supera el tamaño permitido.",
        );
      let value: unknown;
      try {
        value = JSON.parse(text);
      } catch {
        return error(400, "invalid_request", "La solicitud JSON no es válida.");
      }
      const parsed = route.input.safeParse(value);
      if (!parsed.success)
        return error(400, "invalid_request", "Revisa los campos ingresados.", parsed.error.issues.map(issue => ({ path: issue.path.map(part => typeof part === 'number' ? part : String(part)), code: issue.code, message: 'Revisa este campo.' })));
      body = JSON.stringify(parsed.data);
    }
    if ("key" in route) {
      const key = request.headers.get("idempotency-key");
      if (!key || !/^[A-Za-z0-9_.:-]{1,128}$/.test(key))
        return error(
          400,
          "invalid_operation_key",
          "No se pudo identificar la operación.",
        );
      headers.set("Idempotency-Key", key);
    }
    try {
      const upstreamPath = path === "auth/login" ? "auth/web/login" : path;
      const response = await upstream(`${config.url}/v1/${upstreamPath}${search}`, {
        method: request.method,
        headers,
        body,
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(config.timeoutMs),
      });
      const data: unknown = await response.json();
      if (!response.ok) {
        const parsed = errorSchema.safeParse(data);
        if (!parsed.success)
          return error(
            502,
            "invalid_api_response",
            "La API devolvió un error no reconocido.",
          );
        const result = NextResponse.json(parsed.data, {
          status: response.status,
          headers: {
            "Cache-Control": "no-store",
            "X-Request-Id": parsed.data.requestId ?? requestId,
          },
        });
        if (response.status === 401 || parsed.data.code === "web_access_denied")
          result.cookies.set(cookieName, "", {
            httpOnly: true,
            sameSite: "strict",
            secure: config.secure,
            path: "/",
            maxAge: 0,
          });
        return result;
      }
      const parsed = route.output.safeParse(data);
      if (!parsed.success) {
        console.error(
          JSON.stringify({
            event: "invalid_api_response",
            requestId,
            route: publicInvitation.test(path) ? "invitations/[token]" : path,
          }),
        );
        return error(
          502,
          "invalid_api_response",
          "La respuesta de la API no coincide con el contrato.",
        );
      }
      const result = NextResponse.json(
        path === "auth/login" ? { authenticated: true } : parsed.data,
        {
          headers: {
            "Cache-Control": "no-store",
            "X-Request-Id": response.headers.get("x-request-id") ?? requestId,
          },
        },
      );
      if (path === "auth/login") {
        const session = loginResponse.parse(parsed.data);
        if (new Date(session.expiresAt).getTime() <= Date.now())
          return error(
            502,
            "invalid_api_response",
            "La sesión recibida ya venció.",
          );
        result.cookies.set(cookieName, session.token, {
          httpOnly: true,
          sameSite: "strict",
          secure: config.secure,
          path: "/",
          expires: new Date(session.expiresAt),
        });
      }
      if (path === "auth/logout")
        result.cookies.set(cookieName, "", {
          httpOnly: true,
          sameSite: "strict",
          secure: config.secure,
          path: "/",
          maxAge: 0,
        });
      return result;
    } catch (cause) {
      console.error(
        JSON.stringify({
          event: "backend_request_failed",
          requestId,
          route: publicInvitation.test(path) ? "invitations/[token]" : path,
          errorType: cause instanceof Error ? cause.name : "unknown",
        }),
      );
      return error(
        502,
        "backend_unavailable",
        "No se pudo contactar con el servidor. Reintenta la operación.",
      );
    }
  };
}
export function loadProxyConfig(env: NodeJS.ProcessEnv): Config {
  const url = z.url().parse(env.BACKEND_URL);
  const parsed = new URL(url);
  if (
    !["http:", "https:"].includes(parsed.protocol) ||
    parsed.pathname !== "/" ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash
  )
    throw new Error("BACKEND_URL must be a plain HTTP origin");
  const timeoutMs = z.coerce
    .number()
    .int()
    .min(100)
    .max(30000)
    .default(10000)
    .parse(env.BACKEND_TIMEOUT_MS);
  return {
    url: parsed.origin,
    timeoutMs,
    secure: env.NODE_ENV === "production",
  };
}
