"use client";

import React, { useMemo } from "react";
import { Banknote, Calendar, CreditCard, FileText, MapPin, Route, UserX } from "lucide-react";
import { DashboardShell } from "@/shared/layout/DashboardShell";
import { formatCurrency } from "@/shared/lib/utils";
import { SCENARIO_DAY, useDemo } from "@/shared/state/demo-store";
import { getRegistrosVisita } from "@/modules/comercial/visitas-jornadas";
import {
  MetricCard,
  PriorityClientsCard,
  RecentActivityCard,
  WeeklySalesChart,
  arrearsSummary,
  monthSummary,
  pendingPayments,
  periodLabel,
  priorityClients,
  recentActivity,
  weeklySales,
} from "@/modules/inicio";

export default function InicioPage() {
  const { clientes, pedidos, pagos, agenda, jornadas } = useDemo();

  const summary = useMemo(() => monthSummary(pedidos, SCENARIO_DAY), [pedidos]);
  const pending = useMemo(() => pendingPayments(pagos), [pagos]);
  const arrears = useMemo(() => arrearsSummary(clientes), [clientes]);
  const priority = useMemo(() => priorityClients(clientes, pagos), [clientes, pagos]);
  const weeks = useMemo(() => weeklySales(pedidos, SCENARIO_DAY), [pedidos]);
  const activity = useMemo(() => recentActivity(pedidos, SCENARIO_DAY), [pedidos]);

  const visitsToday = getRegistrosVisita().filter((r) => r.date === SCENARIO_DAY).length;
  const scheduledToday = agenda.filter((slot) => slot.date === SCENARIO_DAY).length;
  const activeWorkdays = jornadas.filter((j) => j.status === "En jornada").length;

  return (
    <DashboardShell>
      <div className="space-y-5">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Inicio</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Resumen general de la operación comercial</p>
          </div>

          {/* Period covered by the figures (read-only: the dashboard always shows the current month). */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg shadow-2xs self-start sm:self-auto">
            <Calendar className="h-3.5 w-3.5 text-zinc-500" />
            <span>{periodLabel(SCENARIO_DAY)}</span>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            href="/comercial/ventas/"
            icon={<Banknote className="h-5 w-5 stroke-[1.8]" />}
            label="Ventas del mes"
            value={formatCurrency(summary.sales)}
            caption="Pedidos registrados en el mes"
          />
          <MetricCard
            href="/comercial/ventas/"
            icon={<FileText className="h-5 w-5 stroke-[1.8]" />}
            label="Pedidos del mes"
            value={String(summary.orders)}
            caption="Registrados desde la app comercial"
          />
          <MetricCard
            href="/finanzas/"
            icon={<CreditCard className="h-5 w-5 stroke-[1.8]" />}
            label="Pagos por conciliar"
            value={String(pending.count)}
            caption={`${formatCurrency(pending.amount)} pendientes en Finanzas`}
          />
          <MetricCard
            href="/comercial/clientes/"
            icon={<UserX className="h-5 w-5 stroke-[1.8]" />}
            label="Clientes con atraso"
            value={String(arrears.count)}
            caption={`${formatCurrency(arrears.amount)} de deuda vencida`}
          />
          <MetricCard
            href="/comercial/visitas-jornadas/"
            icon={<MapPin className="h-5 w-5 stroke-[1.8]" />}
            label="Visitas de hoy"
            value={String(visitsToday)}
            caption={`Registradas de ${scheduledToday} programadas`}
          />
          <MetricCard
            href="/comercial/visitas-jornadas/"
            icon={<Route className="h-5 w-5 stroke-[1.8]" />}
            label="Jornadas activas"
            value={String(activeWorkdays)}
            caption={`De ${jornadas.length} jornadas del día`}
          />
        </div>

        {/* Main Content Grid: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <PriorityClientsCard clients={priority} />

          <div className="lg:col-span-7 space-y-5">
            <WeeklySalesChart weeks={weeks} totalOrders={summary.orders} />
            <RecentActivityCard entries={activity} />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
