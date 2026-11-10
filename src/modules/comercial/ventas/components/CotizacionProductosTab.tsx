"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Box, Info, Package } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { formatCurrency } from "@/shared/lib/utils";
import { Cotizacion, QUOTE_NO_STOCK_RESERVATION_NOTE } from "../models/venta.model";
import { quantityMetrics } from "../lib/metrics";

interface CotizacionProductosTabProps {
  cotizacion: Cotizacion;
}

const ProductThumb: React.FC = () => (
  <div className="w-8 h-8 rounded-md bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
    <Package className="h-4 w-4" />
  </div>
);

export const CotizacionProductosTab: React.FC<CotizacionProductosTabProps> = ({ cotizacion }) => {
  const { items } = cotizacion;
  const metrics = quantityMetrics(items);
  const unattendedItems = items.filter((item) => item.requestedQty > item.offeredQty);

  const cards = [
    {
      label: "Solicitadas",
      value: metrics.requested,
      hint: "Cantidad solicitada por el cliente.",
      icon: <Box className="h-5 w-5" />,
    },
    {
      label: "Ofrecidas",
      value: metrics.offered,
      hint: "Cantidad que se está cotizando.",
      icon: <Box className="h-5 w-5" />,
    },
    {
      label: "No atendidas",
      value: metrics.unattended,
      hint: "Cantidad que no se pudo atender.",
      icon: <Info className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Quantity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card key={card.label} className="shadow-xs border-zinc-200">
            <CardContent className="p-4 flex items-start gap-3.5">
              <div className="p-2.5 rounded-full bg-zinc-100 text-zinc-700 shrink-0">{card.icon}</div>
              <div>
                <p className="text-xs font-medium text-zinc-700">{card.label}</p>
                <p className="mt-0.5 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-zinc-950">{card.value}</span>
                  <span className="text-xs text-zinc-500">unidades</span>
                </p>
                <p className="text-2xs text-zinc-500 mt-1">{card.hint}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Section 1: Productos cotizados */}
      <Card className="shadow-xs border-zinc-200">
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-bold text-zinc-900">Productos cotizados</h3>

          <div className="overflow-x-auto border border-zinc-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 text-zinc-700 font-semibold border-b border-zinc-200">
                <tr className="divide-x divide-zinc-200">
                  <th className="py-2.5 px-3">Producto</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3 text-center">Solicitadas</th>
                  <th className="py-2.5 px-3 text-center">Ofrecidas</th>
                  <th className="py-2.5 px-3 text-center">No atendidas</th>
                  <th className="py-2.5 px-3 text-center">Precio unitario</th>
                  <th className="py-2.5 px-3 text-center">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                {items.map((item) => (
                  <tr
                    key={item.productoId}
                    className="divide-x divide-zinc-200 hover:bg-zinc-50/70 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <ProductThumb />
                        <span className="font-medium text-zinc-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-zinc-700">{item.sku}</td>
                    <td className="py-3 px-3 text-center text-zinc-800">{item.requestedQty}</td>
                    <td className="py-3 px-3 text-center text-zinc-800">{item.offeredQty}</td>
                    <td className="py-3 px-3 text-center text-zinc-800">
                      {item.requestedQty - item.offeredQty}
                    </td>
                    <td className="py-3 px-3 text-center text-zinc-800">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-3 px-3 text-center text-zinc-800">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full sm:w-80 border border-zinc-200 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-700">
                <span>
                  Valor solicitado{" "}
                  <span className="text-zinc-500">({metrics.requested} unidades)</span>
                </span>
                <span>{formatCurrency(metrics.requestedValue)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-zinc-100 pt-2">
                <span className="font-semibold text-zinc-900">
                  Total cotizado{" "}
                  <span className="font-normal text-zinc-500">({metrics.offered} unidades)</span>
                </span>
                <span className="text-xl font-extrabold text-zinc-950">
                  {formatCurrency(metrics.offeredValue)}
                </span>
              </div>
              <p className="text-2xs text-zinc-500 border-t border-zinc-100 pt-2">
                El total cotizado incluye solo las cantidades ofrecidas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Demanda no atendida */}
      {unattendedItems.length > 0 && (
        <Card className="shadow-xs border-zinc-200">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-bold text-zinc-900">Demanda no atendida</h3>

            <div className="overflow-x-auto border border-zinc-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/80 text-zinc-700 font-semibold border-b border-zinc-200">
                  <tr className="divide-x divide-zinc-200">
                    <th className="py-2.5 px-3">Producto</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3 text-center">Cantidad</th>
                    <th className="py-2.5 px-3">Motivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 bg-white">
                  {unattendedItems.map((item) => (
                    <tr
                      key={item.productoId}
                      className="divide-x divide-zinc-200 hover:bg-zinc-50/70 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <ProductThumb />
                          <span className="font-medium text-zinc-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-zinc-700">{item.sku}</td>
                      <td className="py-3 px-3 text-center text-zinc-800">
                        {item.requestedQty - item.offeredQty}
                      </td>
                      <td className="py-3 px-3 text-zinc-700">Stock insuficiente al cotizar.</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-2.5 bg-zinc-50 border border-zinc-100 rounded-lg flex items-center gap-2 text-2xs text-zinc-600">
              <div className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center shrink-0">
                <Info className="h-3 w-3" />
              </div>
              <span>Se registra para análisis de demanda; no genera entrega futura automática.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Note */}
      <div className="p-3 bg-zinc-100 border border-zinc-200 rounded-lg flex items-center gap-2.5 text-2xs text-zinc-600">
        <div className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center shrink-0">
          <Info className="h-3 w-3" />
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-900">{QUOTE_NO_STOCK_RESERVATION_NOTE.split(". ")[0]}.</p>
          <p>{QUOTE_NO_STOCK_RESERVATION_NOTE.split(". ")[1]}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <Link
          href="/comercial/ventas/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 rounded-md bg-white text-xs font-medium text-zinc-800 hover:bg-zinc-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver a cotizaciones
        </Link>
        <span className="text-2xs text-zinc-400">Datos ficticios para demostración.</span>
      </div>
    </div>
  );
};
