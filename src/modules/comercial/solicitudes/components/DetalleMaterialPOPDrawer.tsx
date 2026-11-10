"use client";

import React, { useEffect, useState } from "react";
import { SideDrawer } from "@/shared/components/ui/side-drawer";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Info } from "lucide-react";
import { useDemo } from "@/shared/state/demo-store";
import { MaterialPOP } from "../models/solicitud.model";

interface DetalleMaterialPOPDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  material: MaterialPOP | null;
}

export const DetalleMaterialPOPDrawer: React.FC<DetalleMaterialPOPDrawerProps> = ({
  isOpen,
  onClose,
  material,
}) => {
  const { clientes, resolverPop } = useDemo();
  const [notes, setNotes] = useState("");

  // Start every review with an empty note.
  const materialId = material?.id;
  useEffect(() => {
    setNotes("");
  }, [materialId]);

  if (!material) return null;

  // Client and requester come from the client master, not from the request itself.
  const cliente = clientes.find((c) => c.name === material.clientName);
  const pendiente = material.status === "Pendiente";
  const rejectBlocked = notes.trim().length === 0;

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle de solicitud POP"
      width="max-w-lg"
      footer={
        <div className="flex justify-end gap-3 w-full">
          {pendiente ? (
            <>
              <Button
                variant="secondary"
                className="px-6 text-xs h-9"
                disabled={rejectBlocked}
                title={rejectBlocked ? "Indica el motivo del rechazo" : undefined}
                onClick={() => {
                  resolverPop(material.id, "Rechazada", notes.trim());
                  onClose();
                }}
              >
                Rechazar
              </Button>
              <Button
                className="px-6 text-xs h-9"
                onClick={() => {
                  resolverPop(material.id, "Aprobada", notes.trim());
                  onClose();
                }}
              >
                Aprobar
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={onClose} className="px-6 text-xs h-9">
              Cerrar
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Title & Badge */}
        <div className="pb-3 border-b border-zinc-100 flex items-center justify-between">
          <span className="text-base font-extrabold text-zinc-950">{material.code}</span>
          <Badge
            variant={
              material.status === "Aprobada"
                ? "success"
                : material.status === "Pendiente"
                ? "warning"
                : "danger"
            }
          >
            {material.status}
          </Badge>
        </div>

        {/* Metadata Details */}
        <div className="space-y-2 py-1 text-xs">
          <div className="flex justify-between">
            <span className="text-zinc-500">Cliente</span>
            <span className="font-semibold text-zinc-900">
              {cliente ? `${cliente.name} · ${cliente.code}` : material.clientName}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-500">Solicitante</span>
            <span className="text-zinc-800">
              {cliente ? `${cliente.seller} · Comercial` : "Sin asignar"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-500">Marca</span>
            <span className="font-semibold text-zinc-900">{material.brand || "—"}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-500">Material</span>
            <span className="text-zinc-800">{material.material}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-500">Cantidad</span>
            <span className="font-semibold text-zinc-900">
              {material.quantity} {material.quantity === 1 ? "unidad" : "unidades"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-500">Motivo</span>
            <span className="text-zinc-800">{material.reason || "—"}</span>
          </div>
        </div>

        <div className="border-t border-zinc-100 pt-3 space-y-1.5">
          <h4 className="text-xs font-bold text-zinc-900">Observaciones</h4>
          <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-lg text-zinc-700 leading-relaxed">
            {material.observations || "Sin observaciones."}
          </div>
        </div>

        {/* Foto de referencia */}
        <div className="space-y-2 pt-1">
          <h4 className="text-xs font-bold text-zinc-900">Foto de referencia</h4>

          <div className="h-48 rounded-lg bg-zinc-900 border border-zinc-300 relative overflow-hidden flex flex-col justify-end p-4 shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 z-10" />
            <div className="absolute inset-0 bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />

            {/* Stand Graphic Representation */}
            <div className="absolute inset-0 flex items-center justify-center opacity-85 pointer-events-none">
              <div className="w-36 h-36 border border-zinc-700 bg-zinc-950/80 rounded-lg flex flex-col items-center justify-between p-2 shadow-2xl">
                <span className="text-2xs font-extrabold tracking-wider text-white bg-zinc-800 px-2 py-0.5 rounded uppercase">
                  {material.brand || "—"}
                </span>
                <div className="grid grid-cols-2 gap-1 w-full px-1">
                  <div className="h-6 bg-zinc-800 rounded-sm flex items-center justify-center text-3xs text-zinc-300">
                    Prod 1
                  </div>
                  <div className="h-6 bg-zinc-800 rounded-sm flex items-center justify-center text-3xs text-zinc-300">
                    Prod 2
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1 w-full px-1">
                  <div className="h-6 bg-zinc-800 rounded-sm flex items-center justify-center text-3xs text-zinc-300">
                    Prod 3
                  </div>
                  <div className="h-6 bg-zinc-800 rounded-sm flex items-center justify-center text-3xs text-zinc-300">
                    Prod 4
                  </div>
                </div>
                <span className="text-3xs text-zinc-400">{material.material}</span>
              </div>
            </div>

            <div className="relative z-20 flex items-center justify-between">
              <span className="text-xs font-bold text-white drop-shadow-xs">
                {material.material} {material.brand}
              </span>
              <span className="text-2xs text-zinc-300">Imagen referencial</span>
            </div>
          </div>
        </div>

        {/* Decisión */}
        {pendiente && (
          <div className="pt-2 border-t border-zinc-100 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-zinc-900">
                Observaciones de la decisión (obligatorio al rechazar)
              </label>
              <span className="text-2xs text-zinc-400">{notes.length}/250</span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={250}
              placeholder="Indica el motivo de la decisión"
              className="w-full rounded-md border border-zinc-200 bg-white p-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
            />
          </div>
        )}

        {/* Historial */}
        <div className="space-y-2.5 pt-2 border-t border-zinc-100">
          <h4 className="text-xs font-bold text-zinc-900">Historial</h4>

          <div className="space-y-2 pl-1">
            <div className="flex items-center gap-2.5 text-2xs text-zinc-700">
              <span className="w-2 h-2 rounded-full bg-zinc-900 shrink-0" />
              <span>Registrada desde la app comercial</span>
            </div>

            <div
              className={`flex items-center gap-2.5 text-2xs ${
                pendiente ? "text-zinc-500" : "text-zinc-700"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${pendiente ? "bg-zinc-300" : "bg-zinc-900"}`}
              />
              <span>
                {pendiente
                  ? "Pendiente de revisión"
                  : `${material.status} por supervisión${
                      material.decisionNotes ? `: ${material.decisionNotes}` : ""
                    }`}
              </span>
            </div>
          </div>

          <div className="p-2.5 bg-zinc-100/90 rounded-lg flex items-center gap-2 text-2xs text-zinc-600 mt-2">
            <Info className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
            <span>La solicitud no confirma disponibilidad ni salida de inventario.</span>
          </div>
        </div>
      </div>
    </SideDrawer>
  );
};
