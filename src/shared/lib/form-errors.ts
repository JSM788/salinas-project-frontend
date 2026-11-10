import { z } from 'zod';
import { ApiError, errorText } from '@/shared/api/client';

export type FieldErrors = Record<string, string>;
export interface FormErrorOptions { fields: readonly string[]; aliases?: Record<string, string> }
const validationMessages: Record<string, string> = {
  invalid_type: 'Completa este campo con un valor válido.',
  invalid_format: 'Revisa el formato de este campo.',
  too_small: 'Este campo es obligatorio.',
  too_big: 'Este valor supera el límite permitido.',
  invalid_value: 'Selecciona una opción válida.',
  custom: 'Revisa el valor de este campo.',
};

export function resolveFormError(cause: unknown, options: FormErrorOptions): { fields: FieldErrors; message: string } {
  const local = cause instanceof z.ZodError;
  const details = local ? cause.issues.map(issue => ({ path: issue.path, code: issue.code })) : cause instanceof ApiError ? cause.details : undefined;
  const fields: FieldErrors = {};
  let unmatched = false;
  for (const issue of details ?? []) {
    const path = issue.path.map(String).join('.');
    const field = options.aliases?.[path] ?? path;
    if (!options.fields.includes(field)) { unmatched = true; continue; }
    const business = !local && cause instanceof ApiError && !['invalid_request', 'invalid_audit', 'invalid_evidence'].includes(cause.code);
    const duplicate = !local && cause instanceof ApiError && cause.code === 'conflict' && issue.code === 'duplicate';
    if (!Object.hasOwn(fields, field)) fields[field] = duplicate ? 'Este valor ya está registrado. Ingresa otro.' : business ? errorText(cause) : validationMessages[issue.code ?? ''] ?? 'Revisa este campo.';
  }
  const message = Object.keys(fields).length && !unmatched ? '' : local ? 'Revisa los datos ingresados.' : errorText(cause);
  return { fields, message };
}
