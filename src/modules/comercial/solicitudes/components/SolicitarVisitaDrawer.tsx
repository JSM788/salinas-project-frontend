"use client";

import React, { useState } from "react";
import { SideDrawer } from "@/shared/components/ui/side-drawer";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { AlertCircle } from "lucide-react";

interface SolicitarVisitaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
}

export const SolicitarVisitaDrawer: React.FC<SolicitarVisitaDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [client, setClient] = useState("Pet Market (RUC 20601234567)");
  const [seller, setSeller] = useState("Ana Torres");
  const [date, setDate] = useState("2026-10-16");
  const [hour, setHour] = useState("11:00");
  const [reason, setReason] = useState("Fuera de territorio");
  const [objective, setObjective] = useState("Presentar productos");
  const [justification, setJustification] = useState(
    "El cliente solicitó una reunión urgente para revisar nuevos productos. Se requiere visita fuera de mi territorio asignado."
  );

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Solicitar visita"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onSubmit?.();
              onClose();
            }}
          >
            Enviar solicitud
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1.5">
            Cliente
          </label>
          <Input
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="Buscar cliente..."
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1.5">
            Vendedor
          </label>
          <Select
            value={seller}
            onChange={(e) => setSeller(e.target.value)}
            options={[
              { label: "Ana Torres", value: "Ana Torres" },
              { label: "Luis Ramos", value: "Luis Ramos" },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">Fecha</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">Hora</label>
            <Input type="time" value={hour} onChange={(e) => setHour(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">Motivo</label>
            <Select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              options={[
                { label: "Fuera de territorio", value: "Fuera de territorio" },
                { label: "Cliente nuevo", value: "Cliente nuevo" },
                { label: "Reactivación", value: "Reactivación" },
              ]}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              Objetivo de la visita
            </label>
            <Select
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              options={[
                { label: "Presentar productos", value: "Presentar productos" },
                { label: "Cobranza", value: "Cobranza" },
              ]}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1.5">
            Justificación
          </label>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-zinc-200 bg-white p-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
          />
        </div>

        <div className="flex items-center gap-2 p-2.5 bg-zinc-50 border border-zinc-200 rounded-md text-2xs text-zinc-600">
          <AlertCircle className="h-4 w-4 text-zinc-400 shrink-0" />
          <span>Quedará pendiente de aprobación.</span>
        </div>
      </div>
    </SideDrawer>
  );
};
