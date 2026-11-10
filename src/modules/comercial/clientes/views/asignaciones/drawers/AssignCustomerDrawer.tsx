"use client";

import { FormEvent, useState } from "react";
import { SideDrawer } from "@/shared/components/ui/side-drawer";
import { Button } from "@/shared/components/ui/button";
import { Select } from "@/shared/components/ui/select";
import { apiRequest } from "@/shared/api/client";
import {
  assignmentResponse,
  CustomerAssignee,
  ManagedCustomer,
} from "@/shared/api/customer-management";
import { useFormErrors } from "@/shared/lib/use-form-errors";

interface AssignCustomerDrawerProps {
  assignees: CustomerAssignee[];
  customers: ManagedCustomer[];
  onClose: () => void;
  onSaved: () => void;
}

export function AssignCustomerDrawer({
  assignees,
  customers,
  onClose,
  onSaved,
}: AssignCustomerDrawerProps) {
  const initialCommercial =
    customers.length === 1
      ? (customers[0].assignments.find((a) => a.role === "commercial")?.membershipId ?? "")
      : "";
  const initialMerchandiser =
    customers.length === 1
      ? (customers[0].assignments.find((a) => a.role === "merchandiser")?.membershipId ?? "")
      : "";

  const [commercialId, setCommercialId] = useState(initialCommercial);
  const [merchandiserId, setMerchandiserId] = useState(initialMerchandiser);
  const [busy, setBusy] = useState(false);
  const errors = useFormErrors({ fields: ["commercialId", "merchandiserId"] });

  const close = () => {
    if (!busy) onClose();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    errors.reset();
    if (!commercialId && !merchandiserId) {
      errors.setFieldError(
        "commercialId",
        "Selecciona al menos un responsable (Comercial o Mercaderista) para asignar.",
      );
      return;
    }
    setBusy(true);
    try {
      if (commercialId) {
        await apiRequest("/customers/assignments", assignmentResponse, {
          body: {
            customerIds: customers.map((c) => c.id),
            membershipId: commercialId,
          },
        });
      }
      if (merchandiserId) {
        await apiRequest("/customers/assignments", assignmentResponse, {
          body: {
            customerIds: customers.map((c) => c.id),
            membershipId: merchandiserId,
          },
        });
      }
      onSaved();
    } catch (cause) {
      errors.handle(cause);
    } finally {
      setBusy(false);
    }
  };

  const commercialOptions = [
    { value: "", label: "Sin asignar / No modificar" },
    ...assignees
      .filter((member) => member.role === "commercial")
      .map((member) => ({
        value: member.id,
        label: member.displayName?.trim() || member.email,
      })),
  ];

  const merchandiserOptions = [
    { value: "", label: "Sin asignar / No modificar" },
    ...assignees
      .filter((member) => member.role === "merchandiser")
      .map((member) => ({
        value: member.id,
        label: member.displayName?.trim() || member.email,
      })),
  ];

  return (
    <SideDrawer
      isOpen
      onClose={close}
      title="Asignar responsables"
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={close} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" form="connected-assign-customers" disabled={busy}>
            {busy ? "Guardando…" : "Confirmar"}
          </Button>
        </div>
      }
    >
      <form
        noValidate
        id="connected-assign-customers"
        onSubmit={submit}
        className="space-y-5"
      >
        <div>
          <p className="mb-2 text-xs text-zinc-500">
            Clientes seleccionados: {customers.length}
          </p>
          <ul className="max-h-36 overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm">
            {customers.map((customer) => (
              <li key={customer.id} className="py-1">
                {customer.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4 pt-1">
          <div className="space-y-1">
            <Select
              aria-invalid={Boolean(errors.fields.commercialId)}
              aria-describedby={errors.fields.commercialId ? "assign-commercial-error" : undefined}
              aria-label="Comercial asignado"
              label="Comercial (Ventas y Cobranza)"
              value={commercialId}
              disabled={busy}
              onChange={(event) => {
                errors.clear("commercialId");
                setCommercialId(event.target.value);
              }}
              options={commercialOptions}
            />
            {errors.fields.commercialId && (
              <p id="assign-commercial-error" role="alert" className="text-2xs text-rose-600">
                {errors.fields.commercialId}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Select
              aria-invalid={Boolean(errors.fields.merchandiserId)}
              aria-describedby={errors.fields.merchandiserId ? "assign-merchandiser-error" : undefined}
              aria-label="Mercaderista asignado"
              label="Mercaderista (Auditoría y Góndolas)"
              value={merchandiserId}
              disabled={busy}
              onChange={(event) => {
                errors.clear("merchandiserId");
                setMerchandiserId(event.target.value);
              }}
              options={merchandiserOptions}
            />
            {errors.fields.merchandiserId && (
              <p id="assign-merchandiser-error" role="alert" className="text-2xs text-rose-600">
                {errors.fields.merchandiserId}
              </p>
            )}
          </div>
        </div>
        <p className="text-xs text-zinc-500">
          Se actualizarán los responsables seleccionados para los clientes indicados.
        </p>
        {errors.error && (
          <p role="alert" className="text-sm text-rose-700">
            {errors.error}
          </p>
        )}
      </form>
    </SideDrawer>
  );
}

