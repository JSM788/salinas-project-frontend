"use client";

import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  FileText,
  Monitor,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  Smartphone,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useResource } from "./use-resource";
import { apiRequest } from "@/shared/api/client";
import { queryPath } from "@/shared/api/pagination";
import {
  companiesSchema,
  platformLogEventsSchema,
  platformLogFileContentSchema,
  platformLogFilesSchema,
  platformLogsSummaryResponseSchema,
  platformLogUsersSchema,
  type LogLevel,
  type LogSource,
  type PlatformCompany,
  type PlatformLogEvent,
  type PlatformLogFile,
  type PlatformLogUserSummary,
} from "@/shared/api/platform";
import { Button } from "@/shared/components/ui/button";
import { Pagination } from "@/shared/patterns/Pagination";
import { SkeletonMetricCard, SkeletonTableRows } from "@/shared/components/ui/skeleton";

type AuditTab = "summary" | "users" | "files";

const SOURCE_META: Record<
  LogSource,
  { label: string; badgeCls: string; barCls: string; icon: React.ReactNode }
> = {
  backend: {
    label: "Backend",
    badgeCls: "bg-indigo-50 text-indigo-700 border-indigo-200",
    barCls: "bg-indigo-500",
    icon: <Server className="h-3 w-3" />,
  },
  frontend: {
    label: "Frontend",
    badgeCls: "bg-sky-50 text-sky-700 border-sky-200",
    barCls: "bg-sky-500",
    icon: <Monitor className="h-3 w-3" />,
  },
  mobile: {
    label: "Mobile",
    badgeCls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    barCls: "bg-emerald-500",
    icon: <Smartphone className="h-3 w-3" />,
  },
};

