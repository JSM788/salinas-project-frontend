"use client";
import { useRef, useState } from "react";
import { apiRequest, ApiError } from "@/shared/api/client";
import {
  companySchema,
  createCompanyInput,
  PlatformCompany,
} from "@/shared/api/platform";
import { runIdempotentCommand } from "@/shared/api/idempotent-command";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { SideDrawer } from "@/shared/components/ui/side-drawer";
import { MemberProfileFields } from '@/shared/patterns/MemberProfileFields';
import { FieldError } from '@/shared/components/ui/field-error';
import { useFormErrors } from '@/shared/lib/use-form-errors';

export function CompanyForm({
  close,
  saved,
}: {
  close: () => void;
  saved: (company: PlatformCompany) => void;
}) {
  const baseDomain = process.env.NEXT_PUBLIC_PLATFORM_BASE_DOMAIN;
  const [form, setForm] = useState({
    name: "",
    timeZone: "America/Lima",
    subdomain: "",
    managerName: "",
    managerEmail: "",
    managerPhone: "",
  });
  const [busy, setBusy] = useState(false);
  const errors = useFormErrors({ fields: ['name', 'timeZone', 'subdomain', 'managerName', 'managerEmail', 'managerPhone'], aliases: { 'manager.displayName': 'managerName', 'manager.email': 'managerEmail', 'manager.phone': 'managerPhone', hostname: 'subdomain' } });
  const [uncertain, setUncertain] = useState(false);
  const pending = useRef(new Map<string, string>());
  const update = (name: keyof typeof form, value: string) => {
    errors.clear(name);
    setForm((current) => ({ ...current, [name]: value }));
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    errors.reset();
    if (!baseDomain) { errors.setError('No se ha configurado el dominio del sistema. Contacta al administrador.'); return; }
    if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(form.subdomain)) {
      errors.setFieldError('subdomain', 'Usa letras minúsculas, números y guiones para el subdominio.');
      return;
    }
    const input = errors.validate(createCompanyInput, {
      name: form.name,
      timeZone: form.timeZone,
      hostname: `${form.subdomain}.${baseDomain}`,
      manager: {displayName:form.managerName, email:form.managerEmail.trim().toLowerCase(), phone:form.managerPhone},
    });
    if (!input) return;
    setBusy(true);
    errors.setError("");
    try {
      const company = await runIdempotentCommand(
        pending.current,
        JSON.stringify(input),
        (key) =>
          apiRequest("/platform/companies", companySchema, {
            body: input,
            key,
          }),
      );
      saved(company);
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
      title="Nueva empresa"
      subtitle="Crea una empresa y configura su dominio de acceso"
      footer={
        <>
          <Button variant="outline" disabled={disabled} onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" form="new-platform-company" disabled={busy}>
            {busy
              ? "Guardando…"
              : uncertain
                ? "Reintentar creación"
                : "Crear empresa"}
          </Button>
        </>
      }
    >
      <form
        id="new-platform-company"
        noValidate
        onSubmit={(event) => void submit(event)}
        className="space-y-4"
      >
        <label className="block space-y-1 text-sm">
          Nombre de la empresa
          <Input
            required
            maxLength={150}
            disabled={disabled}
            value={form.name}
            aria-invalid={Boolean(errors.fields.name)}
            aria-describedby={errors.fields.name ? 'company-name-error' : undefined}
            onChange={(event) => update("name", event.target.value)}
          />
          <FieldError id="company-name-error" message={errors.fields.name} />
        </label>
        <label className="block space-y-1 text-sm">
          Zona horaria
          <Input
            required
            disabled
            value="Lima (Perú)"
          />
          <span className="block text-xs text-zinc-500">
            Determina las fechas y horas de las jornadas y visitas.
          </span>
        </label>
        <label className="block space-y-1 text-sm">
          Subdominio de acceso
          <Input
            required
            maxLength={63}
            pattern="[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?"
            placeholder="empresa-test1"
            disabled={disabled}
            value={form.subdomain}
            aria-invalid={Boolean(errors.fields.subdomain)}
            aria-describedby={errors.fields.subdomain ? 'company-hostname-error' : undefined}
            onChange={(event) => update("subdomain", event.target.value.toLowerCase())}
          />
          <span className="block text-xs text-zinc-500">
            Acceso: {form.subdomain || "empresa-test1"}.{baseDomain || "dominio no configurado"}
          </span>
          <FieldError id="company-hostname-error" message={errors.fields.subdomain} />
        </label>
        <div className="border-t border-zinc-200 pt-4 space-y-4">
          <p className="text-sm font-medium">Gerente inicial</p>
          <MemberProfileFields value={{ displayName: form.managerName, email: form.managerEmail, phone: form.managerPhone }} errors={{ displayName: errors.fields.managerName, email: errors.fields.managerEmail, phone: errors.fields.managerPhone }} disabled={disabled} onChange={(field, value) => update(field === 'displayName' ? 'managerName' : field === 'email' ? 'managerEmail' : 'managerPhone', value)} />
          <p className="text-xs text-zinc-500">Recibirá un enlace para establecer su contraseña. Este será el primer usuario de la empresa.</p>
        </div>
        {errors.error && (
          <p role="alert" className="text-sm text-rose-700">
            {errors.error}
          </p>
        )}
        {uncertain && (
          <p className="text-xs text-amber-800">
            No se confirmó la creación. Reintenta con los mismos datos.
          </p>
        )}
      </form>
    </SideDrawer>
  );
}
