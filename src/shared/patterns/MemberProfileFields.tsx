"use client";
import { Input } from '@/shared/components/ui/input';
import { FieldError } from '@/shared/components/ui/field-error';
import { useId } from 'react';

export interface MemberProfile { displayName: string; email: string; phone: string }
export function MemberProfileFields({ value, onChange, disabled = false, errors = {} }: {
  value: MemberProfile;
  onChange: (field: keyof MemberProfile, value: string) => void;
  disabled?: boolean;
  errors?: Partial<Record<keyof MemberProfile, string>>;
}) {
  const id = useId();
  return <>
    <label className="block space-y-1 text-sm">Nombre completo
      <Input required maxLength={150} disabled={disabled} value={value.displayName} onChange={event => onChange('displayName', event.target.value)} autoComplete="name" aria-invalid={Boolean(errors.displayName)} aria-describedby={errors.displayName ? `${id}-name-error` : undefined} />
      <FieldError id={`${id}-name-error`} message={errors.displayName} />
    </label>
    <label className="block space-y-1 text-sm">Correo electrónico
      <Input required type="email" maxLength={254} disabled={disabled} value={value.email} onChange={event => onChange('email', event.target.value)} autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? `${id}-email-error` : undefined} />
      <FieldError id={`${id}-email-error`} message={errors.email} />
    </label>
    <label className="block space-y-1 text-sm">Teléfono
      <Input required type="tel" maxLength={40} disabled={disabled} value={value.phone} onChange={event => onChange('phone', event.target.value)} autoComplete="tel" placeholder="+51999111222" aria-invalid={Boolean(errors.phone)} aria-describedby={`${id}-phone-help${errors.phone ? ` ${id}-phone-error` : ''}`} />
      <span id={`${id}-phone-help`} className="block text-xs text-zinc-500">Incluye el código de país, por ejemplo +51 para Perú.</span>
      <FieldError id={`${id}-phone-error`} message={errors.phone} />
    </label>
  </>;
}
