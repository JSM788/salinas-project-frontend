"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SideDrawer } from "@/shared/components/ui/side-drawer";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { PAYMENT_STATUS_LABEL } from "@/modules/comercial/ventas/models/venta.model";
import { formatCurrency } from "@/shared/lib/utils";
import { EXTRACTO_MATCH_LABEL, ExtractoMatch, PagoReportado } from "../models/finanzas.model";
import { CheckCircle2, AlertTriangle, FileText, ExternalLink, Building2 } from "lucide-react";

interface RevisarPagoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pago: PagoReportado | null;
  /** Result of crossing this payment with the imported bank statement, if any. */
  match?: ExtractoMatch;
  onConciliar: (id: string) => void;
  onObservar: (id: string, motivo: string) => void;
}

export const RevisarPagoDrawer: React.FC<RevisarPagoDrawerProps> = ({
  isOpen,
  onClose,
  pago,
  match,
  onConciliar,
  onObservar,
}) => {
  const [observacion, setObservacion] = useState("");
  const [isObserving, setIsObserving] = useState(false);
  const [showVoucher, setShowVoucher] = useState(false);

  if (!pago) return null;

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={() => {
        setIsObserving(false);
        setShowVoucher(false);
        onClose();
      }}
      title={`Conciliación: ${pago.orderCode}`}
      footer={
        <div className="flex items-center justify-between w-full gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              if (isObserving) {
                setIsObserving(false);
              } else {
                onClose();
              }
            }}
            className="px-4"
          >
            Cancelar
          </Button>

          <div className="flex items-center gap-2">
            {!isObserving && pago.status !== "Conciliado" && (
              <Button
                variant="outline"
                onClick={() => setIsObserving(true)}
                className="text-amber-700 border-amber-300 hover:bg-amber-50"
              >
                Observar
              </Button>
            )}

            {isObserving ? (
              <Button
                onClick={() => {
                  onObservar(pago.id, observacion || "Observación de pago");
                  setIsObserving(false);
                  onClose();
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Confirmar observación
              </Button>
            ) : (
              pago.status !== "Conciliado" && (
                <Button
                  onClick={() => {
                    onConciliar(pago.id);
                    onClose();
                  }}
                  className="bg-[#27272a] hover:bg-zinc-800 text-white font-medium flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Conciliar pago
                </Button>
              )
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5 text-xs">
        {/* Header Summary */}
        <div className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-zinc-900">{pago.clientName}</span>
            <Badge
              variant={
                pago.status === "Conciliado"
                  ? "success"
                  : pago.status === "Observado"
                  ? "danger"
                  : "warning"
              }
            >
              {PAYMENT_STATUS_LABEL[pago.status]}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-zinc-500">
            <span>RUC: {pago.clientRuc}</span>
            <span>Vendedor: {pago.seller}</span>
          </div>
          <div className="pt-2 border-t border-zinc-200 flex items-center justify-between">
            <span className="font-semibold text-zinc-700">Monto reportado:</span>
            <span className="font-extrabold text-base text-zinc-950">
              {formatCurrency(pago.amount)}
            </span>
          </div>
        </div>

        {/* Result of the bank statement cross-check */}
        {match && (
          <div
            className={`p-3 rounded-lg border space-y-1 ${
              match.status === "coincide" || match.status === "ya_conciliado"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            <p className="font-bold">Extracto: {EXTRACTO_MATCH_LABEL[match.status]}</p>
            {match.status === "monto_distinto" && match.extractoAmount !== undefined && (
              <p>
                El extracto registra {formatCurrency(match.extractoAmount)}; se reportó{" "}
                {formatCurrency(pago.amount)} (diferencia{" "}
                {formatCurrency(Math.abs(pago.amount - match.extractoAmount))}).
              </p>
            )}
            {match.status === "no_figura" && (
              <p>La operación {pago.operationNumber} no aparece en el archivo importado.</p>
            )}
            {match.status === "coincide" && (
              <p>El N° de operación y el monto coinciden con la fila {match.rowNumber} del extracto.</p>
            )}
          </div>
        )}

        {/* Bank & Operation Info */}
        <div className="space-y-3">
          <h4 className="font-bold text-zinc-900 flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-zinc-500" />
            Datos Bancarios
          </h4>
          <div className="grid grid-cols-2 gap-2 p-3 border border-zinc-200 rounded-lg bg-white">
            <div>
              <p className="text-2xs text-zinc-400">Método de pago</p>
              <p className="font-semibold text-zinc-900 mt-0.5">{pago.paymentMethod}</p>
            </div>
            <div>
              <p className="text-2xs text-zinc-400">N° de Operación</p>
              <p className="font-mono font-semibold text-zinc-900 mt-0.5">{pago.operationNumber}</p>
            </div>
            <div className="col-span-2 pt-2 border-t border-zinc-100">
              <p className="text-2xs text-zinc-400">Cuenta de abono</p>
              <p className="font-medium text-zinc-700 mt-0.5">{pago.bankAccount}</p>
            </div>
            <div className="col-span-2 pt-2 border-t border-zinc-100">
              <p className="text-2xs text-zinc-400">Fecha y hora de reporte</p>
              <p className="font-medium text-zinc-700 mt-0.5">{pago.dateReported}</p>
            </div>
          </div>
        </div>

        {/* Voucher Preview Simulated Box */}
        <div className="space-y-2">
          <h4 className="font-bold text-zinc-900 flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-zinc-500" />
            Comprobante Adjunto (Voucher)
          </h4>
          <div className="border border-dashed border-zinc-300 rounded-lg p-4 bg-zinc-50/70 text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center">
              <FileText className="h-6 w-6 stroke-[1.5]" />
            </div>
            <div>
              <p className="font-semibold text-zinc-800">voucher_{pago.orderCode.toLowerCase()}.pdf</p>
              <p className="text-2xs text-zinc-400">1.2 MB · Subido desde App Móvil por {pago.seller}</p>
            </div>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowVoucher((open) => !open)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-800 hover:text-zinc-950 underline underline-offset-2"
              >
                {showVoucher ? "Ocultar comprobante" : "Ver comprobante"}
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>

            {showVoucher && (
              <div className="mt-2 mx-auto max-w-64 bg-white border border-zinc-200 rounded-md p-3 text-left space-y-1 font-mono text-2xs text-zinc-700 shadow-xs">
                <p className="font-bold text-zinc-900 text-xs">{pago.paymentMethod}</p>
                <p>Operación: {pago.operationNumber}</p>
                <p>Fecha: {pago.dateReported}</p>
                <p>Cuenta: {pago.bankAccount}</p>
                <p className="pt-1 border-t border-zinc-200 text-xs font-bold text-zinc-900">
                  Monto: {formatCurrency(pago.amount)}
                </p>
                <p className="text-zinc-400">El comprobante no confirma el pago por sí solo.</p>
              </div>
            )}
          </div>
        </div>

        {/* Link to full Order */}
        <div className="pt-1 flex items-center justify-between text-xs text-zinc-500 bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
          <span>Pedido vinculado: <strong>{pago.orderCode}</strong></span>
          <Link
            href={`/comercial/ventas/pedidos/${pago.orderId}/`}
            className="font-semibold text-zinc-900 hover:underline flex items-center gap-1"
          >
            Ver pedido
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {/* Observación form if triggered */}
        {isObserving && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
            <div className="flex items-center gap-1.5 text-amber-800 font-bold">
              <AlertTriangle className="h-4 w-4" />
              <span>Motivo de la observación</span>
            </div>
            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Indica el motivo por el cual no se concilia el pago (ej: monto incompleto, voucher ilegible, operación no figura en extracto)..."
              className="w-full text-xs p-2 bg-white border border-amber-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 h-20"
            />
          </div>
        )}
      </div>
    </SideDrawer>
  );
};
