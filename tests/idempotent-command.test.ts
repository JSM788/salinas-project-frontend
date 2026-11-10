import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runIdempotentCommand } from '../src/shared/api/idempotent-command';
import { ApiError } from '../src/shared/api/client';

test('accepted mutation followed by failed refresh cannot reuse a previous workday receipt', async () => {
  const pending = new Map<string, string>();
  const keys: string[] = [];
  await assert.rejects(async () => {
    await runIdempotentCommand(pending, 'start-workday', async key => { keys.push(key); return { id: 'previous-day' }; });
    throw new Error('Read-model refresh failed after confirmed mutation');
  });
  await runIdempotentCommand(pending, 'start-workday', async key => { keys.push(key); return { id: 'next-day' }; });
  assert.notEqual(keys[0], keys[1]);
  assert.equal(pending.size, 0);
});

test('uncertain mutation retries preserve their key; explicit rejections release it', async () => {
  const pending = new Map<string, string>();
  const keys: string[] = [];
  await assert.rejects(runIdempotentCommand(pending, 'arrive', async key => {
    keys.push(key); throw new ApiError(0, 'connection_lost', 'Unknown outcome');
  }));
  await runIdempotentCommand(pending, 'arrive', async key => { keys.push(key); return { id: 'visit' }; });
  assert.equal(keys[0], keys[1]);
  await assert.rejects(runIdempotentCommand(pending, 'end', async () => { throw new ApiError(409, 'visits_remaining', 'Rejected'); }));
  assert.equal(pending.size, 0);
});
