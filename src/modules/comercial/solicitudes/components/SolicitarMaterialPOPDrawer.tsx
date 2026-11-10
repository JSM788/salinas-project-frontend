"use client";

import React, { useState } from "react";
import { SideDrawer } from "@/shared/components/ui/side-drawer";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Camera, AlertCircle, Package } from "lucide-react";

interface SolicitarMaterialPOPDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
}

export const SolicitarMaterialPOPDrawer: React.FC<SolicitarMaterialPOPDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [client, setClient] = useState("Pet Market");
  const [brand, setBrand] = useState("Bravery");
  const [material, setMaterial] = useState("Exhibidor");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("Reforzar exhibición");
  const [notes, setNotes] = useState(
    "Para campaña de lanzamiento en tienda principal."
  );

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Solicitar material POP"
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              Cliente *
            </label>
            <Select
              value={client}
              onChange={(e) => setClient(e.target.value)}
              options={[
                { label: "Pet Market", value: "Pet Market" },
                { label: "Mundo Animal", value: "Mundo Animal" },
                { label: "Veterinaria Huellitas", value: "Veterinaria Huellitas" },
              ]}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              Marca *
            </label>
            <Select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              options={[
                { label: "Bravery", value: "Bravery" },
                { label: "Royal Canin", value: "Royal Canin" },
                { label: "Pro Plan", value: "Pro Plan" },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              Material *
            </label>
            <Select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              options={[
                { label: "Exhibidor", value: "Exhibidor" },
                { label: "Afiches", value: "Afiches" },
                { label: "Dispensador", value: "Dispensador" },
                { label: "Banner", value: "Banner" },
              ]}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              Cantidad *
            </label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1.5">
            Motivo *
          </label>
          <Select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            options={[
              { label: "Reforzar exhibición", value: "Reforzar exhibición" },
              { label: "Campaña estacional", value: "Campaña estacional" },
              { label: "Apertura de local", value: "Apertura de local" },
            ]}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-medium text-zinc-700">
              Observaciones
            </label>
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

        {/* Foto de referencia */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1.5">
            Foto de referencia (opcional)
          </label>
          <div className="flex gap-3">
            <div className="w-28 h-20 rounded-lg bg-zinc-800 text-white flex items-center justify-center font-bold text-xs">
              BRAVERY
            </div>
            <div className="w-24 h-20 rounded-lg border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 hover:border-zinc-400 cursor-pointer text-center p-2">
              <Camera className="h-5 w-5 mb-1" />
              <span className="text-2xs">Agregar foto</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 bg-zinc-50 border border-zinc-200 rounded-md text-2xs text-zinc-600">
          <AlertCircle className="h-4 w-4 text-zinc-400 shrink-0" />
          <span>Sujeto a aprobación y disponibilidad de almacén.</span>
        </div>
      </div>
    </SideDrawer>
  );
};
