import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { createProxy } from "../src/shared/api/proxy";

const token = "i".repeat(43);
const origin = "http://localhost:3001";
const companyId = "ce08cf53-561c-44c5-9c24-466f72612c42";

test("web invitation is public, validates passwords and forwards acceptance only in POST body", async () => {
  const calls: { url: string; init?: RequestInit }[] = [];
  const metadata = { companyId, companyName: "Invited company", tenantHost: "invited.example", email: "user@example.com", role: "commercial", purpose:"activation", expiresAt: "2099-01-01T00:00:00.000Z" };
  const accepted = { companyId, tenantHost: metadata.tenantHost, email: metadata.email, purpose:"activation" };
  const proxy = createProxy({url:"http://127.0.0.1:3002",timeoutMs:1000,secure:false}, async (input, init) => {
    const url = String(input);
    calls.push({url,init});
    return Response.json(url.endsWith("/accept") ? accepted : metadata);
  });
  const path = `invitations/${token}`;
  const request = (body?: unknown) => new NextRequest(`${origin}/api/field/${path}${body === undefined ? "" : "/accept"}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {Host:"localhost:3001",Origin:origin,"Content-Type":"application/json"},
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = await proxy(request(), path.split("/"));
  assert.equal(result.status, 200);
  assert.deepEqual(await result.json(), metadata);
  const response = await proxy(request({password:"chosen-password"}), [...path.split("/"), "accept"]);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), accepted);
  assert.deepEqual(JSON.parse(String(calls[1].init?.body)), {password:"chosen-password"});
  assert.equal(calls[1].url.includes("chosen-password"), false);
  assert.equal(new Headers(calls[1].init?.headers).has("Authorization"), false);
  const count = calls.length;
  for (const body of [{password:"short"},{password:"chosen-password",companyId}]) {
    assert.equal((await proxy(request(body), [...path.split("/"),"accept"])).status, 400);
  }
  assert.equal(calls.length, count);
});

test("web invitation preserves expired-link errors from the backend", async () => {
  const proxy = createProxy({url:"http://127.0.0.1:3002",timeoutMs:1000,secure:false}, async () => Response.json({code:"invitation_expired",message:"Invitation expired",requestId:"reference"},{status:410}));
  const response = await proxy(new NextRequest(`${origin}/api/field/invitations/${token}`, {headers:{Host:"localhost:3001"}}), ["invitations",token]);
  assert.equal(response.status, 410);
  assert.equal((await response.json()).code, "invitation_expired");
});

test("recovery preserves activated membership state and accepts password-reset purpose", async () => {
  const path=`team/members/${companyId}/invitation`;
  const proxy=createProxy({url:"http://127.0.0.1:3002",timeoutMs:1000,secure:false},async()=>Response.json({id:companyId,invitationStatus:"accepted",deliveryStatus:"pending"}));
  const result=await proxy(new NextRequest(`${origin}/api/field/${path}`,{method:"POST",headers:{Host:"localhost:3001",Origin:origin,Cookie:`field_session=${"a".repeat(43)}`,"Content-Type":"application/json","Idempotency-Key":"reset-1"},body:"{}"}),path.split("/"));
  assert.equal(result.status,200);
  assert.equal((await result.json()).invitationStatus,"accepted");
});
