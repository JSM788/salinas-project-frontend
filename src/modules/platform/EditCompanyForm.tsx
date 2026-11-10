"use client";
import { useRef, useState } from "react";
import { apiRequest, ApiError } from "@/shared/api/client";
import {
  companySchema,
  editCompanyInput,
  PlatformCompany,
} from "@/shared/api/platform";
import { runIdempotentCommand } from "@/shared/api/idempotent-command";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { SideDrawer } from "@/shared/components/ui/side-drawer";
import { FieldError } from "@/shared/components/ui/field-error";
import { useFormErrors } from "@/shared/lib/use-form-errors";

export function EditCompanyForm({
  company,
  close,
  saved,
}: {
  company: PlatformCompany;
  close: () => void;
  saved: (company: PlatformCompany) => void;
}) {
  const baseDomain = process.env.NEXT_PUBLIC_PLATFORM_BASE_DOMAIN;
  const currentHostname = company.hostnames[0] ?? "";
  const suffix = baseDomain ? `.${baseDomain}` : "";
  const initialSubdomain =
    suffix && currentHostname.endsWith(suffix)
      ? currentHostname.slice(0, -suffix.length)
      : "";
  const [form, setForm] = useState({
    name: company.name,
    subdomain: initialSubdomain,
  });
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const pending = useRef(new Map<string, string>());
  const errors = useFormErrors({
    fields: ["name", "subdomain"],
    aliases: { hostname: "subdomain" },
  });
  const update = (name: keyof typeof form, value: string) => {
    errors.clear(name);
    setForm((current) => ({ ...current, [name]: value }));
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    errors.reset();
    let hostname: string | undefined;
    if (form.subdomain) {
      if (!baseDomain) {
        errors.setError("No se ha configurado el dominio del sistema. Contacta al administrador.");
        return;
      }
      if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(form.subdomain)) {
        errors.setFieldError("subdomain", "Usa letras minúsculas, números y guiones para el subdominio.");
        return;
      }
      hostname = `${form.subdomain}.${baseDomain}`;
    }
    const input = errors.validate(editCompanyInput, {
      name: form.name,
      timeZone: company.timeZone,
      ...(hostname ? { hostname } : {}),
    });
    if (!input) return;
    setBusy(true);
    try {
      const updated = await runIdempotentCommand(
        pending.current,
        JSON.stringify({ companyId: company.id, ...input }),
        (key) =>
          apiRequest(`/platform/companies/${company.id}/details`, companySchema, {
            body: input,
            key,
          }),
      );
      saved(updated);
    } catch (cause) {
      setUncertain(
        !(cause instanceof ApiError) || cause.status === 0 || cause.status >= 500,
      );
      errors.handle(cause);
    } finally {
      setBusy(false);
    }
  };
  return (
    <SideDrawer
      isOpen
      onClose={() => {
        if (!busy) close();
      }}
      title="Editar empresa"
      subtitle="Corrige los datos de la empresa"
      footer={
        <>
          <Button variant="outline" disabled={busy} onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" form="edit-platform-company" disabled={busy}>
            {busy ? "Guardando…" : uncertain ? "Reintentar" : "Guardar cambios"}
          </Button>
        </>
      }
    >
      <form
        id="edit-platform-company"
        noValidate
        onSubmit={(event) => void submit(event)}
        className="space-y-4"
      >
        <label className="block space-y-1 text-sm">
          Nombre de la empresa
          <Input
            required
            maxLength={150}
            disabled={busy}
            value={form.name}
            aria-invalid={Boolean(errors.fields.name)}
            aria-describedby={errors.fields.name ? "edit-company-name-error" : undefined}
            onChange={(event) => update("name", event.target.value)}
          />
          <FieldError id="edit-company-name-error" message={errors.fields.name} />
        </label>
        <label className="block space-y-1 text-sm">
          Zona horaria
          <Input disabled value="Lima (Perú)" />
        </label>
        <label className="block space-y-1 text-sm">
          Subdominio de acceso
          <Input
            maxLength={63}
            placeholder="empresa-test1"
            disabled={busy}
            value={form.subdomain}
            aria-invalid={Boolean(errors.fields.subdomain)}
            aria-describedby={errors.fields.subdomain ? "edit-company-hostname-error" : undefined}
            onChange={(event) => update("subdomain", event.target.value.toLowerCase())}
          />
          <span className="block text-xs text-zinc-500">
            Acceso: {form.subdomain || "(sin cambios)"}
            {form.subdomain ? suffix : ""}
          </span>
          <FieldError id="edit-company-hostname-error" message={errors.fields.subdomain} />
        </label>
        {errors.error && (
          <p role="alert" className="text-sm text-rose-700">
            {errors.error}
          </p>
        )}
      </form>
    </SideDrawer>
  );
}

