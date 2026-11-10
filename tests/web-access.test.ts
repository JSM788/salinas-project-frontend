import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { createProxy } from '../src/shared/api/proxy';
import { canAccessRoute } from '../src/shared/api/platform';
import type { Session } from '../src/shared/api/contracts';

const origin='http://localhost:3001';
const id='ce08cf53-561c-44c5-9c24-466f72612c42';
test('web navigation uses an explicit allowlist of supported management roles',()=>{
  const tenant={scope:'tenant',companyId:id,membershipId:id,userId:id,email:'user@example.com',timeZone:'America/Lima',permissions:[]} as const;
  for(const role of ['commercial','merchandiser'] as const) assert.equal(canAccessRoute({...tenant,permissions:[],role},'/visits'),false);
  assert.equal(canAccessRoute({...tenant,permissions:[],role:'manager'},'/visits'),true);
  assert.equal(canAccessRoute({...tenant,permissions:[],role:'manager'},'/admin/companies'),false);
});
test('BFF uses the protected web login and supplies its channel without trusting caller headers',async()=>{
  let seenUrl='', channel='';
  const proxy=createProxy({url:'http://127.0.0.1:3002',timeoutMs:1000,secure:false},async(url,init)=>{
    seenUrl=String(url);channel=new Headers(init?.headers).get('X-Client-Channel')??'';
    return Response.json({token:'a'.repeat(43),expiresAt:'2099-01-01T00:00:00Z'});
  });
  const response=await proxy(new NextRequest(origin+'/api/field/auth/login',{method:'POST',headers:{Host:'localhost:3001',Origin:origin,'Content-Type':'application/json','X-Client-Channel':'native'},body:JSON.stringify({email:'manager@example.com',password:'long-test-password'})}),['auth','login']);
  assert.equal(response.status,200);
  assert.ok(seenUrl.endsWith('/v1/auth/web/login'));
  assert.equal(channel,'web');
});
test('BFF removes an old browser cookie when the role is no longer allowed',async()=>{
  const proxy=createProxy({url:'http://127.0.0.1:3002',timeoutMs:1000,secure:false},async()=>Response.json({code:'web_access_denied',message:'Use mobile',requestId:'reference'},{status:403}));
  const response=await proxy(new NextRequest(origin+'/api/field/me',{headers:{Host:'localhost:3001',Cookie:`field_session=${'a'.repeat(43)}`}}),['me']);
  assert.equal(response.status,403);
  assert.match(response.headers.get('set-cookie')??'',/Max-Age=0/);
});
