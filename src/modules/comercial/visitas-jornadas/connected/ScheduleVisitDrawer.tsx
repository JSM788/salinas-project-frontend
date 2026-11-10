"use client";
import { useEffect, useState } from "react";
import { SideDrawer } from "@/shared/components/ui/side-drawer";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { z } from "zod";
import {
  Customer,
  customerSchema,
  scheduleInput,
} from "@/shared/api/contracts";
import {
  FieldMember,
  teamRoutes,
  teamScheduleInput,
} from "@/shared/api/field-management";
import { errorText } from "@/shared/api/client";
import { toast } from "sonner";
import { loadDirectory } from "@/shared/api/pagination";
import { scheduledInstant } from "./planning";
import { useFormErrors } from "@/shared/lib/use-form-errors";
import { FieldError } from "@/shared/components/ui/field-error";

interface Props {
  open: boolean;
  close: () => void;
  date: string;
  timeZone: string;
  email: string;
  customers: Customer[];
  members?: FieldMember[];
  busy: boolean;
  disabled: boolean;
  save: (input: {
    customerId: string;
    scheduledAt: string;
    membershipId?: string;
  }, onError: (cause: unknown) => void) => Promise<boolean>;
}
export function ScheduleVisitDrawer({
  open,
  close,
  date,
  timeZone,
  email,
  customers,
  members,
  busy,
  disabled,
  save,
}: Props) {
  const [customerId, setCustomer] = useState(""),
    [day, setDay] = useState(date),
    [time, setTime] = useState("");
  const errors = useFormErrors({ fields: ["customerId", "membershipId", "role", "day", "time"], aliases: { scheduledAt: "day" } });
  const [role, setRole] = useState<FieldMember["role"]>("commercial");
  const [membershipId, setMembershipId] = useState("");
  const [assignedCustomers, setAssignedCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerError, setCustomerError] = useState("");
  const team = members !== undefined;
  const availableCustomers = team ? assignedCustomers : customers;
  useEffect(() => {
    if (open) {
      setCustomer("");
      setDay(date);
      setTime("");
      errors.reset();
      setRole("commercial");
      setMembershipId("");
    }
  }, [open, date]);
  useEffect(() => {
    let active = true;
    setAssignedCustomers([]);
    setCustomer("");
    setCustomerError("");
    setLoadingCustomers(false);
    if (open && team && membershipId) {
      setLoadingCustomers(true);
      loadDirectory(teamRoutes.customers(membershipId), customerSchema)
        .then((value) => {
          if (active) setAssignedCustomers(value);
        })
        .catch((cause) => {
          if (active) setCustomerError(errorText(cause));
        })
        .finally(() => {
          if (active) setLoadingCustomers(false);
        });
    }
    return () => {
      active = false;
    };
  }, [open, team, membershipId]);
  const customer = availableCustomers.find(
    (customer) => customer.id === customerId,
  );
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (disabled || loadingCustomers) return;
    const local = errors.validate(z.object({
      day: z.iso.date({ error: "Ingresa una fecha válida." }),
      time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Ingresa una hora válida."),
    }), { day, time });
    if (!local) return;
    let scheduledAt: string;
    try { scheduledAt = scheduledInstant(local.day, local.time, timeZone); }
    catch (cause) { errors.setFieldError("time", cause instanceof Error ? cause.message : "Revisa la hora de la visita."); return; }
    const values = { customerId, scheduledAt };
    const input = team
      ? errors.validate(teamScheduleInput, { ...values, membershipId })
      : errors.validate(scheduleInput, values);
    if (!input) return;
    try { if (await save(input, errors.handle)) { toast.success("Visita programada."); close(); } }
    catch (cause) { errors.handle(cause); }
  };
  return (
    <SideDrawer
      isOpen={open}
      onClose={() => {
        if (!busy) close();
      }}
      title="Programar visita"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" disabled={busy} onClick={close}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="schedule-visit"
            disabled={
              disabled || loadingCustomers
            }
          >
            {busy ? "Guardando…" : "Guardar programación"}
          </Button>
        </div>
      }
    >
      <form noValidate id="schedule-visit" onSubmit={submit} className="space-y-4 text-xs">
        {team && (
          <>
            <Select
              label="Rol del responsable"
              aria-label="Rol del responsable de la visita"
              value={role}
              disabled={disabled}
              onChange={(event) => {
                errors.reset();
                setRole(event.target.value as FieldMember["role"]);
                setMembershipId("");
              }}
              options={[
                { value: "commercial", label: "Comercial" },
                { value: "merchandiser", label: "Mercaderista" },
              ]}
            />
            <Select
              label="Responsable"
              aria-label="Responsable de la visita"
              value={membershipId}
              required
              disabled={disabled}
              aria-invalid={Boolean(errors.fields.membershipId)}
              onChange={(event) => { errors.clear("membershipId"); errors.clear("customerId"); setMembershipId(event.target.value); }}
              options={[
                { value: "", label: "Seleccionar responsable" },
                ...members
                  .filter((member) => member.role === role)
                  .map((member) => ({
                    value: member.id,
                    label: member.displayName?.trim() || "Usuario sin nombre registrado",
                  })),
              ]}
            />
            <FieldError message={errors.fields.membershipId} />
            {!members.some((member) => member.role === role) && (
              <p>No hay usuarios activos con este rol en tu empresa.</p>
            )}
          </>
        )}
        <div>
          <label
            htmlFor="schedule-customer"
            className="block font-medium mb-1.5"
          >
            Cliente
          </label>
          <Select
            id="schedule-customer"
            value={customerId}
            aria-invalid={Boolean(errors.fields.customerId)}
            onChange={(event) => { errors.clear("customerId"); setCustomer(event.target.value); }}
            options={[
              { label: "Seleccionar cliente", value: "" },
              ...availableCustomers.map((customer) => ({
                label: customer.name,
                value: customer.id,
              })),
            ]}
            required
            disabled={disabled || loadingCustomers || (team && !membershipId)}
          />
          <FieldError message={errors.fields.customerId} />
          {team && !membershipId && (
            <p className="mt-1.5 text-zinc-500">Selecciona un responsable para ver sus clientes asignados.</p>
          )}
        </div>
        {!team && (
          <div>
            <label className="block font-medium mb-1.5">Responsable</label>
            <Input value={email} disabled readOnly />
          </div>
        )}
        <div>
          <label className="block font-medium mb-1.5">Dirección</label>
          <Input value={customer ? customer.address : ""} placeholder="Se completa al seleccionar un cliente" readOnly />
          <p className="mt-1.5 text-zinc-500">Dirección registrada en la ficha del cliente.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="w-40">
            <label htmlFor="schedule-date" className="block font-medium mb-1.5">
              Fecha
            </label>
            <Input
              id="schedule-date"
              type="date"
              className="text-xs"
              value={day}
              aria-invalid={Boolean(errors.fields.day)}
              aria-describedby={errors.fields.day ? "schedule-date-error" : undefined}
              onChange={(event) => { errors.clear("day"); setDay(event.target.value); }}
              required
              disabled={disabled}
            />
            <FieldError id="schedule-date-error" message={errors.fields.day} />
          </div>
          <div className="w-28">
            <label htmlFor="schedule-time" className="block font-medium mb-1.5">
              Hora
            </label>
            <Input
              id="schedule-time"
              type="time"
              className="text-xs"
              step={60}
              value={time}
              aria-invalid={Boolean(errors.fields.time)}
              aria-describedby={errors.fields.time ? "schedule-time-error" : undefined}
              onChange={(event) => { errors.clear("time"); setTime(event.target.value); }}
              required
              disabled={disabled}
            />
            <FieldError id="schedule-time-error" message={errors.fields.time} />
          </div>
        </div>
        <p className="text-zinc-500">
          Hora de la empresa: {timeZone}. La visita aparecerá en la agenda móvil
          del responsable.
        </p>
        {loadingCustomers && <p role="status">Cargando clientes asignados…</p>}
        {customerError && (
          <p role="alert" className="text-rose-700">
            {customerError}
          </p>
        )}
        {!loadingCustomers &&
          !customerError &&
          (!team || membershipId) &&
          !availableCustomers.length && (
            <p>
              El responsable no tiene clientes asignados para programar una
              visita. Asígnalos desde Clientes.
            </p>
          )}
        {errors.error && (
          <p role="alert" className="text-rose-700">
            {errors.error}
          </p>
        )}
      </form>
    </SideDrawer>
  );
}
