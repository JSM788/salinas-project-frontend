"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  FileText,
  Calendar,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { PAYMENT_STATUS_LABEL } from "@/modules/comercial/ventas/models/venta.model";
import { unitsLabel } from "@/modules/comercial/ventas/lib/metrics";
import { formatCurrency } from "@/shared/lib/utils";
import { toSortKey } from "@/shared/lib/date";
import { useDemo } from "@/shared/state/demo-store";
import { Cliente } from "../../../models/cliente.model";

interface ClienteComprasTabProps {
  cliente: Cliente;
}

const CURRENT_MONTH_SUFFIX = "oct. 2026";

export const ClienteComprasTab: React.FC<ClienteComprasTabProps> = ({ cliente }) => {
  const { pedidos } = useDemo();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const compras = useMemo(
    () =>
      pedidos
        .filter((p) => p.clienteId === cliente.id)
        .sort((a, b) => toSortKey(b.date, b.time) - toSortKey(a.date, a.time)),
    [pedidos, cliente.id]
  );

  const summaryOf = (items: (typeof compras)[number]["items"]) =>
    items.map((i) => `${i.name} · ${unitsLabel(i.offeredQty)}`).join(", ");

  const filteredCompras = compras.filter((p) => {
    const matchesSearch =
      !search ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      summaryOf(p.items).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "Todos" || p.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const monthOrders = compras.filter((p) => p.date.endsWith(CURRENT_MONTH_SUFFIX));
  const monthTotal = monthOrders.reduce((sum, p) => sum + p.total, 0);

  // Units bought per product across every order of this customer.
  const topProducts = useMemo(() => {
    const totals = new Map<string, number>();
    for (const pedido of compras) {
      for (const item of pedido.items) {
        totals.set(item.name, (totals.get(item.name) ?? 0) + item.offeredQty);
      }
    }
    return Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [compras]);
  const maxUnits = topProducts[0]?.[1] ?? 1;

  const unattended = compras.flatMap((p) =>
    p.items
      .filter((i) => i.requestedQty > i.offeredQty)
      .map((i) => ({ pedido: p.code, item: i }))
  );

  return (
    <div className="space-y-5">
      {/* Header & KPI Summary Cards */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-zinc-950">Historial de compras</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Pedidos comerciales registrados para este cliente.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-3 p-3 bg-white border border-zinc-200 rounded-lg shadow-xs min-w-44">
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-700">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div>
              <p className="text-2xs text-zinc-400 font-medium">Compras de octubre</p>
              <p className="text-sm font-bold text-zinc-950">{formatCurrency(monthTotal)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white border border-zinc-200 rounded-lg shadow-xs min-w-36">
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-700">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-2xs text-zinc-400 font-medium">Pedidos del mes</p>
              <p className="text-sm font-bold text-zinc-950">{monthOrders.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white border border-zinc-200 rounded-lg shadow-xs min-w-44">
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-700">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-2xs text-zinc-400 font-medium">Última compra</p>
              <p className="text-sm font-bold text-zinc-950">{compras[0]?.date ?? "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="shadow-xs border-zinc-200">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex-1 max-w-sm">
              <Input
                placeholder="Buscar por pedido o producto"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="h-4 w-4 text-zinc-400" />}
              />
            </div>

            <div className="w-48">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: "Pago: Todos", value: "Todos" },
                  { label: PAYMENT_STATUS_LABEL.Pendiente, value: "Pendiente" },
                  { label: PAYMENT_STATUS_LABEL.Conciliado, value: "Conciliado" },
                  { label: PAYMENT_STATUS_LABEL.Observado, value: "Observado" },
                ]}
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-zinc-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 text-zinc-600 font-semibold border-b border-zinc-200">
                <tr>
                  <th className="py-2.5 px-3">Pedido</th>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Productos</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Estado de pago</th>
                  <th className="py-2.5 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                {filteredCompras.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-zinc-400">
                      {compras.length === 0
                        ? "Este cliente aún no registra pedidos."
                        : "No se encontraron compras con los filtros seleccionados."}
                    </td>
                  </tr>
                ) : (
                  filteredCompras.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3 px-3 font-semibold text-zinc-900">
                        <Link href={`/comercial/ventas/pedidos/${item.id}/`} className="hover:underline">
                          {item.code}
                        </Link>
                      </td>
                      <td className="py-3 px-3 text-zinc-600">{item.date}</td>
                      <td className="py-3 px-3 text-zinc-800">{summaryOf(item.items)}</td>
                      <td className="py-3 px-3 font-semibold text-zinc-900">
                        {formatCurrency(item.total)}
                      </td>
                      <td className="py-3 px-3">
                        {item.paymentStatus === "Conciliado" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-zinc-900 text-white">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />{" "}
                            {PAYMENT_STATUS_LABEL.Conciliado}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                            {item.paymentStatus === "Observado" ? (
                              <AlertCircle className="h-3 w-3 text-rose-600" />
                            ) : (
                              <Clock className="h-3 w-3 text-zinc-500" />
                            )}{" "}
                            {PAYMENT_STATUS_LABEL[item.paymentStatus]}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/comercial/ventas/pedidos/${item.id}/`}
                          className="text-xs font-semibold text-zinc-900 hover:underline"
                        >
                          Ver pedido
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="text-2xs text-zinc-500 pt-1">
            Mostrando {filteredCompras.length} de {compras.length} registros
          </div>
        </CardContent>
      </Card>

      {/* Bottom Row: Productos más comprados & Demanda no atendida */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 shadow-xs border-zinc-200">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-900 border-b border-zinc-100 pb-2">
              Productos más comprados
            </h3>

            {topProducts.length === 0 ? (
              <p className="text-xs text-zinc-400">Sin compras registradas.</p>
            ) : (
              <div className="space-y-3.5 text-xs">
                {topProducts.map(([name, units]) => (
                  <div key={name} className="flex items-center justify-between gap-4">
                    <span className="w-44 text-zinc-800 font-medium truncate">{name}</span>
                    <div className="flex-1 h-3 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-zinc-600 rounded-full"
                        style={{ width: `${Math.round((units / maxUnits) * 100)}%` }}
                      />
                    </div>
                    <span className="w-24 text-right font-semibold text-zinc-900">{unitsLabel(units)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-xs border-zinc-200">
          <CardContent className="p-5 space-y-3.5 flex flex-col justify-between h-full">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-zinc-900 border-b border-zinc-100 pb-2">
                Demanda no atendida
              </h3>

              {unattended.length === 0 ? (
                <p className="text-xs text-zinc-500">Sin demanda no atendida registrada.</p>
              ) : (
                unattended.map(({ pedido, item }) => (
                  <div
                    key={`${pedido}-${item.productoId}`}
                    className="flex items-start gap-3 p-3 bg-zinc-50 border border-zinc-100 rounded-lg"
                  >
                    <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                      !
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900">
                        {unitsLabel(item.requestedQty - item.offeredQty)} · {item.name}
                      </p>
                      <p className="text-2xs text-zinc-500 mt-0.5">
                        {pedido} · Solicitadas: {item.requestedQty} · Aceptadas: {item.offeredQty}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-2.5 bg-zinc-100/90 rounded-lg flex items-center gap-2 text-2xs text-zinc-600">
              <Info className="h-4 w-4 shrink-0 text-zinc-500" />
              <span>Dato comercial; no implica compromiso de entrega.</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Notes */}
      <div className="flex items-center justify-between text-2xs text-zinc-400 pt-2 border-t border-zinc-100">
        <span>Pedidos: plataforma comercial · Facturación: SAP</span>
        <span>Datos ficticios para demostración</span>
      </div>
    </div>
  );
};
