import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { createProxy } from "../src/shared/api/proxy";
import { accessActionLabel,accessEventLabel } from "../src/shared/api/access-history";

const id = "ce08cf53-561c-44c5-9c24-466f72612c42";
const cookie = `field_session=${"a".repeat(43)}`;

test("one mail action distinguishes pending activation from recovery without duplicating buttons",()=>{
  assert.equal(accessActionLabel("pending"),"Reenviar invitación");
  assert.equal(accessActionLabel("expired"),"Reenviar invitación");
  assert.equal(accessActionLabel("accepted"),"Enviar enlace de recuperación");
  assert.equal(accessEventLabel("invitation_issued","password_reset"),"Recuperación de contraseña solicitada");
  assert.equal(accessEventLabel("account_activated"),"Cuenta activada");
});

test("generic local access uses session identity while custom company domains remain constrained", async () => {
  const hosts: (string | null)[] = [];
  const proxy = createProxy({url:"http://127.0.0.1:3002",timeoutMs:1000,secure:false}, async (_input, init) => {
    hosts.push(new Headers(init?.headers).get("X-Tenant-Host"));
    return Response.json({items:[],page:1,pageSize:25,total:0});
  });
  for (const host of ["localhost:3001","127.0.0.1:3001","company.example"]) {
    const result = await proxy(new NextRequest(`http://${host}/api/field/team/members`, {headers:{Host:host,Cookie:cookie}}), ["team","members"]);
    assert.equal(result.status, 200);
  }
  assert.deepEqual(hosts, [null,null,"company.example"]);
});

test("access history preserves dated events through the scoped and paginated BFF routes", async () => {
  const item = {id,occurredAt:"2026-11-02T10:00:00.000Z",event:"activation_completed",outcome:"success",actorUserId:null,details:null};
  const seen:string[]=[];
  const proxy=createProxy({url:"http://127.0.0.1:3002",timeoutMs:1000,secure:false}, async input=>{
    seen.push(String(input));return Response.json({items:[item],page:2,pageSize:25,total:26});
  });
  for (const path of [`team/members/${id}/access-history`,`platform/companies/${id}/members/${id}/access-history`]) {
    const result=await proxy(new NextRequest(`http://localhost:3001/api/field/${path}?page=2`,{headers:{Host:"localhost:3001",Cookie:cookie}}),path.split("/"));
    assert.equal(result.status,200);
    const page=await result.json();assert.equal(page.items[0].event,"activation_completed");assert.equal(page.total,26);
  }
  assert.ok(seen.every(path=>new URL(path).searchParams.get("page")==="2"));
});
