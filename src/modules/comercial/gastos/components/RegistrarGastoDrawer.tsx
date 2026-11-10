"use client";

import React, { useState } from "react";
import { SideDrawer } from "@/shared/components/ui/side-drawer";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Camera, X } from "lucide-react";

interface RegistrarGastoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
}

export const RegistrarGastoDrawer: React.FC<RegistrarGastoDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [jornada, setJornada] = useState("j-01");
  const [category, setCategory] = useState("Peaje");
  const [ruc, setRuc] = useState("20123456789");
  const [date, setDate] = useState("2026-10-16");
  const [amount, setAmount] = useState("15.00");
  const [notes, setNotes] = useState("Peaje de ruta a visita a Pet Market.");

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar gasto"
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
            Guardar gasto
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1.5">
            Jornada *
          </label>
          <Select
            value={jornada}
            onChange={(e) => setJornada(e.target.value)}
            options={[
              { label: "16 oct. 2026 — Ana Torres", value: "j-01" },
              { label: "16 oct. 2026 — Luis Ramos", value: "j-02" },
            ]}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1.5">
            Categoría *
          </label>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { label: "Peaje", value: "Peaje" },
              { label: "Combustible", value: "Combustible" },
              { label: "Alimentación", value: "Alimentación" },
              { label: "Estacionamiento", value: "Estacionamiento" },
              { label: "Movilidad", value: "Movilidad" },
            ]}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1.5">
            RUC proveedor *
          </label>
          <Input value={ruc} onChange={(e) => setRuc(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              Fecha *
            </label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              Monto *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">
                S/
              </span>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-9 pl-8 pr-3 text-xs bg-white border border-zinc-200 rounded-md focus:border-zinc-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Comprobante foto */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1.5">
            Comprobante (foto) *
          </label>
          <div className="flex gap-3">
            <div className="w-28 h-28 rounded-lg bg-zinc-100 border border-zinc-200 p-2 flex flex-col justify-between text-2xs text-zinc-600 relative">
              <p className="font-bold text-zinc-900 text-center">RUTAS DEL SUR</p>
              <p className="text-center font-mono">PEAJE</p>
              <p className="text-center font-bold text-zinc-900">S/ 15.00</p>
              <p className="text-center text-zinc-400">16/10/2026</p>
            </div>

            <div className="w-24 h-28 rounded-lg border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 hover:border-zinc-400 cursor-pointer text-center p-2">
              <Camera className="h-5 w-5 mb-1" />
              <span className="text-2xs">Agregar foto</span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-zinc-700">Observaciones</label>
            <span className="text-2xs text-zinc-400">{notes.length}/250</span>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={250}
            className="w-full rounded-md border border-zinc-200 bg-white p-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
          />
        </div>
      </div>
    </SideDrawer>
  );
};
