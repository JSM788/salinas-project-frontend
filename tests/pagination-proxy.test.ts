import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { createProxy } from "../src/shared/api/proxy";

const companyId = "ce08cf53-561c-44c5-9c24-466f72612c42";
const origin = "http://localhost:3001";

test("platform pagination forwards numeric pages and filters and preserves server totals", async () => {
  const requests: URL[] = [];
  const proxy = createProxy(
    { url: "http://127.0.0.1:3002", timeoutMs: 1000, secure: false },
    async (input) => {
      const url = new URL(String(input));
      requests.push(url);
      return Response.json({ items: [], page: Number(url.searchParams.get("page")), pageSize: 25, total: 206 });
    },
  );
  const get = (path: string, query: string) => proxy(new NextRequest(`${origin}/api/field/${path}?${query}`, {
    headers: { Host: "localhost:3001", Cookie: `field_session=${"a".repeat(43)}` },
  }), path.split("/"));
  const path = `platform/companies/${companyId}/members`;
  const response = await get(path, "page=3&pageSize=25&search=Ana&role=commercial&active=true");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { items: [], page: 3, pageSize: 25, total: 206 });
  assert.equal(requests[0].searchParams.get("page"), "3");
  assert.equal(requests[0].searchParams.get("search"), "Ana");
  assert.equal(requests[0].searchParams.get("role"), "commercial");
  assert.equal(requests[0].searchParams.get("active"), "true");
  const companies = await get("platform/companies", "page=2&status=suspended");
  assert.equal(companies.status, 200);
  assert.equal(requests[1].searchParams.get("status"), "suspended");
  assert.equal(requests[1].searchParams.get("pageSize"), "25");
  const count = requests.length;
  for (const query of ["page=0", "pageSize=101", "page=1&page=2", "companyId=other", "role=owner"]) {
    assert.equal((await get(path, query)).status, 400);
  }
  assert.equal(requests.length, count);
});
