import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { createProxy } from '../src/shared/api/proxy';
import { apiRequest, ApiError, errorText } from '../src/shared/api/client';
import { resolveFormError } from '../src/shared/lib/form-errors';
import { z } from 'zod';

test('proxy preserves multiple structured field failures and trace identity', async () => {
  const details = [
    { path: ['manager', 'email'], code: 'duplicate', message: 'Email exists.' },
    { path: ['manager', 'phone'], code: 'invalid_format', message: 'Invalid phone.' },
  ];
  const proxy = createProxy({ url: 'http://127.0.0.1:3002', timeoutMs: 1000, secure: false }, async () => Response.json({ code: 'invalid_request', message: 'Invalid input.', requestId: 'trace-id', details }, { status: 400 }));
  const response = await proxy(new NextRequest('http://localhost:3001/api/field/team/members', { headers: { Host: 'localhost:3001', Cookie: `field_session=${'a'.repeat(43)}` } }), ['team', 'members']);
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.deepEqual(body.details, details);
  assert.equal(body.requestId, 'trace-id');
});

test('client preserves field paths and one adapter maps aliases without guessing message text', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => Response.json({ code: 'platform_identity_exists', message: 'Account exists.', requestId: 'trace-id', details: [{ path: ['manager', 'email'], code: 'duplicate', message: 'Different wording.' }] }, { status: 409 });
    let failure: unknown;
    try { await apiRequest('/platform/companies', z.unknown(), { body: {} }); } catch (error) { failure = error; }
    assert.ok(failure instanceof ApiError);
    assert.equal(failure.requestId, 'trace-id');
    assert.deepEqual(failure.details?.[0].path, ['manager', 'email']);
    const result = resolveFormError(failure, { fields: ['managerEmail'], aliases: { 'manager.email': 'managerEmail' } });
    assert.equal(result.fields.managerEmail, errorText(failure));
    assert.equal(result.message, '');
    assert.equal(JSON.stringify(result).includes('trace-id'), false);
    assert.deepEqual(resolveFormError(new ApiError(409, 'conflict', 'Revisa la operación.'), { fields: ['email'] }), { fields: {}, message: 'Revisa la operación.' });
  } finally { globalThis.fetch = originalFetch; }
});

test('multiple validation errors render only registered fields and unknown paths keep a visible fallback', () => {
  const failure = new ApiError(400, 'invalid_request', 'Revisa los datos.', undefined, [
    { path: ['email'], code: 'invalid_format', message: 'Raw technical text.' },
    { path: ['phone'], code: 'invalid_format', message: 'Raw technical text.' },
    { path: ['unknown'], code: 'custom', message: 'Raw technical text.' },
  ]);
  const result = resolveFormError(failure, { fields: ['email', 'phone'] });
  assert.deepEqual(Object.keys(result.fields), ['email', 'phone']);
  assert.equal(result.message, failure.message);
  const duplicate = resolveFormError(new ApiError(409, 'conflict', 'General conflict.', undefined, [{ path: ['ruc'], code: 'duplicate', message: 'Technical constraint.' }]), { fields: ['ruc'] });
  assert.equal(duplicate.fields.ruc, 'Este valor ya está registrado. Ingresa otro.');
  assert.equal(duplicate.message, '');
  assert.equal(JSON.stringify(result).includes('Raw technical'), false);
  const parsed = z.object({ name: z.string().min(1), phone: z.string().min(1) }).safeParse({ name: '', phone: '' });
  assert.equal(parsed.success, false);
  if (!parsed.success) assert.deepEqual(Object.keys(resolveFormError(parsed.error, { fields: ['name', 'phone'] }).fields), ['name', 'phone']);
});

test('proxy validation failures also expose field details and never call the backend', async () => {
  let called = false;
  const proxy = createProxy({ url: 'http://127.0.0.1:3002', timeoutMs: 1000, secure: false }, async () => { called = true; return Response.json({}); });
  const response = await proxy(new NextRequest('http://localhost:3001/api/field/platform/companies', { method: 'POST', headers: { Host: 'localhost:3001', Origin: 'http://localhost:3001', 'Content-Type': 'application/json', Cookie: `field_session=${'a'.repeat(43)}` }, body: JSON.stringify({}) }), ['platform', 'companies']);
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.ok(body.details.some((issue: { path: string[] }) => issue.path.join('.') === 'name'));
  assert.equal(called, false);
});
