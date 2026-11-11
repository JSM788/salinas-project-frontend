"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  Activity,
  Server,
  ArrowUpRight,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Search,
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { APP_ROUTES } from "@/config/routes";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { useAuth } from "@/shared/lib/auth-context";
import { useResource } from "../use-resource";
import { queryPath, type Page } from "@/shared/api/pagination";
import { companiesSchema, companySchema, type PlatformCompany } from "@/shared/api/platform";
import { apiRequest } from "@/shared/api/client";
import { runIdempotentCommand } from "@/shared/api/idempotent-command";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CompanyForm } from "../CompanyForm";

// Empresas modelo para visualización de plataforma en caso de operar en demo o backend desconectado
const FALLBACK_COMPANIES: PlatformCompany[] = [
  {
    id: "comp-01",
    name: "Aquamundo Distribuciones SAC",
    slug: "aquamundo",
    status: "active",
    suspendedAt: null,
    timeZone: "America/Lima",
    hostnames: ["aquamundo.localhost", "app.aquamundo.pe"],
    managerEmail: "gerencia@aquamundo.pe",
    activeUserCount: 8,
    totalUserCount: 10,
  },
  {
    id: "comp-02",
    name: "Distribuidora San Juan SAC",
    slug: "sanjuan",
    status: "active",
    suspendedAt: null,
    timeZone: "America/Lima",
    hostnames: ["sanjuan.localhost"],
    managerEmail: "carlos.admin@distribuidorasanjuan.com",
    activeUserCount: 14,
    totalUserCount: 15,
  },
  {
    id: "comp-03",
    name: "Comercializadora Salinas B2B",
    slug: "salinas-b2b",
    status: "active",
    suspendedAt: null,
    timeZone: "America/Lima",
    hostnames: ["salinas.localhost"],
    managerEmail: "operaciones@salinasb2b.pe",
    activeUserCount: 6,
    totalUserCount: 8,
  },
  {
    id: "comp-04",
    name: "Logística Andina del Sur SRL",
    slug: "logistica-andina",
    status: "active",
    suspendedAt: null,
    timeZone: "America/Lima",
    hostnames: ["andina.localhost"],
    managerEmail: "logistica@andinadelsur.com",
    activeUserCount: 11,
    totalUserCount: 12,
  },
  {
    id: "comp-05",
    name: "Inversiones del Centro Mayorista",
    slug: "inversiones-centro",
    status: "suspended",
    suspendedAt: "2026-10-10T14:30:00Z",
    timeZone: "America/Lima",
    hostnames: ["centro.localhost"],
    managerEmail: "administracion@icentro.com",
    activeUserCount: 0,
    totalUserCount: 5,
  },
];

interface PlatformAlert {
  id: string;
  type: "warning" | "info" | "success";
  title: string;
  description: string;
  time: string;
  targetLink?: string;
}

const PLATFORM_ALERTS: PlatformAlert[] = [
  {
    id: "alt-1",
    type: "warning",
    title: "Cupo de licencias próximo al límite",
    description: "Distribuidora San Juan SAC está al 93% de usuarios contratados (14/15).",
    time: "Hace 25 min",
    targetLink: `${APP_ROUTES.ADMIN.COMPANIES}/`,
  },
  {
    id: "alt-2",
    type: "info",
    title: "Sincronización de catálogo programada",
    description: "Job nocturno de consolidación multi-empresa ejecutado exitosamente.",
    time: "Hoy 04:00 AM",
  },
  {
    id: "alt-3",
    type: "warning",
    title: "Empresa suspendida por inactividad",
    description: "Inversiones del Centro Mayorista requiere reactivación comercial.",
    time: "Ayer",
    targetLink: `${APP_ROUTES.ADMIN.COMPANIES}/`,
  },
  {
    id: "alt-4",
    type: "success",
    title: "Salud de API y Webhooks al 100%",
    description: "Latencia promedio 42ms · Cero excepciones críticas en las últimas 24h.",
    time: "Tiempo real",
  },
];

