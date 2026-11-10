"use client";

import React, { useMemo, useState } from "react";
import { SideDrawer } from "@/shared/components/ui/side-drawer";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { AlertCircle } from "lucide-react";
import { useDemo } from "@/shared/state/demo-store";
import { addMinutes } from "@/shared/lib/date";
import { AgendaSlot } from "../models/visita.model";
import { SCENARIO_DAY, slotStart } from "./scenario-day";

interface ProgramarVisitaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the slot that was just scheduled. */
  onSave?: (slot: Omit<AgendaSlot, "id" | "status">) => void;
}

const VISIT_MINUTES = 60;

export const ProgramarVisitaDrawer: React.FC<ProgramarVisitaDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const { clientes, agenda, clock, programarVisita } = useDemo();

  const [clientId, setClientId] = useState("");
  const [time, setTime] = useState(() => `${String(Math.min(Number(clock.slice(0, 2)) + 1, 20)).padStart(2, "0")}:00`);

  const clientOptions = useMemo(
    () => [
      { label: "Seleccionar cliente", value: "" },
      ...[...clientes]
        .sort((a, b) => a.name.localeCompare(b.name, "es"))
        .map((c) => ({ label: `${c.name} (${c.district})`, value: c.id })),
    ],
    [clientes]
  );

  const client = clientes.find((c) => c.id === clientId);
  const hasOverlap =
    !!client &&
    agenda.some(
      (slot) => slot.seller === client.seller && slotStart(slot.timeSlot).slice(0, 2) === time.slice(0, 2)
    );
  const canSave = !!client && /^\d{2}:\d{2}$/.test(time);

  const handleSave = () => {
    if (!client || !canSave) return;
    const slot = {
      clientId: client.id,
      timeSlot: `${time} - ${addMinutes(time, VISIT_MINUTES)}`,
      clientName: client.name,
      seller: client.seller,
      district: client.district,
      date: SCENARIO_DAY,
    };
    programarVisita(slot);
    onSave?.(slot);
    setClientId("");
    onClose();
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Programar visita"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            Guardar programación
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1.5">
            Cliente
          </label>
          <Select value={clientId} onChange={(e) => setClientId(e.target.value)} options={clientOptions} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              Vendedor asignado
            </label>
            <Input value={client?.seller ?? ""} placeholder="Según el cliente" disabled readOnly />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              Territorio
            </label>
            <Input value={client?.district ?? ""} placeholder="Según el cliente" disabled readOnly />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              Fecha
            </label>
            <Input value={SCENARIO_DAY} disabled readOnly />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              Hora
            </label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <p className="text-2xs text-zinc-500">
          La visita se asigna al vendedor responsable del cliente y dura {VISIT_MINUTES} minutos.
        </p>

        {hasOverlap && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md flex items-center gap-2 text-amber-800 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>El vendedor ya tiene otra visita programada en esa hora.</span>
          </div>
        )}

        {/* Ocultado temporalmente: objetivo, observaciones y visita fuera de zona aún no se guardan en el mock
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">Objetivo de la visita</label>
            <Select
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              options={[
                { label: "Presentar promoción", value: "Presentar promoción" },
                { label: "Cobranza", value: "Cobranza" },
                { label: "Auditoría de stock", value: "Auditoría de stock" },
              ]}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1.5">Observaciones</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-zinc-200 bg-white p-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
          />
        </div>
        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={outOfZone}
              onChange={(e) => setOutOfZone(e.target.checked)}
              className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 h-4 w-4"
            />
            <span className="text-xs font-medium text-zinc-700">Visita fuera de zona</span>
          </label>
          {outOfZone && (
            <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-md flex items-center gap-2 text-amber-800 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Fuera de territorio: requiere aprobación previa.</span>
            </div>
          )}
        </div>
        */}
      </div>
    </SideDrawer>
  );
};
