import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { createProxy } from "../src/shared/api/proxy";

const id = "ce08cf53-561c-44c5-9c24-466f72612c42";
const origin = "http://localhost:3001";
const headers = {
  Host: "localhost:3001",
  Origin: origin,
  "Content-Type": "application/json",
  Cookie: `field_session=${"a".repeat(43)}`,
  "Idempotency-Key": "schedule-1",
};
test("web planning forwards validated scheduling and reads protected workdays and evidence", async () => {
  let seen: RequestInit | undefined;
  const proxy = createProxy(
    { url: "http://127.0.0.1:3002", timeoutMs: 1000, secure: false },
    async (url, init) => {
      seen = init;
      if (String(url).endsWith("/evidence")) return Response.json(null);
      if (String(url).endsWith("/workdays")) return Response.json([]);
      return Response.json({
        id,
        company_id: id,
        membership_id: id,
        customer_id: id,
        scheduled_at: "2026-10-25T14:00:00.000Z",
        workday_id: null,
        status: "pending",
        arrived_at: null,
        ended_at: null,
        result: null,
        observations: null,
      });
    },
  );
  const input = { customerId: id, scheduledAt: "2026-10-25T14:00:00.000Z" };
  const schedule = (body: unknown) =>
    new NextRequest(origin + "/api/field/me/visits", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  assert.equal((await proxy(schedule(input), ["me", "visits"])).status, 200);
  assert.deepEqual(JSON.parse(seen!.body as string), input);
  assert.equal(new Headers(seen!.headers).get("Idempotency-Key"), "schedule-1");
  assert.equal(
    (await proxy(schedule({ ...input, membershipId: id }), ["me", "visits"]))
      .status,
    400,
  );
  assert.equal(
    (
      await proxy(
        new NextRequest(origin + "/api/field/me/workdays", { headers }),
        ["me", "workdays"],
      )
    ).status,
    200,
  );
  const evidence = await proxy(
    new NextRequest(origin + `/api/field/me/visits/${id}/evidence`, {
      headers,
    }),
    ["me", "visits", id, "evidence"],
  );
  assert.equal(evidence.status, 200);
  assert.equal(await evidence.json(), null);
});
