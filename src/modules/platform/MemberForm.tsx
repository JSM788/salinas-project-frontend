"use client";
import { useRef, useState } from "react";
import { apiRequest, ApiError } from "@/shared/api/client";
import {
  createMemberInput,
  editMemberInput,
  platformMemberSchema,
  PlatformCompany,
  PlatformMember,
} from "@/shared/api/platform";
import { runIdempotentCommand } from "@/shared/api/idempotent-command";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { SideDrawer } from "@/shared/components/ui/side-drawer";
import { MemberProfileFields } from '@/shared/patterns/MemberProfileFields';
import { FieldError } from '@/shared/components/ui/field-error';
import { useFormErrors } from '@/shared/lib/use-form-errors';

export function MemberForm({
  companies,
  member,
  close,
  saved,
}: {
  companies: PlatformCompany[];
  member?: PlatformMember;
  close: () => void;
  saved: (companyId: string, member: PlatformMember) => void;
}) {
  const [companyId, setCompanyId] = useState(member?.companyId ?? "");
  const [form, setForm] = useState({
    displayName: member?.displayName ?? "",
    email: member?.email ?? "",
    phone: member?.phone ?? "",
    password: "",
    role: member?.role ?? "",
  });
  const [busy, setBusy] = useState(false);
  const errors = useFormErrors({ fields: ['companyId', 'displayName', 'email', 'phone', 'role', 'password'] });
  const [uncertain, setUncertain] = useState(false);
  const pending = useRef(new Map<string, string>());
  const update = (name: keyof typeof form, value: string) => {
    errors.clear(name);
    setForm((current) => ({ ...current, [name]: value }));
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    errors.reset();
    const company = companies.find((entry) => entry.id === companyId);
    if (!company) {
      errors.setFieldError('companyId', 'Selecciona la empresa a la que pertenecerá el usuario.');
      return;
    }
    if (company.status === "suspended") {
      errors.setError("Reactiva la empresa antes de crear usuarios.");
      return;
    }
    const { password, ...details } = form;
    const input = member
      ? errors.validate(editMemberInput, {
          ...details,
          ...(password ? { password } : {}),
        })
      : errors.validate(createMemberInput, details);
    if (!input) return;
    setBusy(true);
    errors.setError("");
    try {
      const identity = details;
      const updated = await runIdempotentCommand(
        pending.current,
        JSON.stringify({
          companyId,
          membershipId: member?.id,
          ...identity,
          passwordChange: Boolean(password),
        }),
        (key) =>
          apiRequest(
            member
              ? `/platform/companies/${companyId}/members/${member.id}/details`
              : `/platform/companies/${companyId}/members`,
            platformMemberSchema,
            { body: input, key },
          ),
      );
      setForm({ displayName: "", email: "", phone: "", password: "", role: "" });
      saved(companyId, updated);
    } catch (cause) {
      setUncertain(
        !(cause instanceof ApiError) ||
          cause.status === 0 ||
          cause.status >= 500,
      );
      errors.handle(cause);
    } finally {
      setBusy(false);
    }
  };
  const disabled = busy || uncertain;
  return (
    <SideDrawer
      isOpen
      onClose={() => {
        if (!disabled) close();
      }}
      title={member ? "Editar usuario" : "Nuevo usuario"}
      subtitle={
        member
          ? "Actualiza los datos y el rol de la cuenta"
          : "Asigna la cuenta a una empresa y define su rol"
      }
      footer={
        <>
          <Button variant="outline" disabled={disabled} onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" form="new-platform-member" disabled={busy}>
            {busy
              ? "Guardando…"
              : uncertain
                ? "Reintentar guardado"
                : member
                  ? "Guardar cambios"
                  : "Crear usuario"}
          </Button>
        </>
      }
    >
      <form
        id="new-platform-member"
        noValidate
        onSubmit={(event) => void submit(event)}
        className="space-y-4"
      >
        <label className="block space-y-1 text-sm">
          Empresa
          <Select
            required
            aria-label="Empresa del usuario"
            aria-invalid={Boolean(errors.fields.companyId)}
            disabled={disabled || Boolean(member)}
            value={companyId}
            onChange={(event) => { setCompanyId(event.target.value); errors.clear('companyId'); }}
            options={[
              { value: "", label: "Selecciona una empresa" },
              ...companies.map((entry) => ({
                value: entry.id,
                label:
                  entry.status === "suspended"
                    ? `${entry.name} (suspendida)`
                    : entry.name,
              })),
            ]}
          />
        </label>
        <FieldError message={errors.fields.companyId} />
        <MemberProfileFields value={form} errors={errors.fields} onChange={update} disabled={disabled} />
        {!member && <p className="text-xs text-zinc-500">Se enviará un enlace de invitación a este correo para que el usuario establezca su contraseña.</p>}
        <label className="block space-y-1 text-sm">
          Rol
          <Select
            required
            aria-label="Rol del nuevo usuario"
            aria-invalid={Boolean(errors.fields.role)}
            disabled={disabled}
            value={form.role}
            onChange={(event) => update("role", event.target.value)}
            options={[
              { value: "", label: "Selecciona un rol" },
              { value: "commercial", label: "Comercial" },
              { value: "merchandiser", label: "Mercaderista" },
              { value: "manager", label: "Gerencia" },
            ]}
          />
          <FieldError message={errors.fields.role} />
        </label>
        {member && (
          <label className="block space-y-1 text-sm">
            Nueva contraseña
            <Input
              type="password"
              aria-label="Nueva contraseña"
              aria-invalid={Boolean(errors.fields.password)}
              minLength={1}
              maxLength={128}
              autoComplete="new-password"
              disabled={disabled}
              value={form.password}
              onChange={(event) => update("password", event.target.value)}
            />
            <FieldError message={errors.fields.password} />
            <span className="block text-xs text-zinc-500">
              Opcional. Déjala vacía para conservar la actual.
            </span>
          </label>
        )}
        {member && (
          <p className="text-xs text-zinc-500">
            Cambiar el correo, rol o contraseña cerrará las sesiones del
            usuario. El cambio de rol requiere resolver antes sus clientes
            asignados, visitas pendientes y jornadas activas.
          </p>
        )}
        <p className="text-xs text-zinc-500">
          Comercial y Mercaderista ejecutan sus visitas en móvil. Gerencia
          gestiona clientes, planificación y resultados desde la web; no crea
          cuentas.
        </p>
        {errors.error && (
          <p role="alert" className="text-sm text-rose-700">
            {errors.error}
          </p>
        )}
        {uncertain && (
          <p className="text-xs text-amber-800">
            No se confirmó el guardado. Los datos se mantienen solo en este
            formulario para reintentar.
          </p>
        )}
      </form>
    </SideDrawer>
  );
}
