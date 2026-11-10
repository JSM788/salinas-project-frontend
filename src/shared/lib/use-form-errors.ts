"use client";
import { useState } from 'react';
import type { z } from 'zod';
import { resolveFormError, type FieldErrors, type FormErrorOptions } from './form-errors';

export function useFormErrors(options: FormErrorOptions) {
  const [fields, setFields] = useState<FieldErrors>({});
  const [error, setError] = useState('');
  const reset = () => { setFields({}); setError(''); };
  const handle = (cause: unknown) => {
    const result = resolveFormError(cause, options);
    setFields(result.fields); setError(result.message);
  };
  const clear = (field?: string) => {
    if (!field) { reset(); return; }
    setFields(current => { const next = { ...current }; delete next[field]; return next; });
    setError('');
  };
  const validate = <T,>(schema: z.ZodType<T>, values: unknown): T | undefined => {
    reset();
    const result = schema.safeParse(values);
    if (!result.success) { handle(result.error); return undefined; }
    return result.data;
  };
  const setFieldError = (field: string, message: string) => {
    if (options.fields.includes(field)) setFields(current => ({ ...current, [field]: message }));
    else setError(message);
  };
  return { fields, error, reset, clear, handle, validate, setFieldError, setError };
}
