"use client";

import React from "react";
import {
  MapPin,
  User,
  ShoppingBag,
  TrendingUp,
  CreditCard,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { formatCurrency } from "@/shared/lib/utils";
import { getRegistrosVisita } from "@/modules/comercial/visitas-jornadas";
import { useDemo } from "@/shared/state/demo-store";
import { Cliente } from "../../../models/cliente.model";
import { buildClienteActivity } from "../../../lib/activity";

interface ClienteResumenTabProps {
  cliente: Cliente;
  onViewAllActivity: () => void;
}

const ACTIVITY_ICON = {
  Visitas: MapPin,
  Pagos: FileText,
  Pedidos: ShoppingBag,
  Cotizaciones: FileText,
} as const;

export const ClienteResumenTab: React.FC<ClienteResumenTabProps> = ({
  cliente,
  onViewAllActivity,
}) => {
  const { pedidos, cotizaciones } = useDemo();

  const maxPurchase = Math.max(...cliente.purchaseHistory.map((h) => h.amount), 1);
  const chart = cliente.purchaseHistory.map((h) => ({
    month: h.month,
    label:
      h.amount >= 1000
        ? `S/ ${(h.amount / 1000).toFixed(1).replace(".0", "")}k`
        : `S/ ${h.amount}`,
    height: `${Math.max(8, Math.round((h.amount / maxPurchase) * 90))}%`,
  }));

  const recentActivity = buildClienteActivity(
    cliente.id,
    pedidos,
    cotizaciones,
    getRegistrosVisita().filter((r) => r.clientId === cliente.id),
  ).slice(0, 4);

  return (
    <div className="space-y-5">
      {/* Main Info Card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center font-bold text-lg shrink-0">
                {cliente.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-950">{cliente.name}</h2>
                <p className="text-xs text-zinc-500">RUC {cliente.ruc}</p>
                <p className="text-2xs text-zinc-400 mt-0.5">Cliente desde {cliente.since}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 text-xs text-zinc-600">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-zinc-900">{cliente.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-zinc-900">{cliente.seller}</p>
                  <p className="text-2xs text-zinc-400">Vendedor</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards Row */}
      <div className="space-y-1.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3.5">
              <div className="p-2.5 rounded-lg bg-zinc-100 text-zinc-600">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xs text-zinc-500">Última compra</p>
                <p className="text-sm font-bold text-zinc-900">{cliente.lastPurchaseDate}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3.5">
              <div className="p-2.5 rounded-lg bg-zinc-100 text-zinc-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xs text-zinc-500">Compras mes</p>
                <p className="text-sm font-bold text-zinc-900">
                  {formatCurrency(cliente.monthlyPurchases)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3.5">
              <div className="p-2.5 rounded-lg bg-zinc-100 text-zinc-600">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xs text-zinc-500">Crédito disponible</p>
                <p className="text-sm font-bold text-zinc-900">
                  {formatCurrency(cliente.availableCredit)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3.5">
              <div className="p-2.5 rounded-lg bg-zinc-100 text-zinc-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xs text-zinc-500">Deuda vencida</p>
                <p className="text-sm font-bold text-zinc-900">
                  {formatCurrency(cliente.expiredDebt)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <p className="text-right text-2xs text-zinc-400">Datos de SAP · Actualizado 09:00</p>
      </div>

      {/* Bottom Grid: Chart & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-900">Compras de los últimos 6 meses</h3>
            <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-zinc-100">
              {chart.map((bar) => (
                <div
                  key={bar.month}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                >
                  <span className="text-2xs text-zinc-400 font-medium">{bar.label}</span>
                  <div
                    style={{ height: bar.height }}
                    className="w-full max-w-9 bg-zinc-400 hover:bg-zinc-700 rounded-t transition-all"
                  />
                  <span className="text-2xs text-zinc-500 font-medium">{bar.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-zinc-900">Actividad reciente</h3>
              <button
                type="button"
                onClick={onViewAllActivity}
                className="text-2xs text-zinc-500 hover:underline"
              >
                Ver todas
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {recentActivity.length === 0 && (
                <p className="text-zinc-400">Este cliente aún no registra actividad.</p>
              )}
              {recentActivity.map((event) => {
                const Icon = ACTIVITY_ICON[event.type];
                return (
                  <div key={event.key} className="flex items-start gap-3">
                    <div className="p-1.5 rounded-full bg-zinc-100 text-zinc-600 mt-0.5">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-zinc-900 font-medium">
                        {event.title}
                        {event.lines[0] ? ` · ${event.lines[0].split(" · ")[0]}` : ""}
                      </p>
                      <p className="text-2xs text-zinc-400">
                        {event.date}, {event.time} · {event.responsible}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

