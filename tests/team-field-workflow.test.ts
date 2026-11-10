import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { createProxy } from "../src/shared/api/proxy";
import { planningForDate } from "../src/modules/comercial/visitas-jornadas/connected/planning";

const memberId = "ce08cf53-561c-44c5-9c24-466f72612c42";
const otherId = "e647e500-5b50-40d1-a000-11644c2b38c8";
const origin = "http://localhost:3001";
const headers = {
  Host: "localhost:3001",
  Origin: origin,
  "Content-Type": "application/json",
  Cookie: `field_session=${"a".repeat(43)}`,
  "Idempotency-Key": "team-schedule-1",
};
const visit = {
  id: memberId,
  company_id: memberId,
  membership_id: memberId,
  customer_id: memberId,
  scheduled_at: "2026-10-29T14:00:00Z",
  workday_id: null,
  status: "pending" as const,
  version: 0,
  planned_role: "commercial" as const,
  execution_role: null,
  cancelled_at: null,
  cancellation_reason: null,
  arrived_at: null,
  ended_at: null,
  result: null,
  observations: null,
  audit: null,
  customer_name: "Cliente",
  customer_address: "Dirección",
  has_evidence: false,
};

test("team proxy forwards validated filters, assigned customers and targeted scheduling while retaining personal restrictions", async () => {
  const calls: string[] = [];
  const proxy = createProxy(
    { url: "http://127.0.0.1:3002", timeoutMs: 1000, secure: false },
    async (url, init) => {
      calls.push(String(url));
      if (init?.method === "POST") return Response.json(visit);
      if (
        String(url).includes("/members/") &&
        String(url).endsWith("/customers")
      )
        return Response.json([
          { id: memberId, name: "Cliente", address: "Dirección" },
        ]);
      return Response.json([
        {
          ...visit,
          member_email: "merch@example.com",
          member_role: "merchandiser",
        },
      ]);
    },
  );
  const call = (path: string, body?: unknown) =>
    proxy(
      new NextRequest(`${origin}/api/field/${path}`, {
        method: body === undefined ? "GET" : "POST",
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
      path.split("?")[0].split("/"),
    );
  const query = `membershipId=${memberId}&role=merchandiser&date=2026-10-29`;
  assert.equal((await call(`field-operations/agenda?${query}`)).status, 200);
  assert.equal(
    calls.at(-1),
    `http://127.0.0.1:3002/v1/field-operations/agenda?${query}`,
  );
  assert.equal(
    (await call(`field-operations/members/${memberId}/customers`)).status,
    200,
  );
  assert.equal(
    (
      await call("field-operations/visits", {
        membershipId: memberId,
        customerId: memberId,
        scheduledAt: visit.scheduled_at,
      })
    ).status,
    200,
  );
  const beforeRejected = calls.length;
  for (const path of [
    "field-operations/agenda?companyId=other",
    "field-operations/agenda?role=admin",
    "field-operations/agenda?date=invalid",
    `field-operations/agenda?membershipId=${memberId}&membershipId=${otherId}`,
    "me/agenda?role=merchandiser",
  ])
    assert.equal((await call(path)).status, 400);
  assert.equal(
    (
      await call("field-operations/visits", {
        membershipId: memberId,
        customerId: memberId,
        scheduledAt: visit.scheduled_at,
        companyId: otherId,
      })
    ).status,
    400,
  );
  assert.equal(calls.length, beforeRejected);
});

test("company workday summaries count pending visits only for the corresponding member", () => {
  const day = {
    id: memberId,
    company_id: memberId,
    membership_id: memberId,
    business_date: "2026-10-29",
    role: "commercial" as const,
    completed_visits: 0,
    total_visits: 1,
    status: "active" as const,
    started_at: visit.scheduled_at,
    ended_at: null,
  };
  const selection = planningForDate(
    [visit, { ...visit, id: otherId, membership_id: otherId }],
    [day],
    "2026-10-29",
    "America/Lima",
  );
  assert.equal(selection.pendingDue.length, 2);
  assert.equal(selection.summaries[0].total, 1);
});

test("team contracts retain audit evidence and preserve personal response compatibility", async () => {
  const { sessionSchema, agendaSchema } =
    await import("../src/shared/api/contracts");
  const { teamAgendaSchema } =
    await import("../src/shared/api/field-management");
  assert.ok(
    sessionSchema.safeParse({
      scope: "tenant",
      companyId: memberId,
      membershipId: memberId,
      userId: memberId,
      role: "commercial",
      email: "manager@example.com",
      timeZone: "America/Lima",
      permissions: ["manage_field_operations"],
    }).success,
  );
  assert.ok(agendaSchema.safeParse([visit]).success);
  const audit = {
    hasShelfStock: false,
    noStockReason: "Producto agotado",
    brandDisplay: "inadequate",
    pricesVisible: false,
  };
  const parsed = teamAgendaSchema.parse([
    {
      ...visit,
      audit,
      member_email: "merch@example.com",
      member_role: "merchandiser",
    },
  ]);
  assert.deepEqual(parsed[0].audit, audit);
});
