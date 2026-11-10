"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckSquare, Package } from "lucide-react";
import { PageHeader } from "@/shared/patterns/PageHeader";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Select } from "@/shared/components/ui/select";
import { formatCurrency } from "@/shared/lib/utils";

export const NuevoPedidoView: React.FC = () => {
  const router = useRouter();
  const [client, setClient] = useState("cl-001");
  const [paymentMode, setPaymentMode] = useState("Contado");
  const [clientAccepts, setClientAccepts] = useState(true);

  const product = {
    name: "Bravery Adulto 7 kg",
    sku: "BRA-AD-7",
    requested: 10,
    available: 8,
    accepted: 8,
    price: 180.0,
    total: 1440.0,
  };

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumbs={[
          { label: "Comercial", href: "/comercial/clientes/" },
          { label: "Ventas", href: "/comercial/ventas/" },
          { label: "Pedidos", href: "/comercial/ventas/" },
          { label: "Nuevo" },
        ]}
        title="Nuevo pedido"
      />

      <div className="space-y-4">
        {/* Client Selection */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="max-w-md">
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Cliente
              </label>
              <Select
                value={client}
                onChange={(e) => setClient(e.target.value)}
                options={[
                  { label: "Pet Market (CL-001)", value: "cl-001" },
                  { label: "Veterinaria Huellitas (CL-002)", value: "cl-002" },
                  { label: "Mundo Animal (CL-003)", value: "cl-003" },
                ]}
              />
            </div>

            {/* Products Table */}
            <div className="border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-medium">
                  <tr>
                    <th className="px-3 py-2">Producto</th>
                    <th className="px-3 py-2 text-center">Solicitadas</th>
                    <th className="px-3 py-2 text-center">Disponibles</th>
                    <th className="px-3 py-2 text-center">Aceptadas</th>
                    <th className="px-3 py-2 text-right">Precio unitario</th>
                    <th className="px-3 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 shrink-0">
                          <Package className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900">{product.name}</p>
                          <p className="text-2xs text-zinc-400">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center font-medium">{product.requested}</td>
                    <td className="px-3 py-3 text-center font-medium text-zinc-600">{product.available}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="w-12 inline-block py-1 text-center font-bold bg-zinc-100 rounded text-xs">
                        {product.accepted}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-medium text-zinc-700">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-zinc-900">
                      {formatCurrency(product.total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Accept units checkbox */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={clientAccepts}
                  onChange={(e) => setClientAccepts(e.target.checked)}
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 h-4 w-4"
                />
                <span className="text-xs font-semibold text-zinc-900">
                  Cliente acepta 8 unidades.
                </span>
              </label>
            </div>

            {/* Demand notice */}
            <div className="flex items-center gap-2 p-3 bg-zinc-50 border border-zinc-200 rounded-md text-2xs text-zinc-600">
              <AlertCircle className="h-4 w-4 text-zinc-400 shrink-0" />
              <span>
                2 unidades quedan registradas como demanda no atendida, sin compromiso de entrega.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Split: Payment & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="text-xs font-semibold text-zinc-900 border-b border-zinc-100 pb-2">
                Condiciones de pago
              </h3>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Modo de pago
                </label>
                <Select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  options={[
                    { label: "Contado", value: "Contado" },
                    { label: "Crédito 15 días", value: "Crédito 15 días" },
                    { label: "Crédito 30 días", value: "Crédito 30 días" },
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="text-xs font-semibold text-zinc-900 border-b border-zinc-100 pb-2">
                Resumen del pedido
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(product.total)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-zinc-900 pt-2 border-t border-zinc-100">
                  <span>Total</span>
                  <span className="text-base">{formatCurrency(product.total)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-zinc-600 pt-1">
                  <span>Estado de pago</span>
                  <span className="flex items-center gap-1.5 font-semibold text-amber-600">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Pago pendiente
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/comercial/ventas/">
            <Button variant="secondary" size="sm">
              Cancelar
            </Button>
          </Link>
          <Link href="/comercial/ventas/pedidos/ped-1042/">
            <Button size="sm">Crear pedido</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
