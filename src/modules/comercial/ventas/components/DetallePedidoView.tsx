"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, CheckCircle2, Info } from "lucide-react";
import { PageHeader } from "@/shared/patterns/PageHeader";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Tabs } from "@/shared/components/ui/tabs";
import { formatCurrency } from "@/shared/lib/utils";
import { toSortKey } from "@/shared/lib/date";
import { useDemo, useLivePedido } from "@/shared/state/demo-store";
import { Pedido } from "../models/venta.model";
import { quantityMetrics, unitsLabel } from "../lib/metrics";
import { PedidoStatusCards } from "./PedidoStatusCards";
import { PedidoResumenTab } from "./PedidoResumenTab";
import { PedidoProductosTab } from "./PedidoProductosTab";
import { PedidoHistorialTab } from "./PedidoHistorialTab";

interface DetallePedidoViewProps {
  pedido: Pedido;
}

export const DetallePedidoView: React.FC<DetallePedidoViewProps> = ({ pedido: seed }) => {
  const pedido = useLivePedido(seed);
  const { confirmarReservaSap } = useDemo();
  const [activeTab, setActiveTab] = useState("resumen");

  const metrics = quantityMetrics(pedido.items);
  const timeline = useMemo(
    () => [...pedido.timeline].sort((a, b) => toSortKey(b.date, b.time) - toSortKey(a.date, a.time)),
    [pedido.timeline]
  );
  const canConfirmReserva =
    pedido.paymentStatus === "Conciliado" && pedido.reservationStatus === "Por confirmar";

  const tabs = [
    { id: "resumen", label: "Resumen" },
    { id: "productos", label: "Productos" },
    { id: "pago_reserva", label: "Pago y reserva" },
    { id: "historial", label: "Historial" },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumbs={[
          { label: "Comercial", href: "/comercial/clientes/" },
          { label: "Ventas", href: "/comercial/ventas/" },
          { label: "Pedidos", href: "/comercial/ventas/" },
          { label: pedido.code },
        ]}
        title={`Pedido ${pedido.code}`}
        subtitle={`${pedido.clienteName} | RUC ${pedido.ruc}`}
      />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "resumen" && <PedidoResumenTab pedido={pedido} />}
      {activeTab === "productos" && <PedidoProductosTab pedido={pedido} />}
      {activeTab === "historial" && <PedidoHistorialTab pedido={pedido} />}

      {activeTab === "pago_reserva" && (
        <div className="space-y-5">
          <PedidoStatusCards pedido={pedido} />

          {/* Middle Row: Resumen del Pedido & Reserva */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardContent className="p-5 space-y-3">
                <h3 className="text-xs font-semibold text-zinc-900 border-b border-zinc-100 pb-2">
                  Resumen del pedido
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-600">
                    <span>Total solicitado</span>
                    <span className="font-medium">{unitsLabel(metrics.requested)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Aceptadas</span>
                    <span className="font-medium">{unitsLabel(metrics.offered)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>No atendidas</span>
                    <span
                      className={`font-medium ${metrics.unattended > 0 ? "text-amber-600" : ""}`}
                    >
                      {unitsLabel(metrics.unattended)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline font-bold text-sm text-zinc-900 pt-3 border-t border-zinc-100">
                    <span>Total del pedido</span>
                    <span className="text-base">{formatCurrency(pedido.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-3">
                <h3 className="text-xs font-semibold text-zinc-900 border-b border-zinc-100 pb-2">
                  {pedido.reservationStatus === "Confirmada" ? "Reserva de stock" : "Reserva provisional"}
                </h3>
                <div className="flex items-start gap-3 p-3 bg-zinc-50 rounded-lg">
                  {pedido.reservationStatus === "Confirmada" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                  ) : (
                    <Calendar className="h-5 w-5 text-zinc-500 mt-0.5" />
                  )}
                  <div>
                    <p className="text-xs font-bold text-zinc-900">
                      {pedido.reservationStatus === "Confirmada"
                        ? "Reserva confirmada por SAP"
                        : "Duración propuesta: 6 horas"}
                    </p>
                    <p className="text-2xs text-zinc-500 mt-0.5">
                      {pedido.reservationStatus === "Confirmada"
                        ? "El stock del pedido quedó comprometido."
                        : "Provisional, a la espera de confirmación en SAP."}
                    </p>
                  </div>
                </div>

                {/* The ERP answers on its own; this lets the demo play that step. */}
                <div className="p-3 border border-dashed border-zinc-300 rounded-lg space-y-2">
                  <p className="text-2xs font-semibold text-zinc-700 flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5" /> Simulación de demo
                  </p>
                  <p className="text-2xs text-zinc-500">
                    SAP confirma la reserva una vez conciliado el pago. En producción esta respuesta
                    llega por la integración.
                  </p>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={!canConfirmReserva}
                    onClick={() => confirmarReservaSap(pedido.id)}
                    className="text-xs"
                  >
                    {pedido.reservationStatus === "Confirmada"
                      ? "Reserva ya confirmada"
                      : pedido.paymentStatus === "Conciliado"
                      ? "Simular confirmación de SAP"
                      : "Requiere pago conciliado"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline Card */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="text-xs font-semibold text-zinc-900 border-b border-zinc-100 pb-2">
                Línea de tiempo
              </h3>

              <div className="space-y-4 text-xs pl-3 border-l border-zinc-200 ml-2">
                {timeline.map((item, idx) => (
                  <div key={`${item.date}-${item.time}-${item.title}-${idx}`} className="relative pl-3">
                    <span className="absolute -left-[calc(1.0625rem+0.5px)] top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-800 ring-2 ring-white" />
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-zinc-900">{item.time}</span>
                      <span className="font-semibold text-zinc-800">{item.title}</span>
                      <span className="text-2xs text-zinc-400">{item.date}</span>
                    </div>
                    {item.detail && <p className="text-2xs text-zinc-500 mt-0.5">{item.detail}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ocultado temporalmente: acción ejecutada en App Móvil / ERP (SAP/Defontana)
          Al reactivar: importar ReportarPagoDrawer, declarar
          const [isReportarOpen, setIsReportarOpen] = useState(false) y abrirlo con un botón "Reportar pago".
      <ReportarPagoDrawer
        isOpen={isReportarOpen}
        onClose={() => setIsReportarOpen(false)}
        pedidoCode={pedido.code}
        clientName={pedido.clienteName}
        totalAmount={pedido.total}
      />
      */}

      <div>
        <Link
          href="/comercial/ventas/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver a ventas
        </Link>
      </div>
    </div>
  );
};
