"use client";

import React, { useState } from "react";
import { SideDrawer } from "@/shared/components/ui/side-drawer";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { UploadCloud, AlertCircle } from "lucide-react";

interface ReportarPagoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pedidoCode?: string;
  clientName?: string;
  totalAmount?: number;
}

export const ReportarPagoDrawer: React.FC<ReportarPagoDrawerProps> = ({
  isOpen,
  onClose,
  pedidoCode = "PED-1042",
  clientName = "Pet Market",
  totalAmount = 1440.0,
}) => {
  const [applyTo, setApplyTo] = useState<"pedido" | "facturas">("pedido");
  const [bank, setBank] = useState("BCP");
  const [opNumber, setOpNumber] = useState("845219");
  const [date, setDate] = useState("2026-10-16");
  const [amount, setAmount] = useState(totalAmount.toFixed(2));
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Reportar pago"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-2xs text-zinc-400">
            Abre desde pedido o ficha de cliente.
          </span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose} size="sm">
              Cancelar
            </Button>
            <Button onClick={handleSave} size="sm">
              {isSaved ? "Guardado" : "Guardar reporte"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Client info bar */}
        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-2xs text-zinc-400">Cliente</p>
            <p className="font-bold text-zinc-900">{clientName}</p>
          </div>
          <p className="text-2xs text-zinc-500">RUC 20123456789</p>
        </div>

        {/* Aplicar a */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1.5">
            Aplicar a
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="applyTo"
                checked={applyTo === "pedido"}
                onChange={() => setApplyTo("pedido")}
                className="text-zinc-900 focus:ring-zinc-900"
              />
              <span className="text-xs font-medium text-zinc-800">Pedido actual</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="applyTo"
                checked={applyTo === "facturas"}
                onChange={() => setApplyTo("facturas")}
                className="text-zinc-900 focus:ring-zinc-900"
              />
              <span className="text-xs font-medium text-zinc-800">Facturas</span>
            </label>
          </div>
        </div>

        {/* Select Pedido */}
        <div>
          <Select
            value={pedidoCode}
            options={[
              { label: `${pedidoCode} | S/ ${amount}`, value: pedidoCode },
              { label: "PED-1031 | S/ 620.00", value: "PED-1031" },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">Banco</label>
            <Select
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              options={[
                { label: "BCP", value: "BCP" },
                { label: "BBVA", value: "BBVA" },
                { label: "Interbank", value: "Interbank" },
                { label: "Scotiabank", value: "Scotiabank" },
              ]}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              Número de operación
            </label>
            <Input
              value={opNumber}
              onChange={(e) => setOpNumber(e.target.value)}
              placeholder="Ej. 845219"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              Fecha de operación
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">Monto</label>
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

        {/* Comprobante Dropzone */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1.5">
            Comprobante de pago
          </label>
          <div className="border-2 border-dashed border-zinc-200 rounded-lg p-5 flex flex-col items-center justify-center text-center hover:border-zinc-400 transition-colors bg-zinc-50/50 cursor-pointer">
            <UploadCloud className="h-6 w-6 text-zinc-400 mb-1.5" />
            <p className="text-xs font-medium text-zinc-800">
              Arrastra un archivo aquí o <span className="underline">selecciona</span>
            </p>
            <p className="text-2xs text-zinc-400 mt-0.5">
              Formatos: JPG, PNG o PDF. Galería permitida.
            </p>
          </div>
        </div>

        {/* Audit notice */}
        <div className="flex items-start gap-2 p-3 bg-zinc-50 border border-zinc-200 rounded-md text-2xs text-zinc-600">
          <AlertCircle className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
          <span>
            Se verificará contra el archivo de movimientos. El adjunto no confirma el pago automáticamente.
          </span>
        </div>
      </div>
    </SideDrawer>
  );
};
