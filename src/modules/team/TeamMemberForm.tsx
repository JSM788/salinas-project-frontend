"use client";
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { SideDrawer } from '@/shared/components/ui/side-drawer';
import { Button } from '@/shared/components/ui/button';
import { MemberProfileFields } from '@/shared/patterns/MemberProfileFields';
import { teamProfileInput, teamMemberSchema, type TeamMember } from '@/shared/api/platform';
import { apiRequest } from '@/shared/api/client';
import { runIdempotentCommand } from '@/shared/api/idempotent-command';
import { useFormErrors } from '@/shared/lib/use-form-errors';

export function TeamMemberForm({ member, close, saved }: { member: TeamMember; close: () => void; saved: () => void }) {
  const [form, setForm] = useState({ displayName: member.displayName ?? '', email: member.email, phone: member.phone ?? '' });
  const [busy, setBusy] = useState(false);
  const errors = useFormErrors({ fields: ['displayName', 'email', 'phone'] });
  const keys = useRef(new Map<string, string>());
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    errors.reset();
    const input = errors.validate(teamProfileInput, form);
    if (!input) return;
    setBusy(true); errors.setError('');
    try {
      await runIdempotentCommand(keys.current, JSON.stringify(input), key => apiRequest(`/team/members/${member.id}/details`, teamMemberSchema, { body: input, key }));
      toast.success('Datos del usuario actualizados.');
      saved();
    } catch (cause) { errors.handle(cause); }
    finally { setBusy(false); }
  };
  return <SideDrawer isOpen title="Editar usuario" subtitle="Actualiza los datos del usuario de tu empresa" onClose={() => { if (!busy) close(); }} footer={<>
    <Button variant="secondary" disabled={busy} onClick={close}>Cancelar</Button>
    <Button type="submit" form="edit-team-member" disabled={busy}>{busy ? 'Guardando…' : 'Guardar cambios'}</Button>
  </>}>
    <form id="edit-team-member" noValidate onSubmit={event => void submit(event)} className="space-y-4">
      <MemberProfileFields value={form} errors={errors.fields} disabled={busy} onChange={(field, value) => { setForm(current => ({ ...current, [field]: value })); errors.clear(field); }} />
      <p className="text-xs text-zinc-500">El rol lo administra el propietario de la plataforma. Cambiar el correo cerrará las sesiones del usuario; si aún no activó su cuenta, recibirá una nueva invitación.</p>
      {errors.error && <p role="alert" className="text-sm text-rose-700">{errors.error}</p>}
    </form>
  </SideDrawer>;
}
