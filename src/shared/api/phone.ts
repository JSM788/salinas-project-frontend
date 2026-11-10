import { z } from 'zod';

export const phoneSchema = z.string().trim().max(40)
  .transform(value => value.replace(/[\s()-]/g, ''))
  .pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, 'Ingresa un teléfono con código de país, por ejemplo +51999111222.'));
