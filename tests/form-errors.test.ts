import { test } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';
import { ApiError, errorText } from '../src/shared/api/client';
import { resolveFormError } from '../src/shared/lib/form-errors';

test('duplicate conflicts map to their form field without exposing request references', () => {
  const error = new ApiError(409, 'platform_identity_exists', 'Ya existe una cuenta con este correo.', 'technical-id', [{ path: ['manager','email'], code: 'platform_identity_exists', message: 'Account exists.' }]);
  assert.deepEqual(resolveFormError(error, { fields: ['manager.email'] }), {
    fields: { 'manager.email': 'Ya existe una cuenta con este correo.' }, message: '',
  });
  assert.equal(error.requestId, 'technical-id');
  assert.equal(errorText(error), error.message);
  const domain = new ApiError(409, 'platform_hostname_exists', 'Subdominio ocupado.', 'technical-id', [{ path: ['hostname'], code: 'platform_hostname_exists', message: 'Hostname exists.' }]);
  assert.deepEqual(resolveFormError(domain, { fields: ['hostname'] }).fields, { hostname: domain.message });
});

test('nested validation and general failures remain distinct', () => {
  const result = z.object({ manager: z.object({ phone: z.string().min(8) }) }).safeParse({ manager: { phone: '' } });
  assert.equal(result.success, false);
  if (result.success) return;
  assert.deepEqual(Object.keys(resolveFormError(result.error, { fields: ['manager.phone'] }).fields), ['manager.phone']);
  const connection = new ApiError(0, 'connection_lost', 'No se pudo confirmar la operación.');
  assert.deepEqual(resolveFormError(connection, { fields: [] }), { fields: {}, message: connection.message });
});
