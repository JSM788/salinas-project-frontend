import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { createProxy } from '../src/shared/api/proxy';

test('team profile proxy normalizes phone and rejects role or invalid phones before forwarding', async () => {
  const id = 'ce08cf53-561c-44c5-9c24-466f72612c42';
  const calls: unknown[] = [];
  const proxy = createProxy({ url: 'http://127.0.0.1:3002', timeoutMs: 1000, secure: false }, async (_url, init) => {
    calls.push(JSON.parse(String(init?.body)));
    return Response.json({ id, userId: id, companyId: id, displayName: 'Ana', email: 'ana@example.com', phone: '+51999111222', role: 'commercial', active: true, activatedAt: null, passwordChangedAt: null, invitationStatus: 'pending', deliveryStatus: 'pending' });
  });
  const request = (body: unknown) => proxy(new NextRequest(`http://localhost:3001/api/field/team/members/${id}/details`, { method: 'POST', headers: { Host: 'localhost:3001', Origin: 'http://localhost:3001', 'Content-Type': 'application/json', Cookie: `field_session=${'a'.repeat(43)}`, 'Idempotency-Key': 'team-profile-test' }, body: JSON.stringify(body) }), ['team', 'members', id, 'details']);
  const input = { displayName: 'Ana', email: 'ana@example.com', phone: '+51 999 111 222' };
  assert.equal((await request({ ...input, role: 'manager' })).status, 400);
  assert.equal((await request({ ...input, phone: '999111222' })).status, 400);
  assert.equal(calls.length, 0);
  assert.equal((await request(input)).status, 200);
  assert.deepEqual(calls, [{ ...input, phone: '+51999111222' }]);
});
