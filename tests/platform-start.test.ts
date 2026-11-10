import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { createProxy } from "../src/shared/api/proxy";
import { sessionSchema } from "../src/shared/api/contracts";
import {
  canAccessRoute,
  canReadTeam,
  landingRoute,
  initialCompanyId,
} from "../src/shared/api/platform";

const id = "ce08cf53-561c-44c5-9c24-466f72612c42";
const origin = "http://localhost:3001";
const company = {
  id,
  name: "Company",
  slug: "company",
  status: "active" as const,
  suspendedAt: null,
  timeZone: "America/Lima",
  hostnames: ["company.localhost"],
  managerEmail: null,
  activeUserCount: 1,
  totalUserCount: 1,
};
const member = {
  id,
  userId: id,
  companyId: id,
  displayName: "Ana",
  phone: "+51999111222",
  email: "ana@example.com",
  role: "manager",
  active: true,
  isPlatformOwner: false,
};
const headers = {
  Host: "localhost:3001",
  Origin: origin,
  "Content-Type": "application/json",
  Cookie: `field_session=${"a".repeat(43)}`,
  "Idempotency-Key": "platform-start-test",
};

test("owner routes validate creation and preserve tenant and secret boundaries", async () => {
  const calls: { url: string; body: unknown }[] = [];
  const proxy = createProxy(
    { url: "http://127.0.0.1:3002", timeoutMs: 1000, secure: false },
    async (url, init) => {
      calls.push({
        url: String(url),
        body: init?.body ? JSON.parse(String(init.body)) : undefined,
      });
      const protectedMember = {
        ...member,
        passwordHash: "must-not-leave-the-server",
      };
      return Response.json(
        String(url).endsWith("companies")
          ? init?.method === "POST"
            ? company
            : [company]
          : init?.method === "POST"
            ? protectedMember
            : [protectedMember],
      );
    },
  );
  const call = (path: string, body?: unknown, customHeaders = headers) =>
    proxy(
      new NextRequest(`${origin}/api/field/${path}`, {
        method: body === undefined ? "GET" : "POST",
        headers: customHeaders,
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
      path.split("?")[0].split("/"),
    );
  assert.equal((await call("platform/companies")).status, 200);
  assert.equal(
    (
      await call("platform/companies", {
        name: company.name,
        timeZone: company.timeZone,
        hostname: company.hostnames[0],
      })
    ).status,
    200,
  );
  const input = {
    displayName: member.displayName,
    phone: member.phone,
    email: member.email,
    password: "test-password-only",
    role: "manager",
  };
  const created = await call(`platform/companies/${id}/members`, input);
  assert.equal(created.status, 200);
  assert.equal("passwordHash" in (await created.json()), false);
  assert.deepEqual(calls.at(-1)?.body, input);
  assert.equal(
    (
      await call(`platform/companies/${id}/members/${id}/status`, {
        active: false,
      })
    ).status,
    200,
  );
  const details = {
    displayName: "Ana Updated",
    phone: member.phone,
    email: "ANA@example.com",
    role: "commercial",
  };
  const edited = await call(
    `platform/companies/${id}/members/${id}/details`,
    details,
  );
  assert.equal(edited.status, 200);
  assert.deepEqual(calls.at(-1)?.body, {
    ...details,
    email: "ana@example.com",
  });
  assert.equal("passwordHash" in (await edited.json()), false);
  const passwordChange = await call(
    `platform/companies/${id}/members/${id}/details`,
    { ...details, password: "replacement-password" },
  );
  assert.equal(passwordChange.status, 200);
  assert.equal("password" in (await passwordChange.json()), false);
  assert.equal(
    (calls.at(-1)?.body as { password: string }).password,
    "replacement-password",
  );
  const editsBefore = calls.length;
  assert.equal(
    (
      await call(`platform/companies/${id}/members/${id}/details`, {
        ...details,
        password: "short",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await call(`platform/companies/${id}/members/${id}/details`, {
        ...details,
        companyId: id,
      })
    ).status,
    400,
  );
  assert.equal(calls.length, editsBefore);
  const teamResponse = await call("team/members");
  assert.equal(teamResponse.status, 200);
  const teamRows = await teamResponse.json();
  assert.equal("isPlatformOwner" in teamRows[0], false);
  assert.equal("passwordHash" in teamRows[0], false);
  const before = calls.length;
  assert.equal(
    (
      await call(`platform/companies/${id}/members`, {
        ...input,
        isPlatformOwner: true,
      })
    ).status,
    400,
  );
  assert.equal(
    (await call("platform/companies?companyId=foreign")).status,
    400,
  );
  assert.equal(
    (await call("platform/companies/not-a-uuid/members")).status,
    404,
  );
  assert.equal(
    (
      await call(`platform/companies/${id}/members`, input, {
        ...headers,
        Origin: "https://foreign.example",
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await call(`platform/companies/${id}/members`, input, {
        ...headers,
        "Idempotency-Key": "",
      })
    ).status,
    400,
  );
  assert.equal(calls.length, before);
});

test("recognized manager and owner sessions retain their explicit roles and permissions", () => {
  const base = {
    scope: "tenant" as const,
    companyId: id,
    membershipId: id,
    userId: id,
    email: "owner@example.com",
    timeZone: "America/Lima",
  };
  assert.equal(
    sessionSchema.parse({
      ...base,
      role: "manager",
      permissions: ["manage_customers", "manage_field_operations"],
    }).role,
    "manager",
  );
  assert.equal(
    sessionSchema.parse({
      ...base,
      role: "commercial",
      permissions: ["manage_platform"],
    }).scope,
    "tenant",
  );
  assert.equal(
    sessionSchema.parse({ ...base, role: "merchandiser", permissions: [] })
      .role,
    "merchandiser",
  );
});

test("owner landing and navigation do not grant company users global access", () => {
  const base = {
    scope: "tenant" as const,
    companyId: id,
    membershipId: id,
    userId: id,
    email: "owner@example.com",
    timeZone: "America/Lima",
  };
  const owner = sessionSchema.parse({
    ...base,
    scope: "platform",
    companyId: null,
    membershipId: null,
    timeZone: null,
    role: "platform_owner",
    permissions: ["manage_platform"],
  });
  const manager = sessionSchema.parse({
    ...base,
    role: "manager",
    permissions: ["manage_field_operations", "manage_customers"],
  });
  const field = sessionSchema.parse({
    ...base,
    role: "merchandiser",
    permissions: [],
  });
  assert.equal(landingRoute(owner), "/admin/companies/");
  assert.equal(landingRoute(manager), "/customers/");
  assert.equal(landingRoute(field), "/login/");
  for (const path of ["/admin/companies", "/admin/users"]) {
    assert.equal(canAccessRoute(owner, path), true);
    assert.equal(canAccessRoute(manager, path), false);
    assert.equal(canAccessRoute(field, path), false);
  }
  assert.equal(canAccessRoute(owner, "/admin/unknown"), false);
  assert.equal(canAccessRoute(owner, "/team"), false);
  assert.equal(canAccessRoute(owner, "/customers"), false);
  assert.equal(canAccessRoute(manager, "/team"), true);
  assert.equal(canReadTeam(field), false);
  assert.equal(canAccessRoute(field, "/customers"), false);
  assert.equal(canAccessRoute(field, "/visits"), false);
  assert.equal(initialCompanyId([company], company.id, "missing-company"), "");
  assert.equal(initialCompanyId([company], company.id, null), company.id);
  assert.equal(
    initialCompanyId([company], "other-company", company.id),
    company.id,
  );
  assert.equal(initialCompanyId([company], "other-company", null), "");
  assert.equal(initialCompanyId([company], company.id, ""), "");
});
