"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Info, Package, FileText } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { formatCurrency } from "@/shared/lib/utils";
import { Pedido } from "../models/venta.model";
import { quantityMetrics, unitsLabel } from "../lib/metrics";
import { PedidoStatusCards } from "./PedidoStatusCards";

interface PedidoProductosTabProps {
  pedido: Pedido;
}

const ProductThumb: React.FC = () => (
  <div className="w-8 h-8 rounded-md bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
    <Package className="h-4 w-4" />
  </div>
);

export const PedidoProductosTab: React.FC<PedidoProductosTabProps> = ({ pedido }) => {
  const metrics = quantityMetrics(pedido.items);
  const unattendedItems = pedido.items.filter((item) => item.requestedQty > item.offeredQty);

  return (
    <div className="space-y-5">
      <PedidoStatusCards pedido={pedido} />

      {/* Quantity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-xs border-zinc-200">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-zinc-100 text-zinc-700 shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xs text-zinc-400 font-medium">Solicitadas</p>
              <p className="text-xl font-extrabold text-zinc-950 mt-0.5">{unitsLabel(metrics.requested)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-zinc-200">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-zinc-100 text-zinc-700 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xs text-zinc-400 font-medium">Aceptadas</p>
              <p className="text-xl font-extrabold text-zinc-950 mt-0.5">{unitsLabel(metrics.offered)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-zinc-200">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div
              className={`p-2.5 rounded-lg bg-zinc-100 shrink-0 ${
                metrics.unattended > 0 ? "text-amber-600" : "text-zinc-700"
              }`}
            >
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xs text-zinc-400 font-medium">No atendidas</p>
              <p
                className={`text-xl font-extrabold mt-0.5 ${
                  metrics.unattended > 0 ? "text-amber-600" : "text-zinc-950"
                }`}
              >
                {unitsLabel(metrics.unattended)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 1: Detalle de productos */}
      <Card className="shadow-xs border-zinc-200">
        <CardContent className="p-4 space-y-3">
          <h3 className="text-xs font-bold text-zinc-900 border-b border-zinc-100 pb-2">
            Detalle de productos
          </h3>

          <div className="overflow-x-auto border border-zinc-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 text-zinc-600 font-semibold border-b border-zinc-200">
                <tr>
                  <th className="py-2.5 px-3">Producto</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Solicitadas</th>
                  <th className="py-2.5 px-3">Aceptadas</th>
                  <th className="py-2.5 px-3">No atendidas</th>
                  <th className="py-2.5 px-3">Precio unitario</th>
                  <th className="py-2.5 px-3 text-right">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                {pedido.items.map((item) => (
                  <tr key={item.productoId} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <ProductThumb />
                        <span className="font-semibold text-zinc-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-zinc-600 font-mono text-2xs">{item.sku}</td>
                    <td className="py-3 px-3 text-zinc-800">{item.requestedQty}</td>
                    <td className="py-3 px-3 font-semibold text-zinc-900">{item.offeredQty}</td>
                    <td
                      className={`py-3 px-3 font-semibold ${
                        item.requestedQty > item.offeredQty ? "text-amber-600" : "text-zinc-800"
                      }`}
                    >
                      {item.requestedQty - item.offeredQty}
                    </td>
                    <td className="py-3 px-3 text-zinc-800">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 px-3 text-right font-bold text-zinc-900">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-zinc-50/90 border-t border-zinc-200">
                <tr>
                  <td colSpan={6} className="py-3 px-3 text-right text-xs font-semibold text-zinc-700">
                    Total del pedido
                  </td>
                  <td className="py-3 px-3 text-right text-base font-bold text-zinc-950">
                    {formatCurrency(pedido.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Demanda no atendida */}
      {unattendedItems.length > 0 && (
        <Card className="shadow-xs border-zinc-200">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-xs font-bold text-zinc-900 border-b border-zinc-100 pb-2">
              Demanda no atendida
            </h3>

            <div className="overflow-x-auto border border-zinc-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/80 text-zinc-600 font-semibold border-b border-zinc-200">
                  <tr>
                    <th className="py-2.5 px-3">Producto</th>
                    <th className="py-2.5 px-3">Cantidad</th>
                    <th className="py-2.5 px-3">Motivo</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {unattendedItems.map((item) => (
                    <tr key={item.productoId} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <ProductThumb />
                          <span className="font-semibold text-zinc-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-amber-600">
                        {unitsLabel(item.requestedQty - item.offeredQty)}
                      </td>
                      <td className="py-3 px-3 text-zinc-600">Stock insuficiente al registrar</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-2.5 bg-zinc-50 border border-zinc-100 rounded-lg flex items-center gap-2 text-2xs text-zinc-600">
              <div className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center shrink-0">
                <Info className="h-3 w-3" />
              </div>
              <span>
                Se solicitaron {metrics.requested} unidades y se aceptaron {metrics.offered}. La
                diferencia no se cobra ni genera una entrega futura automática.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer Notes */}
      <div className="flex items-center justify-between text-2xs text-zinc-400 pt-2 border-t border-zinc-100">
        <div className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          <span>
            La disponibilidad mostrada corresponde a la validación del pedido; no representa stock actual en tiempo real.
          </span>
        </div>
        <span>Datos ficticios para demostración</span>
      </div>
    </div>
  );
};
