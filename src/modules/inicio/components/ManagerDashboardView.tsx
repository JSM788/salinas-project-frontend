"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Banknote,
  Calendar,
  CreditCard,
  FileText,
  MapPin,
  Route,
  UserX,
  Users,
  TrendingUp,
  Plus,
  Compass,
  ArrowUpRight,
} from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";
import { SCENARIO_DAY, useDemo } from "@/shared/state/demo-store";
import { getRegistrosVisita } from "@/modules/comercial/visitas-jornadas";
import { APP_ROUTES } from "@/config/routes";
import { Button } from "@/shared/components/ui/button";
import { useAuth } from "@/shared/lib/auth-context";
import { isPlatformOwner } from "@/shared/api/platform";
import { useResource } from "@/modules/platform/use-resource";
import { queryPath, pageSchema } from "@/shared/api/pagination";
import {
  teamWorkdaysSchema,
  teamAgendaSchema,
} from "@/shared/api/field-management";
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
} from "../index";
import { LiveTeamMonitor, DEFAULT_TEAM_STATUS, type TeamMemberLiveStatus } from "./LiveTeamMonitor";
import { ExecutiveGoalCard } from "./ExecutiveGoalCard";

export function ManagerDashboardView() {
  const { session } = useAuth();
  const { clientes, pedidos, pagos, agenda, jornadas, clock } = useDemo();
  const [periodFilter, setPeriodFilter] = useState<"mes" | "semana" | "hoy">("mes");

  // Conexión reactiva con los recursos reales del backend (NestJS / PostgreSQL)
  const isManagerConnected = Boolean(session && !isPlatformOwner(session));

  const workdaysResource = useResource(
    isManagerConnected
      ? queryPath("/field-operations/workdays", { page: 1, pageSize: 25 })
      : undefined,
    pageSchema(teamWorkdaysSchema.element)
  );

  const agendaResource = useResource(
    isManagerConnected
      ? queryPath("/field-operations/agenda", { page: 1, pageSize: 50 })
      : undefined,
    pageSchema(teamAgendaSchema.element)
  );

  const backendWorkdays = workdaysResource.data?.items;
  const backendAgenda = agendaResource.data?.items;

  // Resúmenes y métricas de pedidos y cobranzas
  const summary = useMemo(() => monthSummary(pedidos, SCENARIO_DAY), [pedidos]);
  const pending = useMemo(() => pendingPayments(pagos), [pagos]);
  const arrears = useMemo(() => arrearsSummary(clientes), [clientes]);
  const priority = useMemo(() => priorityClients(clientes, pagos), [clientes, pagos]);
  const weeks = useMemo(() => weeklySales(pedidos, SCENARIO_DAY), [pedidos]);
  const activity = useMemo(() => recentActivity(pedidos, SCENARIO_DAY), [pedidos]);

  // Cómputo de ventas según el período seleccionado
  const currentWeek = weeks[weeks.length - 1];
  const todayOrders = useMemo(
    () => pedidos.filter((p) => p.date === SCENARIO_DAY),
    [pedidos]
  );
  const todaySales = useMemo(
    () => todayOrders.reduce((sum, p) => sum + p.total, 0),
    [todayOrders]
  );

  const activeSales =
    periodFilter === "hoy"
      ? todaySales
      : periodFilter === "semana"
      ? currentWeek?.total ?? todaySales
      : summary.sales;

  const activeOrdersCount =
    periodFilter === "hoy"
      ? todayOrders.length
      : periodFilter === "semana"
      ? currentWeek?.orders ?? todayOrders.length
      : summary.orders;

  const activePeriodLabel =
    periodFilter === "hoy"
      ? `Hoy · ${SCENARIO_DAY}`
      : periodFilter === "semana"
      ? `Semana actual (${currentWeek?.range || "En curso"})`
      : periodLabel(SCENARIO_DAY);

  // Cómputo de visitas y jornadas: si el backend tiene datos reales, usa backend; si no, usa demo store
  const visitsToday = useMemo(() => {
    if (backendAgenda && backendAgenda.length > 0) {
      return backendAgenda.filter((v) => v.status === "completed").length;
    }
    return getRegistrosVisita().filter((r) => r.date === SCENARIO_DAY).length;
  }, [backendAgenda]);

  const scheduledToday = useMemo(() => {
    if (backendAgenda && backendAgenda.length > 0) {
      return backendAgenda.length;
    }
    return agenda.filter((slot) => slot.date === SCENARIO_DAY).length;
  }, [backendAgenda, agenda]);

  const activeWorkdays = useMemo(() => {
    if (backendWorkdays && backendWorkdays.length > 0) {
      return backendWorkdays.filter((w) => w.status === "active").length;
    }
    return jornadas.filter((j) => j.status === "En jornada").length;
  }, [backendWorkdays, jornadas]);

  const totalAssignedStaff = useMemo(() => {
    if (backendWorkdays && backendWorkdays.length > 0) {
      return backendWorkdays.length;
    }
    return jornadas.length;
  }, [backendWorkdays, jornadas.length]);

  const visitEfficiency = scheduledToday > 0 ? Math.round((visitsToday / scheduledToday) * 100) : 0;

  // Derivación en vivo de vendedores del equipo comercial (conectado a backend PostgreSQL o demo store)
  const teamLiveStatus: TeamMemberLiveStatus[] = useMemo(() => {
    if (backendWorkdays && backendWorkdays.length > 0) {
      return backendWorkdays.map((w, idx) => {
        const memberVisits = backendAgenda?.filter((v) => v.membership_id === w.membership_id) || [];
        const completed = memberVisits.filter((v) => v.status === "completed").length;
        const total = memberVisits.length || w.total_visits || 1;
        const email = w.member_email || "Vendedor";
        const name = email
          .split("@")[0]
          .replace(/[._]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        const lastVisit = memberVisits[memberVisits.length - 1];

        return {
          id: w.id,
          name,
          initials: name.slice(0, 2).toUpperCase(),
          role: w.member_role === "merchandiser" ? "Mercaderista" : "Comercial",
          route: `Ruta ${String(idx + 1).padStart(2, "0")} · Zona Asignada`,
          status:
            w.status === "active" ? (idx % 2 === 1 ? "en_ruta" : "en_cliente") : "finalizado",
          visitsCompleted: completed,
          visitsScheduled: total,
          ordersCount: completed > 0 ? Math.max(1, Math.floor(completed * 0.7)) : 0,
          ordersTotal: completed > 0 ? Math.floor(completed * 2850) : 0,
          lastCheckIn: lastVisit?.arrived_at
            ? new Date(lastVisit.arrived_at).toLocaleTimeString("es-PE", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "10:30 AM",
          currentLocationName: lastVisit?.customer_name || "En ruta",
        };
      });
    }

    if (!jornadas || jornadas.length === 0) return DEFAULT_TEAM_STATUS;

    return jornadas.map((jornada, idx) => {
      const sellerOrders = pedidos.filter(
        (p) => p.seller === jornada.seller && p.date === SCENARIO_DAY
      );
      const ordersTotal = sellerOrders.reduce((acc, p) => acc + p.total, 0);

      const sellerVisits = getRegistrosVisita().filter(
        (r) => r.seller === jornada.seller && r.date === SCENARIO_DAY
      );
      const lastVisit = sellerVisits[sellerVisits.length - 1];

      let status: "en_cliente" | "en_ruta" | "finalizado" | "sin_iniciar" = "en_cliente";
      if (jornada.status === "Finalizada") status = "finalizado";
      else if (jornada.status === "Sin iniciar") status = "sin_iniciar";
      else if (idx % 2 === 1) status = "en_ruta";

      return {
        id: jornada.id,
        name: jornada.seller,
        initials: jornada.seller
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join(""),
        role: "Comercial",
        route: `Ruta ${String(idx + 1).padStart(2, "0")} · Zona Comercial`,
        status,
        visitsCompleted: jornada.completedVisits,
        visitsScheduled: jornada.totalVisits,
        ordersCount: sellerOrders.length,
        ordersTotal,
        lastCheckIn: lastVisit?.checkIn || jornada.startTime || "10:00 AM",
        currentLocationName: lastVisit?.clientName || "En ruta hacia siguiente punto",
      };
    });
  }, [backendWorkdays, backendAgenda, jornadas, pedidos]);

  return (
    <div className="space-y-5">
      {/* 1. Header Ejecutivo del Gerente */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-950">
            Control Comercial y Operativo
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Visión ejecutiva de ventas, cobertura en campo, rutas activas y cobranzas ·{" "}
            {isManagerConnected ? "En vivo" : "Operación"} {clock}
          </p>
        </div>

        {/* Selector de período y botón de nuevo pedido */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Píldoras de filtro rápido */}
          <div className="inline-flex items-center p-0.5 bg-zinc-100 rounded-lg border border-zinc-200/80 text-xs">
            <button
              type="button"
              onClick={() => setPeriodFilter("hoy")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                periodFilter === "hoy"
                  ? "bg-white text-zinc-900 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => setPeriodFilter("semana")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                periodFilter === "semana"
                  ? "bg-white text-zinc-900 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Esta Semana
            </button>
            <button
              type="button"
              onClick={() => setPeriodFilter("mes")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                periodFilter === "mes"
                  ? "bg-white text-zinc-900 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Mes Actual
            </button>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-zinc-500" />
            <span>{activePeriodLabel}</span>
          </div>

          <Link href={`${APP_ROUTES.SALES}/orders/new`}>
            <Button size="sm" className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              <span>Nuevo pedido</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Grid de Métricas Principales (KPI Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          href={`${APP_ROUTES.SALES}/`}
          icon={<Banknote className="h-5 w-5 stroke-[1.8]" />}
          label={`Ventas (${
            periodFilter === "hoy"
              ? "del día"
              : periodFilter === "semana"
              ? "de la semana"
              : "del mes"
          })`}
          value={formatCurrency(activeSales)}
          caption={`${activeOrdersCount} pedidos registrados`}
        />

        <MetricCard
          href={`${APP_ROUTES.ROUTES}/`}
          icon={<MapPin className="h-5 w-5 stroke-[1.8]" />}
          label="Visitas de hoy"
          value={`${visitsToday} / ${scheduledToday}`}
          caption={`${visitEfficiency}% de efectividad de ruta`}
        />

        <MetricCard
          href={`${APP_ROUTES.VISITS}/`}
          icon={<Route className="h-5 w-5 stroke-[1.8]" />}
          label="Fuerza en ruta hoy"
          value={`${activeWorkdays} activas`}
          caption={`De ${totalAssignedStaff} preventistas asignados`}
        />

        <MetricCard
          href={`${APP_ROUTES.FINANCE}/`}
          icon={<CreditCard className="h-5 w-5 stroke-[1.8]" />}
          label="Por conciliar en banco"
          value={formatCurrency(pending.amount)}
          caption={`${pending.count} pagos pendientes en Finanzas`}
        />
      </div>

      {/* 3. Fila Estratégica: Meta Comercial (1/3) + Gráfico de Ventas Semanales (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <ExecutiveGoalCard
            currentSales={summary.sales}
            targetSales={120000}
            totalOrders={summary.orders}
            periodName="Octubre 2026"
          />
        </div>

        <div className="lg:col-span-2">
          <WeeklySalesChart weeks={weeks} totalOrders={summary.orders} />
        </div>
      </div>

      {/* 4. Monitor de Fuerza de Ventas en Vivo (Tiempo Real conectado con PostgreSQL o demo store) */}
      <div>
        <LiveTeamMonitor team={teamLiveStatus} />
      </div>

      {/* 5. Fila Operativa: Clientes Prioritarios (Mora / Seguimiento) + Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <PriorityClientsCard clients={priority} />
        </div>
        <RecentActivityCard entries={activity} />
      </div>
    </div>
  );
}
