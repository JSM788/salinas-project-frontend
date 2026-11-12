"use client";

import { FormEvent, useState } from "react";
import { SideDrawer } from "@/shared/components/ui/side-drawer";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { FieldError } from "@/shared/components/ui/field-error";
import { apiRequest } from "@/shared/api/client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import {
  createCustomerInput,
  managedCustomerSchema,
  CustomerAssignee,
  ManagedCustomer,
} from "@/shared/api/customer-management";
import { useFormErrors } from "@/shared/lib/use-form-errors";
import { PlacesAddressInput } from "../../../components/PlacesAddressInput";
import {
  DISTRITOS_SORTED,
  ZONAS_COMERCIALES,
  encontrarDistrito,
  detectarZonaPorDistrito,
} from "../../../models/distritos-zonas";

interface NewCustomerDrawerProps {
  assignees: CustomerAssignee[];
  onClose: () => void;
  onSaved: (customer: ManagedCustomer) => void;
}

export function NewCustomerDrawer({
  assignees,
  onClose,
  onSaved,
}: NewCustomerDrawerProps) {
  const [form, setForm] = useState({
    name: "",
    ruc: "",
    district: "",
    address: "",
    zone: "",
    latitude: null as number | null,
    longitude: null as number | null,
    commercialMembershipId: "",
    merchandiserMembershipId: "",
  });
  const [busy, setBusy] = useState(false);
  const errors = useFormErrors({
    fields: [
      "name",
      "ruc",
      "district",
      "address",
      "zone",
      "commercialMembershipId",
      "merchandiserMembershipId",
    ],
  });

  const close = () => {
    if (!busy) onClose();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const { commercialMembershipId, merchandiserMembershipId, ...fields } = form;
    const parsed = errors.validate(createCustomerInput, {
      ...fields,
      ...(commercialMembershipId ? { commercialMembershipId } : {}),
      ...(merchandiserMembershipId ? { merchandiserMembershipId } : {}),
    });
    if (!parsed) return;
    setBusy(true);
    errors.reset();
    try {
      const customer = await apiRequest(API_ENDPOINTS.CUSTOMERS.ROOT, managedCustomerSchema, {
        body: parsed,
      });
      onSaved(customer);
    } catch (cause) {
      errors.handle(cause);
    } finally {
      setBusy(false);
    }
  };

  const field = (name: "name" | "ruc", label: string, required = false) => (
    <label className="block space-y-1 text-xs font-medium text-zinc-700">
      <span>
        {label}
        {required ? " *" : ""}
      </span>
      <Input
        name={name}
        value={form[name]}
        required={required}
        aria-invalid={Boolean(errors.fields[name])}
        aria-describedby={errors.fields[name] ? "customer-" + name + "-error" : undefined}
        disabled={busy}
        maxLength={name === "ruc" ? 11 : 150}
        inputMode={name === "ruc" ? "numeric" : "text"}
        onChange={(event) => {
          errors.clear(name);
          setForm((previous) => ({ ...previous, [name]: event.target.value }));
        }}
      />
      <FieldError id={"customer-" + name + "-error"} message={errors.fields[name]} />
    </label>
  );

  return (
    <SideDrawer
      isOpen
      onClose={close}
      title="Nuevo cliente"
      subtitle="Registra los datos del cliente en la cartera de tu empresa"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={close} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" form="connected-new-customer" disabled={busy}>
            {busy ? "Guardando…" : "Crear cliente"}
          </Button>
        </div>
      }
    >
      <form noValidate id="connected-new-customer" onSubmit={submit} className="space-y-4">
        {field("name", "Razón social / Nombre comercial", true)}
        {field("ruc", "RUC", true)}

        <label className="block space-y-1 text-xs font-medium text-zinc-700">
          <span>Dirección *</span>
          <PlacesAddressInput
            value={form.address}
            required
            hasError={Boolean(errors.fields.address)}
            errorId={errors.fields.address ? "customer-address-error" : undefined}
            disabled={busy}
            onChange={(address, details) => {
              errors.clear("address");
              let detectedDistrict = "";
              let detectedZone = "";

              if (details?.district) {
                const match = encontrarDistrito(details.district);
                if (match) {
                  detectedDistrict = match.distrito;
                  detectedZone = match.zona;
                }
              }

              setForm((prev) => ({
                ...prev,
                address,
                district: detectedDistrict || prev.district,
                zone:
                  detectedZone ||
                  (detectedDistrict ? detectarZonaPorDistrito(detectedDistrict) : prev.zone),
                latitude: details?.lat ?? prev.latitude,
                longitude: details?.lng ?? prev.longitude,
              }));

              if (detectedDistrict) {
                errors.clear("district");
              }
            }}
          />
          <FieldError id="customer-address-error" message={errors.fields.address} />
        </label>

        <div className="space-y-1">
          <Select
            label="Distrito *"
            aria-invalid={Boolean(errors.fields.district)}
            aria-describedby={errors.fields.district ? "customer-district-error" : undefined}
            value={form.district}
            disabled={busy}
            onChange={(event) => {
              errors.clear("district");
              const selectedDistrict = event.target.value;
              const autoZone = detectarZonaPorDistrito(selectedDistrict);
              setForm((prev) => ({
                ...prev,
                district: selectedDistrict,
                zone: autoZone || prev.zone,
              }));
            }}
            options={[
              { value: "", label: "Seleccionar distrito" },
              ...DISTRITOS_SORTED.map((d) => ({
                value: d.distrito,
                label: d.distrito,
              })),
            ]}
          />
          <FieldError id="customer-district-error" message={errors.fields.district} />
        </div>

        <div className="space-y-1">
          <Select
            label="Zona comercial"
            aria-invalid={Boolean(errors.fields.zone)}
            aria-describedby={errors.fields.zone ? "customer-zone-error" : undefined}
            value={form.zone}
            disabled={busy}
            onChange={(event) => {
              errors.clear("zone");
              setForm((prev) => ({ ...prev, zone: event.target.value }));
            }}
            options={[
              { value: "", label: "Seleccionar zona comercial" },
              ...ZONAS_COMERCIALES.map((z) => ({
                value: z,
                label: z,
              })),
            ]}
          />
          <FieldError id="customer-zone-error" message={errors.fields.zone} />
        </div>

        <div className="pt-2 border-t border-zinc-100 space-y-3">
          <span className="text-2xs font-semibold text-zinc-500 uppercase tracking-wider block">
            Asignación de responsables (Opcional)
          </span>

          <Select
            aria-invalid={Boolean(errors.fields.commercialMembershipId)}
            aria-label="Comercial responsable"
            label="Comercial (Ventas)"
            value={form.commercialMembershipId}
            disabled={busy}
            onChange={(event) => {
              errors.clear("commercialMembershipId");
              setForm((previous) => ({ ...previous, commercialMembershipId: event.target.value }));
            }}
            options={[
              { value: "", label: "Sin asignar" },
              ...assignees
                .filter((member) => member.role === "commercial")
                .map((member) => ({
                  value: member.id,
                  label: member.displayName?.trim() || "Usuario sin nombre registrado",
                })),
            ]}
          />
          <FieldError
            id="customer-commercialMembershipId-error"
            message={errors.fields.commercialMembershipId}
          />

          <Select
            aria-invalid={Boolean(errors.fields.merchandiserMembershipId)}
            aria-label="Mercaderista responsable"
            label="Mercaderista (Auditoría)"
            value={form.merchandiserMembershipId}
            disabled={busy}
            onChange={(event) => {
              errors.clear("merchandiserMembershipId");
              setForm((previous) => ({
                ...previous,
                merchandiserMembershipId: event.target.value,
              }));
            }}
            options={[
              { value: "", label: "Sin asignar" },
              ...assignees
                .filter((member) => member.role === "merchandiser")
                .map((member) => ({
                  value: member.id,
                  label: member.displayName?.trim() || "Usuario sin nombre registrado",
                })),
            ]}
          />
          <FieldError
            id="customer-merchandiserMembershipId-error"
            message={errors.fields.merchandiserMembershipId}
          />
        </div>

        {errors.error && (
          <p role="alert" className="text-sm text-rose-700">
            {errors.error}
          </p>
        )}
      </form>
    </SideDrawer>
  );
}

