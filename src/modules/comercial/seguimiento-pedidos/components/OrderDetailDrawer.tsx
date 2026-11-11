"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  Clock,
  Expand,
  Info,
  Truck,
  X,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import { Tabs } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";
import { BrangoTrackedOrder } from "../models/brango-order.model";
import { DeliveryEvidencePreview } from "./DeliveryEvidencePreview";
import { DeliveryStatusBadge } from "./DeliveryStatusBadge";

interface OrderDetailDrawerProps {
  order: BrangoTrackedOrder | null;
  onClose: () => void;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  order,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"estado" | "historial">("estado");
  const [evidenceExpanded, setEvidenceExpanded] = useState(false);

  useEffect(() => {
    setActiveTab("estado");
    setEvidenceExpanded(false);
  }, [order?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && order && !evidenceExpanded) {
        onClose();
      }
    };
    if (order) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [order, evidenceExpanded, onClose]);

  if (!order) return null;

  const renderStepNode = (
    status: BrangoTrackedOrder["status"],
    isCurrent?: boolean
  ) => {
    if (!isCurrent) {
      return (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-zinc-400 ring-4 ring-white" />
      );
    }

    const Icon =
      status === "entregado"
        ? Check
        : status === "en_transito"
        ? Truck
        : status === "observado"
        ? AlertCircle
        : Clock;

    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white ring-4 ring-white">
        <Icon className="h-3 w-3" />
      </span>
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-40 overflow-hidden">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity duration-200"
          onClick={onClose}
        />

        <div className="fixed inset-y-0 right-0 flex max-w-full pl-8">
          <aside className="w-screen max-w-md bg-white border-l border-zinc-200 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="px-5 pt-4 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-zinc-950">
                    Pedido {order.code}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">{order.customerName}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <DeliveryStatusBadge status={order.status} />
                  <button
                    type="button"
                    aria-label="Cerrar detalle del pedido"
                    onClick={onClose}
                    className="rounded-md p-1 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <Tabs
                  tabs={[
                    { id: "estado", label: "Estado y evidencia" },
                    { id: "historial", label: "Historial" },
                  ]}
                  activeTab={activeTab}
                  onChange={(id) => setActiveTab(id as "estado" | "historial")}
                />
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {activeTab === "estado" ? (
                <>
                  {/* Metadatos del pedido */}
                  <div className="grid grid-cols-3 rounded-lg border border-zinc-200 bg-zinc-50/50 divide-x divide-zinc-200">
                    <div className="p-3">
                      <p className="text-2xs text-zinc-500">Origen</p>
                      <p className="text-xs font-semibold text-zinc-900 mt-0.5">
                        {order.origin}
                      </p>
                    </div>
                    <div className="p-3">
                      <p className="text-2xs text-zinc-500">Comercial</p>
                      <p className="text-xs font-semibold text-zinc-900 mt-0.5 truncate">
                        {order.commercialName}
                      </p>
                    </div>
                    <div className="p-3">
                      <p className="text-2xs text-zinc-500">
                        {order.status === "entregado" ? "Entrega" : "Actualización"}
                      </p>
                      <p className="text-xs font-semibold text-zinc-900 mt-0.5">
                        {order.deliveryDateLabel}
                      </p>
                    </div>
                  </div>

                  {/* Línea de tiempo */}
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-900 mb-3">
                      Seguimiento de entrega
                    </h3>
                    <div className="relative space-y-4 pl-2">
                      {order.timeline.map((step, idx) => {
                        const isLast = idx === order.timeline.length - 1;
                        return (
                          <div key={`${step.label}-${step.time}`} className="relative flex gap-3">
                            {!isLast && (
                              <span
                                className="absolute left-2.5 top-5 -bottom-4 w-px bg-zinc-200"
                                aria-hidden="true"
                              />
                            )}
                            <div className="relative z-10 flex w-5 justify-center pt-0.5 shrink-0">
                              {renderStepNode(step.status, step.isCurrent)}
                            </div>
                            <div className="flex items-start gap-3 min-w-0 flex-1 pb-1">
                              <span className="text-xs font-medium text-zinc-500 tabular-nums w-11 shrink-0 pt-0.5">
                                {step.time}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p
                                  className={cn(
                                    "text-xs font-semibold",
                                    step.isCurrent ? "text-zinc-950" : "text-zinc-800"
                                  )}
                                >
                                  {step.label}
                                </p>
                                <p className="text-2xs text-zinc-500 mt-0.5">
                                  {step.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Evidencia de entrega */}
                  <div className="pt-1">
                    <h3 className="text-xs font-semibold text-zinc-900 mb-2.5">
                      Evidencia de entrega
                    </h3>

                    {order.evidence ? (
                      <div className="space-y-2.5 rounded-xl border border-zinc-200 bg-white p-3">
                        <DeliveryEvidencePreview order={order} />
                        <div className="flex items-center justify-between text-2xs text-zinc-500">
                          <span>{order.evidence.caption}</span>
                          <span>{order.evidence.receivedBy}</span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEvidenceExpanded(true)}
                          className="gap-1.5 text-xs"
                        >
                          <Expand className="h-3.5 w-3.5" />
                          <span>Ampliar evidencia</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/60 p-4 text-center">
                        <p className="text-xs font-medium text-zinc-700">
                          Sin fotografía de entrega disponible
                        </p>
                        <p className="text-2xs text-zinc-500 mt-1">
                          La evidencia aparecerá aquí cuando el transportista confirme la entrega en Brango.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-zinc-900">
                    Eventos sincronizados desde Brango
                  </h3>
                  <div className="space-y-2.5">
                    {order.history.map((event) => (
                      <div
                        key={event.id}
                        className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <DeliveryStatusBadge status={event.status} />
                          <span className="text-2xs text-zinc-500 font-mono">
                            {event.originCode}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-800">{event.note}</p>
                        <div className="flex items-center justify-between text-2xs text-zinc-400">
                          <span>{event.actor}</span>
                          <span>{event.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-200 px-5 py-3.5 bg-zinc-50/70 space-y-2">
              <div className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-2xs text-zinc-600">
                <div className="flex items-center gap-2 min-w-0">
                  <Info className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate">
                    El estado de entrega no confirma el pago del pedido.
                  </span>
                </div>
                <span className="font-mono text-zinc-500 shrink-0">
                  Estado: {order.originCode}
                </span>
              </div>
              <p className="text-3xs text-zinc-400 text-right">
                Vista preliminar · Datos ficticios · Integración Brango pendiente
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Modal para ampliar evidencia */}
      {order.evidence && (
        <Modal
          isOpen={evidenceExpanded}
          onClose={() => setEvidenceExpanded(false)}
          title={`Evidencia de entrega · ${order.code}`}
          subtitle={`${order.customerName} · ${order.evidence.capturedAt}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <DeliveryEvidencePreview order={order} large />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs">
              <div>
                <p className="text-2xs text-zinc-500">Cargo</p>
                <p className="font-semibold text-zinc-900 mt-0.5">
                  {order.evidence.cargoTag}
                </p>
              </div>
              <div>
                <p className="text-2xs text-zinc-500">Recibido por</p>
                <p className="font-semibold text-zinc-900 mt-0.5">
                  {order.evidence.receivedBy}
                </p>
              </div>
              <div>
                <p className="text-2xs text-zinc-500">Observación</p>
                <p className="font-medium text-zinc-700 mt-0.5">
                  {order.evidence.notes}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

