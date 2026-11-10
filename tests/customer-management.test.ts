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
};
const customer = {
  id,
  name: "Cliente de prueba",
  address: "Dirección de prueba",
  ruc: "20123456789",
  district: "San Borja",
  zone: "Lima",
  condition: null,
  lastPurchaseDate: null,
  assignments: [],
};

test("customer management forwards validated reads, creation and assignment without weakening existing route restrictions", async () => {
  const calls: { url: string; body: unknown }[] = [];
  const proxy = createProxy(
    { url: "http://127.0.0.1:3002", timeoutMs: 1000, secure: false },
    async (url, init) => {
      const path = String(url);
      calls.push({
        url: path,
        body: init?.body ? JSON.parse(String(init.body)) : undefined,
      });
      if (path.endsWith("/assignees"))
        return Response.json({
          items: [{ id, email: "field@example.com", role: "commercial" }],
          total: 1,
          page: 1,
          pageSize: 25,
          totalPages: 1,
        });
      if (path.endsWith("/assignments")) return Response.json({ updated: 1 });
      if (path.endsWith("/import")) return Response.json({ imported: 1, skipped: 0 });
      return Response.json(
        init?.method === "POST"
          ? customer
          : { items: [customer], total: 1, page: 1, pageSize: 25, totalPages: 1 },
      );
    },
  );
  const call = (path: string, body?: unknown, requestOrigin = origin) =>
    proxy(
      new NextRequest(`${origin}/api/field/${path}`, {
        method: body === undefined ? "GET" : "POST",
        headers: { ...headers, Origin: requestOrigin },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
      path.split("/"),
    );
  assert.equal((await call("customers")).status, 200);
  assert.equal((await call("customers/assignees")).status, 200);
  const input = {
    name: customer.name,
    address: customer.address,
    ruc: customer.ruc,
    district: customer.district,
    zone: customer.zone,
    commercialMembershipId: id,
    merchandiserMembershipId: id,
  };
  assert.equal((await call("customers", input)).status, 200);
  assert.deepEqual(calls.at(-1)?.body, input);
  assert.equal(
    (
      await call("customers/import", {
        items: [
          {
            name: customer.name,
            address: customer.address,
            ruc: customer.ruc,
            district: customer.district,
            zone: customer.zone,
          },
        ],
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await call("customers/assignments", {
        customerIds: [id],
        membershipId: id,
      })
    ).status,
    200,
  );
  const count = calls.length;
  assert.equal(
    (await call("customers", { ...input, companyId: id })).status,
    400,
  );
  assert.equal(
    (
      await call("customers/assignments", {
        customerIds: [id],
        membershipId: "invalid",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await call("customers/assignments", {
        customerIds: [id, id],
        membershipId: id,
      })
    ).status,
    400,
  );
  assert.equal(
    (await call("customers", input, "http://foreign.example")).status,
    403,
  );
  assert.equal((await call("customers/delete", {})).status, 404);
  assert.equal(calls.length, count);
});

test("portfolio filtering combines real RUC, district, assignee and zone without fabricating missing finance", async () => {
  const { filterCustomers, emptyCustomerFilters } =
    await import("../src/modules/comercial/clientes/lib/customer-filters");
  const assigned = {
    ...customer,
    assignments: [
      {
        membershipId: id,
        email: "field@example.com",
        role: "commercial" as const,
      },
    ],
  };
  const other = {
    ...customer,
    id: "e647e500-5b50-40d1-a000-11644c2b38c8",
    name: "Otro",
    district: "Surco",
    zone: "Sur",
  };
  assert.deepEqual(
    filterCustomers([assigned, other], {
      ...emptyCustomerFilters,
      search: "20123456789",
      district: "San Borja",
      assigneeId: id,
      zone: "Lima",
    }),
    [assigned],
  );
  assert.deepEqual(
    filterCustomers([assigned], {
      ...emptyCustomerFilters,
      condition: "Al día",
    }),
    [],
  );
  assert.deepEqual(
    filterCustomers([assigned], {
      ...emptyCustomerFilters,
      lastPurchase: "7_days",
    }),
    [],
  );
  assert.deepEqual(filterCustomers([assigned], emptyCustomerFilters), [
    assigned,
  ]);
});
