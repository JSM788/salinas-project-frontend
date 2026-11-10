"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, AlertCircle } from "lucide-react";
import { PageHeader } from "@/shared/patterns/PageHeader";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Tabs } from "@/shared/components/ui/tabs";
import { formatCurrency } from "@/shared/lib/utils";
import { useDemo, useLiveCotizacion } from "@/shared/state/demo-store";
import { Cotizacion } from "../models/venta.model";
import { quantityMetrics, unitsLabel } from "../lib/metrics";
import { CotizacionProductosTab } from "./CotizacionProductosTab";
import { CotizacionHistorialTab } from "./CotizacionHistorialTab";

interface DetalleCotizacionViewProps {
  cotizacion: Cotizacion;
}

export const COTIZACION_STATUS_VARIANT = {
  Aprobada: "success",
  Enviada: "info",
  Borrador: "neutral",
} as const;

export const DetalleCotizacionView: React.FC<DetalleCotizacionViewProps> = ({
  cotizacion: seed,
}) => {
  const cotizacion = useLiveCotizacion(seed);
  const { clientes } = useDemo();
  const [activeTab, setActiveTab] = useState("resumen");

  const cliente = clientes.find((c) => c.id === cotizacion.clienteId);
  const metrics = quantityMetrics(cotizacion.items);
  const offeredItems = cotizacion.items.filter((item) => item.offeredQty > 0);

  const tabs = [
    { id: "resumen", label: "Resumen" },
    { id: "productos", label: "Productos" },
    { id: "historial", label: "Historial" },
  ];

  const showPdfPreview = () => {
    setActiveTab("resumen");
    window.setTimeout(() => {
      document.getElementById("cotizacion-pdf")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumbs={[
          { label: "Comercial", href: "/comercial/clientes/" },
          { label: "Ventas", href: "/comercial/ventas/" },
          { label: "Cotizaciones", href: "/comercial/ventas/" },
          { label: cotizacion.code },
        ]}
        title={cotizacion.code}
        subtitle={cotizacion.clienteName}
        actions={
          <div className="flex items-center gap-2.5">
            <Badge variant={COTIZACION_STATUS_VARIANT[cotizacion.status]}>{cotizacion.status}</Badge>
            <Button variant="secondary" size="sm" className="gap-1.5" onClick={showPdfPreview}>
              <FileText className="h-4 w-4" /> Vista previa PDF
            </Button>
            {/* Ocultado temporalmente: acción ejecutada en App Móvil / ERP (SAP/Defontana)
            <Link href="/comercial/ventas/pedidos/nuevo/">
              <Button size="sm">Convertir a pedido</Button>
            </Link>
            */}
          </div>
        }
      />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "resumen" && (
        <div className="space-y-5">
          {/* Top 2 Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* General Info */}
            <Card>
              <CardContent className="p-5 space-y-3">
                <h3 className="text-xs font-semibold text-zinc-900 border-b border-zinc-100 pb-2">
                  Información general
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Cliente</span>
                    <span className="font-semibold text-zinc-900">{cotizacion.clienteName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Fecha de emisión</span>
                    <span className="text-zinc-800">
                      {cotizacion.date} · {cotizacion.time}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Válida hasta</span>
                    <span className="text-zinc-800">{cotizacion.validUntil}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Estado</span>
                    <Badge variant={COTIZACION_STATUS_VARIANT[cotizacion.status]}>
                      {cotizacion.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Vendedor</span>
                    <span className="text-zinc-800">{cotizacion.seller}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Pedido relacionado</span>
                    {cotizacion.pedidoCode ? (
                      <Link
                        href={`/comercial/ventas/pedidos/${cotizacion.pedidoCode.toLowerCase()}/`}
                        className="font-semibold text-zinc-900 hover:underline"
                      >
                        {cotizacion.pedidoCode}
                      </Link>
                    ) : (
                      <span className="text-zinc-800">Sin convertir</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quote Summary */}
            <Card>
              <CardContent className="p-5 space-y-3">
                <h3 className="text-xs font-semibold text-zinc-900 border-b border-zinc-100 pb-2">
                  Resumen de la cotización
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-600">
                    <span>Cantidad solicitada</span>
                    <span className="font-medium">{unitsLabel(metrics.requested)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Cantidad ofrecida</span>
                    <span className="font-medium">{unitsLabel(metrics.offered)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Cantidad no atendida</span>
                    <span
                      className={`font-medium ${metrics.unattended > 0 ? "text-amber-600" : ""}`}
                    >
                      {unitsLabel(metrics.unattended)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline font-bold text-sm text-zinc-900 pt-3 border-t border-zinc-100">
                    <span>Total cotizado</span>
                    <span className="text-lg">{formatCurrency(cotizacion.amount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PDF Preview & Note */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 id="cotizacion-pdf" className="text-xs font-semibold text-zinc-900 scroll-mt-4">
                Vista previa del PDF
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* PDF Box */}
                <div className="lg:col-span-2 p-6 bg-white border border-zinc-200 rounded-lg shadow-sm space-y-4 font-sans text-xs">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                    <span className="font-black text-sm tracking-wider text-zinc-900 uppercase">
                      AQUAMUNDO
                    </span>
                    <div className="text-right">
                      <p className="font-bold text-zinc-900">COTIZACIÓN {cotizacion.code}</p>
                      <p className="text-2xs text-zinc-400">{cotizacion.date}</p>
                    </div>
                  </div>

                  <div className="text-2xs text-zinc-600 space-y-0.5">
                    <p className="font-bold text-zinc-900">Cliente: {cotizacion.clienteName}</p>
                    {cliente && <p>RUC {cliente.ruc}</p>}
                    {cliente && <p>{cliente.address}</p>}
                  </div>

                  <div className="border border-zinc-100 rounded overflow-hidden">
                    <table className="w-full text-left text-2xs">
                      <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-600">
                        <tr>
                          <th className="px-2 py-1.5">Producto</th>
                          <th className="px-2 py-1.5 text-center">Cantidad</th>
                          <th className="px-2 py-1.5 text-right">Precio unitario</th>
                          <th className="px-2 py-1.5 text-right">Importe</th>
                        </tr>
                      </thead>
                      <tbody>
                        {offeredItems.map((item) => (
                          <tr key={item.productoId}>
                            <td className="px-2 py-2 font-medium">{item.name}</td>
                            <td className="px-2 py-2 text-center">{item.offeredQty}</td>
                            <td className="px-2 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-2 py-2 text-right font-bold">
                              {formatCurrency(item.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="text-right pt-2 border-t border-zinc-100">
                    <span className="font-bold text-xs text-zinc-900">
                      Total: {formatCurrency(cotizacion.amount)}
                    </span>
                  </div>
                </div>

                {/* Stock Warning Box */}
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg flex items-start gap-2.5 text-2xs text-zinc-600 self-start">
                  <AlertCircle className="h-5 w-5 text-zinc-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-zinc-900">Esta cotización no reserva stock.</p>
                    <p>La disponibilidad se revalidará al convertirla a pedido.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <Link
              href="/comercial/ventas/"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Volver a cotizaciones
            </Link>
          </div>
        </div>
      )}

      {activeTab === "productos" && <CotizacionProductosTab cotizacion={cotizacion} />}
      {activeTab === "historial" && <CotizacionHistorialTab cotizacion={cotizacion} />}
    </div>
  );
};