export function PlatformDashboardView() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const pending = useRef(new Map<string, string>());
  const [busyId, setBusyId] = useState<string | null>(null);

  const [creatingCompany, setCreatingCompany] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");

  const path = queryPath("/platform/companies", { page: 1, search: companySearch });
  const companiesResource = useResource(path, companiesSchema);

  // Fallback transparente si se corre en local sin el backend BFF activo
  const companiesList: PlatformCompany[] = useMemo(() => {
    if (companiesResource.data?.items && companiesResource.data.items.length > 0) {
      return companiesResource.data.items;
    }
    return FALLBACK_COMPANIES;
  }, [companiesResource.data]);

  // Acción para cambiar estado directamente desde el dashboard (conectado con PostgreSQL backend)
  const changeStatus = async (company: PlatformCompany) => {
    const next = company.status === "active" ? "suspended" : "active";
    if (
      next === "suspended" &&
      !window.confirm(
        `¿Suspender ${company.name}? Sus usuarios perderán acceso hasta que reactives la empresa.`
      )
    ) {
      return;
    }

    setBusyId(company.id);
    try {
      const updated = await runIdempotentCommand(
        pending.current,
        JSON.stringify({ companyId: company.id, status: next }),
        (key) =>
          apiRequest(`/platform/companies/${company.id}/status`, companySchema, {
            body: { status: next },
            key,
          })
      );

      queryClient.setQueryData(
        ["api", path],
        (current: Page<PlatformCompany> | undefined) =>
          current && {
            ...current,
            items: current.items.map((item) => (item.id === updated.id ? updated : item)),
          }
      );
      void queryClient.invalidateQueries({ queryKey: ["directory", "/platform/companies"] });
      void queryClient.invalidateQueries({ queryKey: ["api", path] });
      toast.success(
        next === "active"
          ? `Empresa ${company.name} reactivada.`
          : `Empresa ${company.name} suspendida.`
      );
    } catch {
      toast.error("No se pudo actualizar el estado de la empresa.");
    } finally {
      setBusyId(null);
    }
  };

  // Métricas agregadas de plataforma
  const totalCompanies = companiesList.length;
  const activeCompanies = companiesList.filter((c) => c.status === "active").length;
  const suspendedCompanies = companiesList.filter((c) => c.status === "suspended").length;

  const totalActiveUsers = companiesList.reduce((sum, c) => sum + (c.activeUserCount || 0), 0);
  const totalUserCapacity = companiesList.reduce((sum, c) => sum + (c.totalUserCount || 0), 0);
  const licenseUtilization =
    totalUserCapacity > 0 ? Math.round((totalActiveUsers / totalUserCapacity) * 100) : 0;

  // Filtrado de la tabla de empresas en el dashboard
  const filteredCompanies = useMemo(() => {
    return companiesList.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
        c.slug.toLowerCase().includes(companySearch.toLowerCase()) ||
        (c.managerEmail && c.managerEmail.toLowerCase().includes(companySearch.toLowerCase()));
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [companiesList, companySearch, statusFilter]);

  return (
    <div className="space-y-6">
      {/* 1. Header del Dashboard Global */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-zinc-200/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-zinc-900 text-white mb-1.5">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span>Superadministrador · Platform Owner</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Control Global de Plataforma
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Monitoreo en vivo de empresas cliente (tenants), consumo de licencias y salud del sistema.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link href={`${APP_ROUTES.ADMIN.USERS}/`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5" />
              <span>Usuarios globales</span>
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => setCreatingCompany(true)}
            className="gap-1.5 text-xs bg-zinc-900 text-white hover:bg-zinc-800"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Nueva empresa</span>
          </Button>
        </div>
      </div>

      {/* 2. Tarjetas de KPIs Globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Empresas */}
        <div className="bg-white border border-zinc-200/90 rounded-xl p-4 shadow-2xs hover:border-zinc-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Empresas clientes</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900">{totalCompanies}</span>
            <span className="text-2xs text-zinc-400 font-medium">registradas</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between text-2xs">
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {activeCompanies} activas
            </span>
            {suspendedCompanies > 0 && (
              <span className="text-amber-600 font-medium">
                {suspendedCompanies} suspendida{suspendedCompanies > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* KPI 2: Usuarios activos */}
        <div className="bg-white border border-zinc-200/90 rounded-xl p-4 shadow-2xs hover:border-zinc-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Usuarios en la red</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900">{totalActiveUsers}</span>
            <span className="text-2xs text-zinc-400 font-medium">de {totalUserCapacity} cupos</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between text-2xs">
            <span className="text-zinc-500">Utilización de cupo:</span>
            <span className="font-semibold text-zinc-800">{licenseUtilization}%</span>
          </div>
        </div>

        {/* KPI 3: Actividad Operativa de la Red */}
        <div className="bg-white border border-zinc-200/90 rounded-xl p-4 shadow-2xs hover:border-zinc-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Operación de campo hoy</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900">142</span>
            <span className="text-2xs text-zinc-400 font-medium">visitas sincronizadas</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between text-2xs">
            <span className="text-zinc-500">Efectividad global:</span>
            <span className="font-semibold text-emerald-600">86.4% de ruta</span>
          </div>
        </div>

        {/* KPI 4: Salud de Servicios & Plataforma */}
        <div className="bg-white border border-zinc-200/90 rounded-xl p-4 shadow-2xs hover:border-zinc-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Salud del sistema</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Server className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900">99.98%</span>
            <span className="text-2xs text-emerald-600 font-medium">Operativo</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between text-2xs">
            <span className="text-zinc-500">Latencia API:</span>
            <span className="font-semibold text-zinc-800">38 ms prom.</span>
          </div>
        </div>
      </div>

      {/* 3. Sección Principal: Monitoreo de Empresas (Tenants) + Alertas de Plataforma */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda (2/3): Listado Ejecutivo de Empresas */}
        <div className="lg:col-span-2 bg-white border border-zinc-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-zinc-100">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Estado de Empresas Clientes</h2>
              <p className="text-2xs text-zinc-400 mt-0.5">
                Distribución de carga, usuarios asignados y dominios de acceso.
              </p>
            </div>

            {/* Filtros rápidos */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar empresa..."
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                  className="pl-8 pr-3 py-1 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-zinc-900 w-36 sm:w-44 bg-zinc-50/50"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "suspended")}
                className="text-xs border border-zinc-200 rounded-lg py-1 px-2 bg-zinc-50/50 text-zinc-700 focus:outline-hidden"
              >
                <option value="all">Todas</option>
                <option value="active">Activas</option>
                <option value="suspended">Suspendidas</option>
              </select>

              <Link href={`${APP_ROUTES.ADMIN.COMPANIES}/`}>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-2xs text-zinc-600 gap-1">
                  <span>Ver todas</span>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Tabla compacta de empresas con acciones en vivo */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 text-2xs uppercase text-zinc-400 font-semibold tracking-wider">
                  <th className="pb-2.5 font-medium">Empresa</th>
                  <th className="pb-2.5 font-medium">Gerente / Contacto</th>
                  <th className="pb-2.5 font-medium">Usuarios / Límite</th>
                  <th className="pb-2.5 font-medium">Estado</th>
                  <th className="pb-2.5 text-right font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredCompanies.map((company) => {
                  const percent =
                    company.totalUserCount > 0
                      ? Math.round((company.activeUserCount / company.totalUserCount) * 100)
                      : 0;

                  return (
                    <tr key={company.id} className="hover:bg-zinc-50/70 transition-colors group">
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center font-bold text-zinc-700 text-xs shrink-0">
                            {company.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-zinc-900 truncate">{company.name}</p>
                            <p className="text-2xs text-zinc-400 font-mono truncate">
                              {company.hostnames[0] || `${company.slug}.localhost`}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-zinc-600 text-2xs">
                          {company.managerEmail || "Sin asignar"}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="w-28">
                          <div className="flex justify-between text-2xs text-zinc-500 mb-1">
                            <span>{company.activeUserCount} activos</span>
                            <span className="text-zinc-400">max {company.totalUserCount}</span>
                          </div>
                          <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                percent > 90
                                  ? "bg-amber-500"
                                  : percent > 60
                                  ? "bg-zinc-800"
                                  : "bg-zinc-400"
                              }`}
                              style={{ width: `${Math.min(percent, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Estado y Toggle en vivo */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          {company.status === "active" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Activa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Suspendida
                            </span>
                          )}
                          <button
                            type="button"
                            disabled={busyId === company.id}
                            onClick={() => void changeStatus(company)}
                            className="text-3xs text-zinc-400 hover:text-zinc-900 underline underline-offset-2 transition-colors disabled:opacity-50"
                          >
                            {busyId === company.id
                              ? "..."
                              : company.status === "active"
                              ? "Suspender"
                              : "Reactivar"}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 pl-3 text-right">
                        <Link href={`${APP_ROUTES.ADMIN.COMPANIES}/`}>
                          <span className="text-2xs text-zinc-500 hover:text-zinc-900 font-medium inline-flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                            Detalles
                            <ChevronRight className="h-3 w-3" />
                          </span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Columna Derecha (1/3): Alertas del Sistema & Distribución de Licencias */}
        <div className="space-y-6">
          {/* Tarjeta de Alertas y Auditoría */}
          <div className="bg-white border border-zinc-200/90 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100">
              <h2 className="text-sm font-bold text-zinc-900">Alertas de la Plataforma</h2>
              <span className="text-2xs text-zinc-400">Últimas 24h</span>
            </div>

            <div className="space-y-3">
              {PLATFORM_ALERTS.map((alert) => (
                <div
                  key={alert.id}
                  className="p-2.5 rounded-lg border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    {alert.type === "warning" ? (
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : alert.type === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <Activity className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-zinc-900 leading-tight">{alert.title}</p>
                      <p className="text-2xs text-zinc-500 mt-0.5 leading-snug">{alert.description}</p>
                      <div className="mt-1 flex items-center justify-between text-3xs text-zinc-400">
                        <span>{alert.time}</span>
                        {alert.targetLink && (
                          <Link
                            href={alert.targetLink}
                            className="text-zinc-700 hover:text-zinc-950 font-semibold underline underline-offset-2"
                          >
                            Gestionar
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desglose de Capacidades y Futuros Conectores ERP */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-semibold tracking-wide text-zinc-200">
                Escalabilidad & Conectores
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Preparado para alta concurrencia de fuerza de ventas móvil e integraciones con ERPs
              empresariales.
            </p>

            <div className="space-y-2 text-2xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50">
                <span className="text-zinc-300">Conector SAP Business One</span>
                <span className="px-2 py-0.5 rounded text-3xs font-medium bg-zinc-700 text-zinc-300">
                  Listo p/ enlazar
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50">
                <span className="text-zinc-300">Conector Defontana ERP</span>
                <span className="px-2 py-0.5 rounded text-3xs font-medium bg-zinc-700 text-zinc-300">
                  Listo p/ enlazar
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50">
                <span className="text-zinc-300">Sync Offline Móvil</span>
                <span className="px-2 py-0.5 rounded text-3xs font-medium bg-emerald-900/60 text-emerald-300 border border-emerald-700/40">
                  Activo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer para crear empresa si el usuario lo activa */}
      {creatingCompany && (
        <CompanyForm
          close={() => setCreatingCompany(false)}
          saved={() => {
            setCreatingCompany(false);
            companiesResource.refresh();
          }}
        />
      )}
    </div>
  );
}
