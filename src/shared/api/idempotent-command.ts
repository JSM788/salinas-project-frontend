import { ApiError } from './client';

/** Keep a key only while the mutation result is uncertain, never while refreshing its read model. */
export async function runIdempotentCommand<T>(
  pending: Map<string, string>,
  fingerprint: string,
  request: (key: string) => Promise<T>,
): Promise<T> {
  const key = pending.get(fingerprint) ?? crypto.randomUUID();
  pending.set(fingerprint, key);
  try {
    const result = await request(key);
    pending.delete(fingerprint);
    return result;
  } catch (error) {
    if (error instanceof ApiError && error.status >= 400 && error.status < 500) pending.delete(fingerprint);
    throw error;
  }
}
