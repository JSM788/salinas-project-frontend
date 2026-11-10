"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Search,
  Package,
  Trash2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { PageHeader } from "@/shared/patterns/PageHeader";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Select } from "@/shared/components/ui/select";
import { formatCurrency } from "@/shared/lib/utils";
import { SeleccionarProductosModal } from "./SeleccionarProductosModal";

export const NuevaCotizacionView: React.FC = () => {
  const router = useRouter();
  const [client, setClient] = useState("cl-001");
  const [validUntil, setValidUntil] = useState("2025-10-23");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState([
    {
      id: "prod-001",
      name: "Bravery Adulto 7 kg",
      sku: "BRA-AD-7",
      requested: 10,
      available: 8,
      offered: 8,
      price: 180.0,
      total: 1440.0,
    },
  ]);

  const totalAmount = items.reduce((acc, curr) => acc + curr.total, 0);

  const handleSelectProducts = (selected: any[]) => {
    const newItems = selected.map((s) => ({
      id: s.producto.id,
      name: s.producto.name,
      sku: s.producto.sku,
      requested: s.qty,
      available: Math.min(s.qty, s.producto.stock),
      offered: Math.min(s.qty, s.producto.stock),
      price: s.producto.price,
      total: Math.min(s.qty, s.producto.stock) * s.producto.price,
    }));
    setItems(newItems);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumbs={[
          { label: "Comercial", href: "/comercial/clientes/" },
          { label: "Ventas", href: "/comercial/ventas/" },
          { label: "Cotizaciones", href: "/comercial/ventas/" },
          { label: "Nueva" },
        ]}
        title="Nueva cotización"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Form and Products Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
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

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Válida hasta
                  </label>
                  <div className="flex items-center gap-2 px-3 py-1.5 border border-zinc-200 rounded-md text-xs font-medium bg-white text-zinc-800 h-9">
                    <Calendar className="h-4 w-4 text-zinc-500" />
                    <span>23 oct. 2025</span>
                  </div>
                </div>
              </div>

              {/* Products Section */}
              <div className="space-y-3 pt-3 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-zinc-900">Productos</h3>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Seleccionar productos
                  </Button>
                </div>

                <div className="border border-zinc-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-medium">
                      <tr>
                        <th className="px-3 py-2">Producto</th>
                        <th className="px-3 py-2 text-center">Cant. solicitada</th>
                        <th className="px-3 py-2 text-center">Disponible</th>
                        <th className="px-3 py-2 text-center">Cant. ofrecida</th>
                        <th className="px-3 py-2 text-right">Precio unitario</th>
                        <th className="px-3 py-2 text-right">Importe</th>
                        <th className="w-8 px-2 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-50/50">
                          <td className="px-3 py-2.5">
                            <p className="font-semibold text-zinc-900">{item.name}</p>
                            <p className="text-2xs text-zinc-400">{item.sku}</p>
                          </td>
                          <td className="px-3 py-2.5 text-center font-medium">
                            {item.requested}
                          </td>
                          <td className="px-3 py-2.5 text-center font-medium text-zinc-600">
                            {item.available}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <input
                              type="number"
                              value={item.offered}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setItems((prev) =>
                                  prev.map((i) =>
                                    i.id === item.id
                                      ? { ...i, offered: val, total: val * i.price }
                                      : i
                                  )
                                );
                              }}
                              className="w-14 h-7 text-center border border-zinc-200 rounded text-xs focus:outline-none focus:border-zinc-900"
                            />
                          </td>
                          <td className="px-3 py-2.5 text-right font-medium text-zinc-700">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-bold text-zinc-900">
                            {formatCurrency(item.total)}
                          </td>
                          <td className="px-2 py-2.5 text-center">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-zinc-400 hover:text-red-600 p-1 rounded"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-zinc-50 border border-zinc-200 rounded-md text-2xs text-zinc-600">
                  <AlertCircle className="h-4 w-4 text-zinc-400 shrink-0" />
                  <span>Demanda no atendida: 2 unidades.</span>
                </div>
              </div>

              {/* Notes */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Notas
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Agregar observaciones de la cotización..."
                  rows={3}
                  className="w-full rounded-md border border-zinc-200 bg-white p-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 placeholder-zinc-400"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Summary & Actions */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="text-xs font-semibold text-zinc-900 border-b border-zinc-100 pb-2">
                Resumen de cotización
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-zinc-500">
                  <span>Valor solicitado</span>
                  <span>{formatCurrency(totalAmount + 360)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-zinc-900 pt-2 border-t border-zinc-100">
                  <span>Total cotizado</span>
                  <span className="text-base">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-zinc-50 border border-zinc-200 rounded-md text-2xs text-zinc-500">
                <AlertCircle className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                <span>Esta cotización no reserva stock físico.</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Link href="/comercial/ventas/">
              <Button variant="secondary" size="sm">
                Guardar borrador
              </Button>
            </Link>
            <Link href="/comercial/ventas/cotizaciones/cot-1042/">
              <Button size="sm">Crear cotización</Button>
            </Link>
          </div>
        </div>
      </div>

      <SeleccionarProductosModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelectProducts}
      />
    </div>
  );
};