const LEVEL_META: Record<LogLevel, { label: string; cls: string }> = {
  info: { label: "INFO", cls: "bg-zinc-100 text-zinc-700 border-zinc-200" },
  warn: { label: "WARN", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  error: { label: "ERROR", cls: "bg-red-50 text-red-700 border-red-200" },
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function EventRow({ event }: { event: PlatformLogEvent }) {
  const [expanded, setExpanded] = useState(false);
  const src = SOURCE_META[event.source];
  const lvl = LEVEL_META[event.level];

  const handleCopyJson = (e: React.MouseEvent) => {
    e.stopPropagation();
    void navigator.clipboard.writeText(JSON.stringify(event.details ?? {}, null, 2));
    toast.success("JSON técnico copiado al portapapeles");
  };

  return (
    <div className="border-b border-zinc-100 last:border-b-0">
      <div
        onClick={() => setExpanded((v) => !v)}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 hover:bg-zinc-50/70 cursor-pointer transition-colors"
      >
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-3xs font-semibold ${src.badgeCls}`}
            >
              {src.icon}
              {src.label}
            </span>
            <span
              className={`inline-flex items-center rounded border px-1.5 py-0.5 text-3xs font-bold ${lvl.cls}`}
            >
              {lvl.label}
            </span>
            {event.screen && (
              <span className="text-2xs font-mono text-zinc-400 truncate max-w-48">
                {event.screen}
              </span>
            )}
          </div>

          <p className="text-sm font-medium text-zinc-900 leading-snug">
            {event.message}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span>{event.userEmail ?? "Sistema"}</span>
            {event.companyName && (
              <>
                <span className="text-zinc-300">·</span>
                <span>{event.companyName}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <span className="text-xs font-mono text-zinc-400">
            {formatDateTime(event.timestamp)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500">
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
            JSON
          </span>
        </div>
      </div>

      {expanded && (
        <div className="bg-zinc-50/90 border-t border-zinc-100 px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-600">
              Detalle técnico · <code className="font-mono">{event.event}</code>
            </span>
            <button
              type="button"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-700 hover:text-zinc-950"
            >
              <Copy className="h-3.5 w-3.5" />
              Copiar JSON
            </button>
          </div>
          <pre className="text-2xs font-mono text-zinc-700 bg-white border border-zinc-200 rounded-lg p-3 overflow-auto max-h-52 whitespace-pre-wrap">
            {JSON.stringify(event.details ?? {}, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export function PlatformAuditView() {
  const [tab, setTab] = useState<AuditTab>("summary");
  const [hours, setHours] = useState<number>(168);

  // Filtros de eventos / usuarios
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [userSearch, setUserSearch] = useState<string>("");
  const [companyId, setCompanyId] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<LogSource | "">("");
  const [levelFilter, setLevelFilter] = useState<LogLevel | "">("");
  const [eventSearch, setEventSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  // Filtro de archivos .log
  const [fileSourceFilter, setFileSourceFilter] = useState<LogSource | "">("");
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  const companiesResource = useResource(
    queryPath("/platform/companies", { page: 1, pageSize: 100 }),
    companiesSchema,
  );
  const companies: PlatformCompany[] = companiesResource.data?.items ?? [];

  const summaryResource = useResource(
    queryPath("/platform/logs/summary", { hours }),
    platformLogsSummaryResponseSchema,
  );

  const usersResource = useResource(
    queryPath("/platform/logs/users", {
      hours,
      companyId: companyId || undefined,
      search: userSearch || undefined,
    }),
    platformLogUsersSchema,
  );

  const eventsResource = useResource(
    queryPath("/platform/logs/events", {
      page,
      pageSize: 25,
      hours,
      companyId: companyId || undefined,
      source: sourceFilter || undefined,
      level: levelFilter || undefined,
      userId: selectedUserId || undefined,
      search: eventSearch || undefined,
    }),
    platformLogEventsSchema,
  );

  const filesResource = useResource(
    queryPath("/platform/logs/files", {
      source: fileSourceFilter || undefined,
    }),
    platformLogFilesSchema,
  );

  const users: PlatformLogUserSummary[] = usersResource.data ?? [];
  const events: PlatformLogEvent[] = eventsResource.data?.items ?? [];
  const totalEvents = eventsResource.data?.total ?? 0;
  const files: PlatformLogFile[] = filesResource.data ?? [];

  const selectedUser = useMemo(
    () => users.find((u) => u.userId === selectedUserId) ?? null,
    [users, selectedUserId],
  );

  const maxDayCount = useMemo(() => {
    const days = summaryResource.data?.byDay ?? [];
    return Math.max(
      1,
      ...days.map((d) => d.backend + d.frontend + d.mobile),
    );
  }, [summaryResource.data]);

  const handleRefreshAll = () => {
    void summaryResource.refresh();
    void usersResource.refresh();
    void eventsResource.refresh();
    void filesResource.refresh();
  };

  const handleSelectUserFromSummary = (userId: string) => {
    setSelectedUserId(userId);
    setPage(1);
    setTab("users");
  };

  const handleExportExcel = () => {
    if (events.length === 0) {
      toast.warning("No hay eventos en esta vista para exportar.");
      return;
    }

    const rows = events.map((ev) => ({
      "Fecha y Hora": formatDateTime(ev.timestamp),
      Origen: SOURCE_META[ev.source].label,
      Nivel: ev.level.toUpperCase(),
      Mensaje: ev.message,
      Usuario: ev.userEmail ?? "Sistema",
      Empresa: ev.companyName ?? "Global",
      Pantalla: ev.screen ?? "—",
      "Evento Técnico": ev.event,
      Detalles: ev.details ? JSON.stringify(ev.details) : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");
    XLSX.writeFile(
      workbook,
      `salinas-logs-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
    toast.success(`Exportados ${rows.length} eventos a Excel`);
  };

  const handleDownloadLogFile = async (file: PlatformLogFile) => {
    const key = `${file.source}/${file.filename}`;
    setDownloadingFile(key);
    try {
      const result = await apiRequest(
        `/platform/logs/files/${file.source}/${file.filename}`,
        platformLogFileContentSchema,
      );
      const blob = new Blob([result.content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.source}-${file.filename}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(`Descargado ${file.source}/${file.filename}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo descargar el archivo .log",
      );
    } finally {
      setDownloadingFile(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-2.5 py-0.5 text-2xs font-medium text-white mb-2">
            <ShieldAlert className="h-3 w-3 text-amber-400" />
            <span>Superadministrador · Observabilidad</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Auditoría y Logs del Sistema
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Monitoreo unificado por usuario y archivos separados para Backend, Frontend y Mobile.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={hours}
            onChange={(e) => {
              setHours(Number(e.target.value));
              setPage(1);
            }}
            className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 outline-none focus:border-zinc-900"
          >
            <option value={24}>Últimas 24 horas</option>
            <option value={168}>Últimos 7 días</option>
            <option value={720}>Últimos 30 días</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            className="h-9 gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Actualizar
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportExcel}
            className="h-9 gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-zinc-200">
        <button
          type="button"
          onClick={() => setTab("summary")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "summary"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Resumen y Gráficas
        </button>

        <button
          type="button"
          onClick={() => setTab("users")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "users"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <UserIcon className="h-4 w-4" />
          Actividad por Usuario
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-2xs font-semibold text-zinc-700">
            {users.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab("files")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "files"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <FileText className="h-4 w-4" />
          Archivos .log
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-2xs font-semibold text-zinc-700">
            {files.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Resumen y Gráficas */}
      {tab === "summary" && (
        <div className="space-y-6">
          {summaryResource.loading && !summaryResource.data ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonMetricCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
                  <span>Total eventos</span>
                  <Activity className="h-4 w-4 text-zinc-400" />
                </div>
                <p className="mt-2 text-2xl font-bold text-zinc-900">
                  {summaryResource.data?.totals.total ?? 0}
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="flex items-center justify-between text-xs font-medium text-indigo-600">
                  <span>Backend</span>
                  <Server className="h-4 w-4" />
                </div>
                <p className="mt-2 text-2xl font-bold text-zinc-900">
                  {summaryResource.data?.totals.backend ?? 0}
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="flex items-center justify-between text-xs font-medium text-sky-600">
                  <span>Frontend (Web)</span>
                  <Monitor className="h-4 w-4" />
                </div>
                <p className="mt-2 text-2xl font-bold text-zinc-900">
                  {summaryResource.data?.totals.frontend ?? 0}
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="flex items-center justify-between text-xs font-medium text-emerald-600">
                  <span>Mobile (Expo)</span>
                  <Smartphone className="h-4 w-4" />
                </div>
                <p className="mt-2 text-2xl font-bold text-zinc-900">
                  {summaryResource.data?.totals.mobile ?? 0}
                </p>
              </div>

              <div className="rounded-xl border border-red-200 bg-red-50/40 p-4">
                <div className="flex items-center justify-between text-xs font-medium text-red-600">
                  <span>Errores detectados</span>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <p className="mt-2 text-2xl font-bold text-red-700">
                  {summaryResource.data?.totals.errors ?? 0}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfica por día y origen */}
            <div className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">
                    Actividad diaria por origen
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Distribución de eventos en Backend, Frontend y Mobile
                  </p>
                </div>
                <div className="flex items-center gap-3 text-2xs text-zinc-600">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-xs bg-indigo-500" /> Backend
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-xs bg-sky-500" /> Frontend
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500" /> Mobile
                  </span>
                </div>
              </div>

              {(summaryResource.data?.byDay ?? []).length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-400">
                  Sin datos suficientes para graficar en el periodo seleccionado.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(summaryResource.data?.byDay ?? []).map((day) => {
                    const total = day.backend + day.frontend + day.mobile;
                    const bePct = Math.round((day.backend / maxDayCount) * 100);
                    const fePct = Math.round((day.frontend / maxDayCount) * 100);
                    const moPct = Math.round((day.mobile / maxDayCount) * 100);
                    return (
                      <div key={day.date} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-zinc-600">{day.date}</span>
                          <span className="text-zinc-500">
                            {total} eventos
                            {day.errors > 0 && (
                              <span className="ml-2 text-red-600 font-semibold">
                                ({day.errors} err)
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-zinc-100 overflow-hidden flex">
                          {bePct > 0 && (
                            <div
                              style={{ width: `${bePct}%` }}
                              className="h-full bg-indigo-500"
                              title={`Backend: ${day.backend}`}
                            />
                          )}
                          {fePct > 0 && (
                            <div
                              style={{ width: `${fePct}%` }}
                              className="h-full bg-sky-500"
                              title={`Frontend: ${day.frontend}`}
                            />
                          )}
                          {moPct > 0 && (
                            <div
                              style={{ width: `${moPct}%` }}
                              className="h-full bg-emerald-500"
                              title={`Mobile: ${day.mobile}`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top usuarios */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-zinc-900">
                Top usuarios por actividad
              </h2>
              <p className="text-xs text-zinc-500 mb-4">
                Haz clic en un usuario para inspeccionar sus eventos
              </p>

              {(summaryResource.data?.topUsers ?? []).length === 0 ? (
                <div className="py-10 text-center text-xs text-zinc-400">
                  No hay actividad registrada por usuario todavía.
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {(summaryResource.data?.topUsers ?? []).map((u) => (
                    <button
                      key={u.userId}
                      type="button"
                      onClick={() => handleSelectUserFromSummary(u.userId)}
                      className="w-full py-2.5 flex items-center justify-between gap-2 text-left hover:bg-zinc-50 px-2 rounded-lg transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-zinc-900 truncate">
                          {u.email ?? u.displayName ?? u.userId}
                        </p>
                        <p className="text-2xs text-zinc-500 truncate">
                          {u.companyName ?? "Global"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {u.errorCount > 0 && (
                          <span className="rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-3xs font-bold text-red-700">
                            {u.errorCount} err
                          </span>
                        )}
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-2xs font-semibold text-zinc-700">
                          {u.totalEvents}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Actividad por Usuario */}
      {tab === "users" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Lista de usuarios */}
          <div className="lg:col-span-4 rounded-xl border border-zinc-200 bg-white overflow-hidden flex flex-col max-h-[42rem]">
            <div className="p-3 border-b border-zinc-100 space-y-2 bg-zinc-50/50">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Buscar usuario o correo..."
                  className="w-full h-8 pl-8 pr-3 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-900 outline-none focus:border-zinc-900"
                />
              </div>

              <select
                value={companyId}
                onChange={(e) => {
                  setCompanyId(e.target.value);
                  setPage(1);
                }}
                className="w-full h-8 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-700 outline-none focus:border-zinc-900"
              >
                <option value="">Todas las empresas</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-y-auto divide-y divide-zinc-100 flex-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedUserId("");
                  setPage(1);
                }}
                className={`w-full px-3.5 py-2.5 text-left transition-colors flex items-center justify-between ${
                  selectedUserId === ""
                    ? "bg-zinc-900 text-white"
                    : "hover:bg-zinc-50 text-zinc-900"
                }`}
              >
                <div>
                  <p className="text-xs font-semibold">Todos los usuarios</p>
                  <p
                    className={`text-2xs ${
                      selectedUserId === "" ? "text-zinc-300" : "text-zinc-500"
                    }`}
                  >
                    Vista unificada
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-2xs font-semibold ${
                    selectedUserId === ""
                      ? "bg-white/15 text-white"
                      : "bg-zinc-100 text-zinc-700"
                  }`}
                >
                  {summaryResource.data?.totals.total ?? totalEvents}
                </span>
              </button>

              {users.map((u) => {
                const active = selectedUserId === u.userId;
                return (
                  <button
                    key={u.userId}
                    type="button"
                    onClick={() => {
                      setSelectedUserId(u.userId);
                      setPage(1);
                    }}
                    className={`w-full px-3.5 py-2.5 text-left transition-colors flex items-center justify-between gap-2 ${
                      active ? "bg-zinc-900 text-white" : "hover:bg-zinc-50 text-zinc-900"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">
                        {u.email ?? u.displayName ?? u.userId}
                      </p>
                      <p
                        className={`text-2xs truncate ${
                          active ? "text-zinc-300" : "text-zinc-500"
                        }`}
                      >
                        {u.companyName ?? "Global"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {u.errorCount > 0 && (
                        <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-3xs font-bold text-white">
                          {u.errorCount}
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-2xs font-semibold ${
                          active ? "bg-white/15 text-white" : "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {u.totalEvents}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timeline de eventos del usuario seleccionado */}
          <div className="lg:col-span-8 rounded-xl border border-zinc-200 bg-white overflow-hidden flex flex-col">
            <div className="p-3.5 border-b border-zinc-100 bg-zinc-50/50 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">
                    {selectedUser
                      ? selectedUser.email ?? selectedUser.displayName ?? selectedUser.userId
                      : "Todos los eventos"}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {totalEvents} evento(s) · Haz clic en cualquier fila para ver el JSON técnico
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-44">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    value={eventSearch}
                    onChange={(e) => {
                      setEventSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Buscar en mensajes o pantallas..."
                    className="w-full h-8 pl-8 pr-3 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-900 outline-none focus:border-zinc-900"
                  />
                </div>

                <select
                  value={sourceFilter}
                  onChange={(e) => {
                    setSourceFilter(e.target.value as LogSource | "");
                    setPage(1);
                  }}
                  className="h-8 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-700 outline-none focus:border-zinc-900"
                >
                  <option value="">Todos los orígenes</option>
                  <option value="backend">Backend</option>
                  <option value="frontend">Frontend (Web)</option>
                  <option value="mobile">Mobile (Expo)</option>
                </select>

                <select
                  value={levelFilter}
                  onChange={(e) => {
                    setLevelFilter(e.target.value as LogLevel | "");
                    setPage(1);
                  }}
                  className="h-8 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-700 outline-none focus:border-zinc-900"
                >
                  <option value="">Todos los niveles</option>
                  <option value="info">INFO</option>
                  <option value="warn">WARN</option>
                  <option value="error">ERROR</option>
                </select>
              </div>
            </div>

            {eventsResource.loading && events.length === 0 ? (
              <div className="p-4">
                <table className="w-full">
                  <tbody>
                    <SkeletonTableRows rows={6} cols={3} />
                  </tbody>
                </table>
              </div>
            ) : events.length === 0 ? (
              <div className="py-16 text-center text-sm text-zinc-500">
                No hay eventos registrados con los filtros actuales.
              </div>
            ) : (
              <div>
                {events.map((ev) => (
                  <EventRow key={ev.id} event={ev} />
                ))}
              </div>
            )}

            {totalEvents > 25 && (
              <div className="p-3 border-t border-zinc-100">
                <Pagination
                  page={page}
                  pageSize={25}
                  total={totalEvents}
                  shown={events.length}
                  entityName="eventos"
                  onPageChange={(nextPage: number) => setPage(nextPage)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Archivos .log por Origen */}
      {tab === "files" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { key: "", label: "Todos los orígenes" },
                { key: "backend", label: "Backend (logs/backend/)" },
                { key: "frontend", label: "Frontend (logs/frontend/)" },
                { key: "mobile", label: "Mobile (logs/mobile/)" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key || "all"}
                type="button"
                onClick={() => setFileSourceFilter(opt.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                  fileSourceFilter === opt.key
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
            {filesResource.loading && files.length === 0 ? (
              <div className="p-4">
                <table className="w-full">
                  <tbody>
                    <SkeletonTableRows rows={5} cols={4} />
                  </tbody>
                </table>
              </div>
            ) : files.length === 0 ? (
              <div className="py-16 text-center space-y-1">
                <FileText className="h-8 w-8 text-zinc-300 mx-auto" />
                <p className="text-sm font-medium text-zinc-700">
                  No hay archivos .log generados aún
                </p>
                <p className="text-xs text-zinc-400">
                  Los archivos diarios se crean automáticamente al registrar actividad en Backend, Web o Mobile.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50/70 text-2xs font-semibold uppercase tracking-wider text-zinc-500">
                      <th className="py-3 px-4">Origen</th>
                      <th className="py-3 px-4">Archivo</th>
                      <th className="py-3 px-4 text-right">Tamaño</th>
                      <th className="py-3 px-4">Última modificación</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-xs">
                    {files.map((file) => {
                      const src = SOURCE_META[file.source];
                      const key = `${file.source}/${file.filename}`;
                      const isDownloading = downloadingFile === key;
                      return (
                        <tr key={key} className="hover:bg-zinc-50/60">
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-3xs font-semibold ${src.badgeCls}`}
                            >
                              {src.icon}
                              {src.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-zinc-800">
                            {file.filename}
                          </td>
                          <td className="py-3 px-4 text-right text-zinc-500">
                            {formatBytes(file.sizeBytes)}
                          </td>
                          <td className="py-3 px-4 text-zinc-500">
                            {formatDateTime(file.lastModified)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isDownloading}
                              onClick={() => void handleDownloadLogFile(file)}
                              className="h-7 gap-1 text-xs"
                            >
                              <Download className="h-3.5 w-3.5" />
                              {isDownloading ? "Descargando..." : "Descargar .log"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
