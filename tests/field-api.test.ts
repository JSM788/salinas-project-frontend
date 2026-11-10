import {test} from 'node:test';
import assert from 'node:assert/strict';
import {NextRequest} from 'next/server';
import {createProxy} from '../src/shared/api/proxy';

const origin='http://localhost:3001';
const sessionToken='a'.repeat(43);
test('login keeps token only in a protected cookie; requests require same-origin and explicit routes',async()=>{
  const requests:RequestInit[]=[];
  const proxy=createProxy({url:'http://127.0.0.1:3002',timeoutMs:1000,secure:false},async(_url,init)=>{
    requests.push(init!);
    return Response.json({token:sessionToken,expiresAt:new Date(Date.now()+3600000).toISOString()});
  });
  const req=new NextRequest(origin+'/api/field/auth/login',{method:'POST',headers:{Host:'localhost:3001',Origin:origin,'Content-Type':'application/json','X-Tenant-Host':'evil.example','X-Forwarded-Host':'evil.example'},body:JSON.stringify({email:'user@example.com',password:'long-password-123'})});
  const res=await proxy(req,['auth','login']);
  assert.equal(res.status,200);
  assert.deepEqual(await res.json(),{authenticated:true});
  const cookie=res.headers.get('set-cookie')!;
  assert.match(cookie,/HttpOnly/i); assert.match(cookie,/SameSite=strict/i);
  assert.ok(!JSON.stringify(requests).includes('Authorization'));
  assert.equal(new Headers(requests[0].headers).get('X-Tenant-Host'),'localhost');
  assert.deepEqual(JSON.parse(requests[0].body as string),{email:'user@example.com',password:'long-password-123'});
  const injected=new NextRequest(origin+'/api/field/auth/login',{method:'POST',headers:{Host:'localhost:3001',Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({company:'alpha',email:'user@example.com',password:'long-password-123'})});
  assert.equal((await proxy(injected,['auth','login'])).status,400);
  assert.equal((await proxy(new NextRequest(origin+'/api/field/me',{headers:{Host:'localhost:3001'}}),['me'])).status,401);
  assert.equal((await proxy(new NextRequest(origin+'/api/field/me/workdays/start',{method:'POST',headers:{Host:'localhost:3001',Origin:'https://evil.example',Cookie:`field_session=${sessionToken}`},body:'{}'}),['me','workdays','start'])).status,403);
  assert.equal((await proxy(new NextRequest(origin+'/api/field/finanzas',{headers:{Host:'localhost:3001'}}),['finanzas'])).status,404);
  const domainLogin=new NextRequest(origin+'/api/field/auth/login',{method:'POST',headers:{Host:'aquamundo.example',Origin:'http://aquamundo.example','Content-Type':'application/json','X-Forwarded-Host':'evil.example'},body:JSON.stringify({email:'user@example.com',password:'long-password-123'})});
  assert.equal((await proxy(domainLogin,['auth','login'])).status,200);
  assert.equal(new Headers(requests[1].headers).get('X-Tenant-Host'),'aquamundo.example');
  assert.equal((await proxy(new NextRequest(origin+'/api/field/me'),['me'])).status,400);
});

test('proxy forwards session and key, validates contract and reports upstream failures without fake data',async()=>{
  let seen:RequestInit|undefined;
  const req=()=>new NextRequest(origin+'/api/field/me/workdays/start',{method:'POST',headers:{Host:'localhost:3001',Origin:origin,'Content-Type':'application/json',Cookie:`field_session=${sessionToken}`,'Idempotency-Key':'same-operation'},body:'{}'});
  const proxy=createProxy({url:'http://127.0.0.1:3002',timeoutMs:1000,secure:false},async(_url,init)=>{seen=init;return Response.json({code:'visits_remaining',message:'Complete visits',requestId:'backend-request'},{status:409});});
  const response=await proxy(req(),['me','workdays','start']);
  assert.equal(response.status,409);
  assert.equal((await response.json()).requestId,'backend-request');
  assert.equal(new Headers(seen?.headers).get('Authorization'),`Bearer ${sessionToken}`);
  assert.equal(new Headers(seen?.headers).get('Idempotency-Key'),'same-operation');
  assert.equal(new Headers(seen?.headers).get('X-Tenant-Host'),'localhost');
  const down=createProxy({url:'http://127.0.0.1:3002',timeoutMs:1000,secure:false},async()=>{throw new Error('secret upstream detail');});
  const failed=await down(req(),['me','workdays','start']);
  assert.equal(failed.status,502); assert.ok(!JSON.stringify(await failed.json()).includes('secret'));
});
