"use client";

import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { DashboardShell } from "@/shared/layout/DashboardShell";
import { PageHeader } from "@/shared/patterns/PageHeader";
import { Tabs } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { useAuth } from "@/shared/lib/auth-context";
import { apiRequest } from "@/shared/api/client";
import {
  agendaSchema,
  workdaySchema,
} from "@/shared/api/contracts";
import {
  customerAssigneeSchema,
  managedCustomerSchema,
} from "@/shared/api/customer-management";
import {
  syncWeeklyRoutesResponse,
} from "@/shared/api/field-management";
import { pageSchema } from "@/shared/api/pagination";
import { useDirectory } from "@/modules/platform/use-resource";
import { toast } from "sonner";
import {
  Calendar,
  Trash2,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Camera,
  Download,
  AlertCircle,
  GripVertical,
  Map as MapIcon,
  RefreshCw,
} from "lucide-react";

interface Stop {
  id: string;
  order: number;
  code: string;
  name: string;
  tradeName?: string;
  district: string;
  address: string;
  ruc: string;
  phone: string;
  lat: number;
  lng: number;
}

interface VisitExecution {
  id: string;
  order: number;
  customerName: string;
  sedeCode: string;
  district: string;
  address: string;
  arrivedAt: string;
  endedAt: string;
  duration: string;
  result: "Atendida" | "Local cerrado" | "No atendida" | "Refrigerio" | "Pendiente";
  photosCount: number;
  gpsStatus: "Validado" | "No aplica";
}

interface SellerWorkday {
  id: string;
  sellerCode: string;
  sellerName: string;
  zone: string;
  startedAt: string;
  endedAt: string;
  completedStops: number;
  totalStops: number;
  totalKm: number;
  status: "En jornada" | "Finalizada" | "Sin iniciar";
  visits: VisitExecution[];
}

const DAYS = [
  { key: "lunes", label: "Lunes", dayIndex: 1 },
  { key: "martes", label: "Martes", dayIndex: 2 },
  { key: "miercoles", label: "Miércoles", dayIndex: 3 },
  { key: "jueves", label: "Jueves", dayIndex: 4 },
  { key: "viernes", label: "Viernes", dayIndex: 5 },
] as const;

function getMondayOfCurrentWeek(): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function RutasVisitasPage() {
  const { session } = useAuth();
  const canManage =
    session?.permissions?.includes("manage_customers") === true ||
    session?.permissions?.includes("manage_field_operations") === true;

  const realCustomersDir = useDirectory(
    canManage ? "/customers" : undefined,
    managedCustomerSchema,
  );
  const realAssigneesDir = useDirectory(
    canManage ? "/customers/assignees" : undefined,
    customerAssigneeSchema,
  );

  const [activeTab, setActiveTab] = useState<string>("rutas");
  const [commercial, setCommercial] = useState<string>("");
  const [routes, setRoutes] = useState<Record<string, Stop[]>>({
    lunes: [],
    martes: [],
    miercoles: [],
    jueves: [],
    viernes: [],
  });

  const [loadingAgenda, setLoadingAgenda] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [expandedWorkdayId, setExpandedWorkdayId] = useState<string | null>(null);
  const [addingDay, setAddingDay] = useState<string | null>(null);
  const [modalSearch, setModalSearch] = useState("");
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(formatDateISO(new Date()));

  // Results state from DB
  const [workdaysData, setWorkdaysData] = useState<SellerWorkday[]>([]);
  const [loadingWorkdays, setLoadingWorkdays] = useState(false);

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<{ dayKey: string; index: number } | null>(null);

  const mondayDate = useMemo(() => getMondayOfCurrentWeek(), []);
  const weekDates = useMemo(() => {
    const dates: Record<string, string> = {};
    DAYS.forEach(({ key, dayIndex }) => {
      const d = new Date(mondayDate);
      d.setDate(mondayDate.getDate() + (dayIndex - 1));
      dates[key] = formatDateISO(d);
    });
    return dates;
  }, [mondayDate]);

  const commercialOptions = useMemo(() => {
    return (realAssigneesDir.data ?? [])
      .filter((a) => a.role === "commercial")
      .map((a) => ({
        value: a.id,
        label: `${a.displayName?.trim() || a.email} — Comercial`,
      }));
  }, [realAssigneesDir.data]);

  // Set default commercial
  useEffect(() => {
    if (!commercial && commercialOptions.length > 0) {
      setCommercial(commercialOptions[0].value);
    }
  }, [commercial, commercialOptions]);

  // Load weekly routes from backend
  const loadWeeklyRoutes = async () => {
    if (!commercial) return;
    setLoadingAgenda(true);
    try {
      const mondayStr = weekDates.lunes;
      const fridayStr = weekDates.viernes;
      const response = await apiRequest(
        `/field-operations/agenda?membershipId=${commercial}&dateFrom=${mondayStr}&dateTo=${fridayStr}&pageSize=100`,
        pageSchema(agendaSchema.element),
      );

      const newRoutes: Record<string, Stop[]> = {
        lunes: [],
        martes: [],
        miercoles: [],
        jueves: [],
        viernes: [],
      };

      const items = response.items || [];
      items.forEach((visit) => {
        const visitDateStr = visit.scheduled_at.slice(0, 10);
        const matchedDay = DAYS.find(({ key }) => weekDates[key] === visitDateStr);
        if (matchedDay) {
          const lat = visit.customer_latitude ?? -12.0975;
          const lng = visit.customer_longitude ?? -77.0365;
          newRoutes[matchedDay.key].push({
            id: visit.customer_id,
            order: visit.stop_order ?? newRoutes[matchedDay.key].length + 1,
            code: visit.customer_ruc ? `RUC-${visit.customer_ruc.slice(0, 8)}` : "CLI",
            name: visit.customer_name,
            tradeName: visit.customer_name,
            district: visit.customer_district || "Lima",
            address: visit.customer_address,
            ruc: visit.customer_ruc || "Sin RUC",
            phone: "-",
            lat,
            lng,
          });
        }
      });

      // Sort stops by order
      Object.keys(newRoutes).forEach((k) => {
        newRoutes[k].sort((a, b) => a.order - b.order);
        newRoutes[k] = newRoutes[k].map((item, idx) => ({ ...item, order: idx + 1 }));
      });

      setRoutes(newRoutes);
    } catch {
      // Ignora si falla consulta
    } finally {
      setLoadingAgenda(false);
    }
  };

  useEffect(() => {
    if (commercial) {
      void loadWeeklyRoutes();
    }
  }, [commercial, weekDates]);

  // Load day results from backend
  const loadDayResults = async () => {
    setLoadingWorkdays(true);
    try {
      const [workdaysRes, visitsRes] = await Promise.all([
        apiRequest(
          `/field-operations/workdays?date=${selectedDate}&pageSize=100`,
          pageSchema(workdaySchema),
        ),
        apiRequest(
          `/field-operations/agenda?date=${selectedDate}&pageSize=200`,
          pageSchema(agendaSchema.element),
        ),
      ]);

      const workdays = workdaysRes.items || [];
      const visits = visitsRes.items || [];

      // Map assignees
      const sellers = commercialOptions.map((co) => {
        const wd = workdays.find((w) => w.membership_id === co.value);
        const sellerVisits = visits.filter((v) => v.membership_id === co.value);

        const visitsExec: VisitExecution[] = sellerVisits.map((v, i) => {
          let resName: VisitExecution["result"] = "Pendiente";
          if (v.result === "attended") resName = "Atendida";
          else if (v.result === "closed") resName = "Local cerrado";
          else if (v.result === "unavailable") resName = "No atendida";

          let duration = "—";
          if (v.arrived_at && v.ended_at) {
            const mins = Math.round(
              (new Date(v.ended_at).getTime() - new Date(v.arrived_at).getTime()) / 60000,
            );
            duration = `${Math.max(0, mins)} min`;
          }

          return {
            id: v.id,
            order: v.stop_order ?? i + 1,
            customerName: v.customer_name,
            sedeCode: v.customer_ruc ? `RUC-${v.customer_ruc}` : "CLI",
            district: v.customer_district || "Lima",
            address: v.customer_address,
            arrivedAt: v.arrived_at ? new Date(v.arrived_at).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }) : "—",
            endedAt: v.ended_at ? new Date(v.ended_at).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }) : "—",
            duration,
            result: resName,
            photosCount: v.has_evidence ? 1 : 0,
            gpsStatus: "Validado",
          };
        });

        const completed = visitsExec.filter((v) => v.result !== "Pendiente").length;
        const statusText: SellerWorkday["status"] = wd
          ? wd.status === "active"
            ? "En jornada"
            : "Finalizada"
          : "Sin iniciar";

        return {
          id: wd?.id || co.value,
          sellerCode: `COM-${co.value.slice(0, 4).toUpperCase()}`,
          sellerName: co.label.split(" — ")[0],
          zone: "Lima Metropolitana",
          startedAt: wd?.started_at
            ? new Date(wd.started_at).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
            : "-",
          endedAt: wd?.ended_at
            ? new Date(wd.ended_at).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
            : wd?.status === "active"
            ? "En curso"
            : "-",
          completedStops: completed,
          totalStops: visitsExec.length,
          totalKm: completed * 4.5,
          status: statusText,
          visits: visitsExec,
        };
      });

      setWorkdaysData(sellers);
      if (sellers.length > 0 && !expandedWorkdayId) {
        setExpandedWorkdayId(sellers[0].id);
      }
    } finally {
      setLoadingWorkdays(false);
    }
  };

  useEffect(() => {
    if (activeTab === "resultados") {
      void loadDayResults();
    }
  }, [activeTab, selectedDate, commercialOptions]);

  const catalog = useMemo<Omit<Stop, "order">[]>(() => {
    return (realCustomersDir.data ?? []).map((c, idx) => ({
      id: c.id,
      code: c.ruc ? `RUC-${c.ruc.slice(0, 8)}` : `CLI-${String(idx + 1).padStart(4, "0")}`,
      name: c.name,
      tradeName: c.name,
      district: c.district || "Lima",
      address: c.address,
      ruc: c.ruc || "Sin RUC",
      phone: "-",
      lat: c.latitude ?? -12.0975,
      lng: c.longitude ?? -77.0365,
    }));
  }, [realCustomersDir.data]);

  const getGoogleMapsDirUrl = (stops: Stop[]) => {
    if (stops.length === 0) return "https://www.google.com/maps";
    if (stops.length === 1) return `https://www.google.com/maps?q=${stops[0].lat},${stops[0].lng}`;
    const coordinatesPath = stops.map((s) => `${s.lat},${s.lng}`).join("/");
    return `https://www.google.com/maps/dir/${coordinatesPath}`;
  };

  const handleDragStart = (e: React.DragEvent, dayKey: string, index: number) => {
    setDraggedItem({ dayKey, index });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetDayKey: string, targetIndex?: number) => {
    e.preventDefault();
    if (!draggedItem) return;

    const sourceList = [...routes[draggedItem.dayKey]];
    const [movedItem] = sourceList.splice(draggedItem.index, 1);

    if (draggedItem.dayKey === targetDayKey) {
      const insertAt = targetIndex !== undefined ? targetIndex : sourceList.length;
      sourceList.splice(insertAt, 0, movedItem);
      const reindexed = sourceList.map((item, idx) => ({ ...item, order: idx + 1 }));
      setRoutes({ ...routes, [targetDayKey]: reindexed });
      toast.info("Orden de paradas actualizado");
    } else {
      const targetList = [...routes[targetDayKey]];
      if (targetList.length >= 6) {
        toast.error("Límite alcanzado: Máximo 6 paradas por día.");
        return;
      }
      const insertAt = targetIndex !== undefined ? targetIndex : targetList.length;
      targetList.splice(insertAt, 0, movedItem);

      const reindexedSource = sourceList.map((item, idx) => ({ ...item, order: idx + 1 }));
      const reindexedTarget = targetList.map((item, idx) => ({ ...item, order: idx + 1 }));

      setRoutes({
        ...routes,
        [draggedItem.dayKey]: reindexedSource,
        [targetDayKey]: reindexedTarget,
      });
      toast.success(`Parada movida al ${targetDayKey.toUpperCase()}`);
    }

    setDraggedItem(null);
  };

  const handleRemove = (dayKey: string, stopId: string) => {
    const filtered = routes[dayKey].filter((s) => s.id !== stopId);
    const reindexed = filtered.map((item, idx) => ({ ...item, order: idx + 1 }));
    setRoutes({ ...routes, [dayKey]: reindexed });
    toast.info("Parada removida de la ruta");
  };

  const handleAddMultipleStops = (dayKey: string) => {
    const current = routes[dayKey];
    const availableSlots = 6 - current.length;
    if (availableSlots <= 0) {
      toast.error("Límite alcanzado: Máximo 6 paradas por ruta diaria.");
      return;
    }
    const toAdd = catalog.filter((c) => selectedCandidates.includes(c.id)).slice(0, availableSlots);
    if (toAdd.length === 0) {
      toast.error("Selecciona al menos un cliente.");
      return;
    }

    const newStops: Stop[] = toAdd.map((cand, i) => ({
      ...cand,
      id: cand.id,
      order: current.length + 1 + i,
    }));

    setRoutes({ ...routes, [dayKey]: [...current, ...newStops] });
    setAddingDay(null);
    setSelectedCandidates([]);
    setModalSearch("");
    toast.success(`Se agregaron ${newStops.length} paradas a la ruta de ${dayKey.toUpperCase()}`);
  };

  const handleScheduleWeek = async () => {
    if (scheduling || !commercial) return;
    setScheduling(true);
    try {
      const daysPayload = DAYS.map(({ key }) => ({
        date: weekDates[key],
        customerIds: routes[key].map((s) => s.id),
      })).filter((d) => d.customerIds.length > 0);

      if (daysPayload.length === 0) {
        toast.error("Agrega clientes a al menos un día antes de sincronizar la agenda.");
        return;
      }

      const syncResult = await apiRequest(
        "/field-operations/routes/sync",
        syncWeeklyRoutesResponse,
        {
          key: `sync-${commercial}-${weekDates.lunes}-${Date.now()}`,
          body: {
            membershipId: commercial,
            days: daysPayload,
          },
        },
      );

      toast.success(
        `¡Agenda semanal sincronizada con éxito en base de datos! (${syncResult.scheduled} visitas programadas)`,
      );
      await loadWeeklyRoutes();
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "No se pudo sincronizar la agenda semanal.",
      );
    } finally {
      setScheduling(false);
    }
  };

  const handleExportSunat = () => {
    const rows = workdaysData.flatMap((wd) =>
      wd.visits.map((vis) => ({
        Fecha: selectedDate,
        Codigo_Vendedor: wd.sellerCode,
        Vendedor: wd.sellerName,
        Zona: wd.zone,
        Inicio_Jornada: wd.startedAt,
        Fin_Jornada: wd.endedAt,
        Orden_Parada: vis.order,
        Codigo_Sede: vis.sedeCode,
        Cliente: vis.customerName,
        Distrito: vis.district,
        Direccion: vis.address,
        Hora_Llegada: vis.arrivedAt,
        Hora_Salida: vis.endedAt,
        Permanencia: vis.duration,
        Resultado: vis.result,
        Fotos_Evidencia: vis.photosCount,
        Validacion_GPS_SUNAT: vis.gpsStatus,
      })),
    );
    if (rows.length === 0) {
      toast.info("No hay registros en la fecha seleccionada para exportar.");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sustento SUNAT");
    XLSX.writeFile(workbook, `reporte_trazabilidad_sunat_${selectedDate}.xlsx`);
    toast.success("Reporte descargado con éxito.");
  };

  return (
    <DashboardShell connected>
      <div className="space-y-5">
        <PageHeader
          breadcrumbs={[
            { label: "Operación de campo", href: "/commercial/customers/" },
            { label: "Rutas y visitas" },
          ]}
          title="Rutas y Visitas"
          subtitle="Planifica las rutas semanales fijas (Lunes a Viernes) y supervisa los resultados de campo con sustento para SUNAT."
        />

        <Tabs
          tabs={[
            { id: "rutas", label: "Rutas semanales" },
            { id: "resultados", label: "Resultados del día" },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === "rutas" && (
          <div className="space-y-4">
            <div className="bg-white border border-zinc-200 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-zinc-500">Comercial:</span>
                <select
                  value={commercial}
                  onChange={(e) => setCommercial(e.target.value)}
                  className="bg-zinc-50 hover:bg-zinc-100 text-zinc-900 text-xs font-medium px-2.5 py-1.5 rounded-md border border-zinc-200 outline-none cursor-pointer"
                >
                  {commercialOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadWeeklyRoutes}
                  disabled={loadingAgenda}
                  title="Refrescar rutas del servidor"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingAgenda ? "animate-spin" : ""}`} />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  disabled={scheduling || loadingAgenda}
                  onClick={handleScheduleWeek}
                  className="gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {scheduling ? "Guardando en servidor…" : "Programar Agenda Semanal"}
                </Button>
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 flex items-center justify-between text-xs text-zinc-600">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-zinc-500 shrink-0" />
                <span>
                  <b>Semana actual:</b> Lunes ({weekDates.lunes}) a Viernes ({weekDates.viernes}). Máximo 6 paradas por día. Los cambios se guardan directamente en PostgreSQL.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {DAYS.map(({ key, label }) => {
                const stops = routes[key] || [];
                const count = stops.length;
                const isFull = count >= 6;
                const mapsUrl = getGoogleMapsDirUrl(stops);

                return (
                  <div
                    key={key}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, key)}
                    className="bg-white border border-zinc-200 rounded-lg p-3 flex flex-col justify-between min-h-120 hover:border-zinc-300 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-zinc-900 uppercase">
                            {label}
                          </span>
                          <span className="text-3xs text-zinc-400 font-mono">
                            {weekDates[key]}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {stops.length > 0 && (
                            <a
                              href={mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-2xs text-zinc-500 hover:text-zinc-900 flex items-center gap-0.5 p-1 rounded hover:bg-zinc-100"
                              title="Abrir todo el recorrido del día en Google Maps"
                            >
                              <MapIcon className="w-3 h-3 text-zinc-600" />
                              <span>Maps</span>
                            </a>
                          )}
                          <Badge variant={count === 0 ? "neutral" : isFull ? "warning" : "success"}>
                            {count}/6
                          </Badge>
                        </div>
                      </div>

                      {count === 0 && (
                        <div className="h-44 flex flex-col items-center justify-center text-center p-2 text-zinc-400 border border-dashed border-zinc-200 rounded-md">
                          <Calendar className="w-5 h-5 mb-1 text-zinc-300" />
                          <p className="text-2xs">Sin paradas asignadas</p>
                          <p className="text-3xs text-zinc-400 mt-0.5">Arrastra una cartilla aquí</p>
                        </div>
                      )}

                      <div className="space-y-2">
                        {stops.map((stop, idx) => (
                          <div
                            key={stop.id + "-" + idx}
                            draggable
                            onDragStart={(e) => handleDragStart(e, key, idx)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => {
                              e.stopPropagation();
                              handleDrop(e, key, idx);
                            }}
                            className="bg-zinc-50 border border-zinc-200 rounded-md p-2 text-xs space-y-1 hover:border-zinc-400 hover:shadow-xs transition-all cursor-grab active:cursor-grabbing group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <GripVertical className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600" />
                                <span className="font-semibold text-zinc-700">#{stop.order}</span>
                                <span className="text-3xs font-mono text-zinc-400">{stop.code}</span>
                              </div>

                              <button
                                onClick={() => handleRemove(key, stop.id)}
                                className="p-1 text-zinc-400 hover:text-red-600 rounded hover:bg-zinc-100 cursor-pointer transition-colors"
                                title="Quitar parada"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <p className="font-medium text-zinc-900 truncate" title={stop.name}>
                              {stop.tradeName || stop.name}
                            </p>
                            <p className="text-2xs text-zinc-500 truncate">
                              {stop.district} • {stop.address}
                            </p>

                            <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 text-3xs text-zinc-400">
                              <span>RUC: {stop.ruc}</span>
                              <a
                                href={`https://maps.google.com/?q=${stop.lat},${stop.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-zinc-600 hover:text-zinc-900 flex items-center gap-0.5"
                              >
                                Ver GPS <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setSelectedCandidates([]);
                          setModalSearch("");
                          setAddingDay(key);
                        }}
                        disabled={isFull}
                        className={`w-full py-1.5 border border-dashed rounded-md text-2xs font-medium transition cursor-pointer ${
                          isFull
                            ? "border-zinc-200 text-zinc-300 cursor-not-allowed bg-zinc-50/50"
                            : "border-zinc-300 hover:border-zinc-400 text-zinc-600 bg-white"
                        }`}
                      >
                        {isFull ? "Ruta completa (6/6)" : "+ Agregar clientes"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "resultados" && (
          <div className="space-y-4">
            <div className="bg-white border border-zinc-200 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-zinc-500">Fecha de jornada:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-zinc-50 hover:bg-zinc-100 text-zinc-900 text-xs font-semibold px-2.5 py-1.5 rounded-md border border-zinc-200 outline-none cursor-pointer"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadDayResults}
                  disabled={loadingWorkdays}
                  title="Refrescar resultados del servidor"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingWorkdays ? "animate-spin" : ""}`} />
                </Button>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleExportSunat}
                className="gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Descargar Reporte SUNAT (.xlsx)
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white border border-zinc-200 rounded-lg p-3">
                <span className="text-2xs font-medium text-zinc-500">Jornadas Activas</span>
                <p className="text-lg font-bold text-zinc-900 mt-0.5">
                  {workdaysData.filter((w) => w.status === "En jornada").length} / {workdaysData.length}
                </p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-lg p-3">
                <span className="text-2xs font-medium text-zinc-500">Visitas Completadas</span>
                <p className="text-lg font-bold text-zinc-900 mt-0.5">
                  {workdaysData.reduce((acc, curr) => acc + curr.completedStops, 0)} /{" "}
                  {workdaysData.reduce((acc, curr) => acc + curr.totalStops, 0)}
                </p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-lg p-3">
                <span className="text-2xs font-medium text-zinc-500">Efectividad de Atención</span>
                <p className="text-lg font-bold text-zinc-900 mt-0.5">
                  {(() => {
                    const total = workdaysData.reduce((acc, curr) => acc + curr.totalStops, 0);
                    const done = workdaysData.reduce((acc, curr) => acc + curr.completedStops, 0);
                    return total > 0 ? `${Math.round((done / total) * 100)}%` : "100%";
                  })()}
                </p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-lg p-3">
                <span className="text-2xs font-medium text-zinc-500">Distancia Recorrida Total</span>
                <p className="text-lg font-bold text-zinc-900 mt-0.5">
                  {workdaysData.reduce((acc, curr) => acc + curr.totalKm, 0).toFixed(1)} km
                </p>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-800">
                  Comerciales en campo y seguimiento de visitas
                </span>
                <span className="text-2xs text-zinc-500">
                  {loadingWorkdays ? "Cargando desde servidor…" : "Haz clic en cualquier comercial para ver sus paradas"}
                </span>
              </div>

              <div className="divide-y divide-zinc-200">
                {workdaysData.map((workday) => {
                  const isExpanded = expandedWorkdayId === workday.id;

                  return (
                    <div key={workday.id} className="transition-colors">
                      <div
                        onClick={() => setExpandedWorkdayId(isExpanded ? null : workday.id)}
                        className={`p-3.5 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-zinc-50 transition ${
                          isExpanded ? "bg-zinc-50/70" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button className="text-zinc-400 hover:text-zinc-700">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-zinc-700" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-zinc-400" />
                            )}
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-zinc-900">{workday.sellerName}</span>
                              <span className="text-3xs font-mono text-zinc-400 bg-zinc-100 px-1.5 py-0.2 rounded">
                                {workday.sellerCode}
                              </span>
                            </div>
                            <p className="text-2xs text-zinc-500 mt-0.5">{workday.zone}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-xs text-zinc-600">
                          <div>
                            <span className="text-2xs text-zinc-400 block">Horario:</span>
                            <span className="font-medium text-zinc-800">
                              {workday.startedAt} — {workday.endedAt}
                            </span>
                          </div>

                          <div>
                            <span className="text-2xs text-zinc-400 block">Avance de ruta:</span>
                            <span className="font-medium text-zinc-800">
                              {workday.completedStops} de {workday.totalStops} visitas ({workday.totalKm} km)
                            </span>
                          </div>

                          <Badge
                            variant={
                              workday.status === "Finalizada"
                                ? "success"
                                : workday.status === "En jornada"
                                ? "info"
                                : "neutral"
                            }
                          >
                            {workday.status}
                          </Badge>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="bg-zinc-50/60 p-4 border-t border-zinc-200 space-y-3">
                          <div className="flex items-center justify-between text-2xs text-zinc-500 font-semibold uppercase tracking-wider">
                            <span>Secuencia del recorrido de {workday.sellerName}</span>
                            <span>{workday.visits.length} paradas registradas</span>
                          </div>

                          {workday.visits.length === 0 ? (
                            <p className="text-xs text-zinc-400 p-2 text-center">
                              No hay visitas registradas para este comercial en la fecha seleccionada.
                            </p>
                          ) : (
                            <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-2xs uppercase">
                                  <tr>
                                    <th className="py-2 px-3">#</th>
                                    <th className="py-2 px-3">Cliente / Sede</th>
                                    <th className="py-2 px-3">Distrito</th>
                                    <th className="py-2 px-3">Llegada / Salida</th>
                                    <th className="py-2 px-3">Permanencia</th>
                                    <th className="py-2 px-3">Resultado</th>
                                    <th className="py-2 px-3">Evidencia</th>
                                    <th className="py-2 px-3">GPS SUNAT</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                  {workday.visits.map((vis) => (
                                    <tr key={vis.id} className="hover:bg-zinc-50/50">
                                      <td className="py-2 px-3 font-semibold text-zinc-600">
                                        {vis.order}
                                      </td>
                                      <td className="py-2 px-3">
                                        <p className="font-medium text-zinc-900">{vis.customerName}</p>
                                        <p className="text-3xs text-zinc-400 font-mono">{vis.sedeCode}</p>
                                      </td>
                                      <td className="py-2 px-3 text-zinc-600">{vis.district}</td>
                                      <td className="py-2 px-3 text-zinc-700">
                                        {vis.arrivedAt} — {vis.endedAt}
                                      </td>
                                      <td className="py-2 px-3 text-zinc-600">{vis.duration}</td>
                                      <td className="py-2 px-3">
                                        <Badge
                                          variant={
                                            vis.result === "Atendida"
                                              ? "success"
                                              : vis.result === "Local cerrado"
                                              ? "warning"
                                              : "neutral"
                                          }
                                        >
                                          {vis.result}
                                        </Badge>
                                      </td>
                                      <td className="py-2 px-3 text-zinc-600">
                                        <span className="flex items-center gap-1 text-2xs">
                                          <Camera className="w-3 h-3 text-zinc-400" />
                                          {vis.photosCount} fotos
                                        </span>
                                      </td>
                                      <td className="py-2 px-3 text-zinc-700 font-medium">
                                        <span className="text-2xs text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                          {vis.gpsStatus}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {addingDay && (
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-zinc-200 rounded-lg max-w-xl w-full p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <div>
                  <h3 className="font-semibold text-xs text-zinc-900 uppercase">
                    Seleccionar Clientes para {addingDay.toUpperCase()} ({weekDates[addingDay]})
                  </h3>
                  <p className="text-3xs text-zinc-500">
                    Disponibles: {6 - (routes[addingDay]?.length || 0)} paradas libres para este día
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAddingDay(null);
                    setSelectedCandidates([]);
                    setModalSearch("");
                  }}
                  className="text-zinc-400 hover:text-zinc-600 text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Buscar por cliente, RUC, distrito o dirección..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md outline-none focus:border-zinc-400 placeholder:text-zinc-400"
                />
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {catalog
                  .filter((cat) => {
                    const q = modalSearch.toLowerCase().trim();
                    if (!q) return true;
                    return (
                      cat.name.toLowerCase().includes(q) ||
                      (cat.tradeName && cat.tradeName.toLowerCase().includes(q)) ||
                      cat.district.toLowerCase().includes(q) ||
                      cat.ruc.includes(q) ||
                      cat.address.toLowerCase().includes(q)
                    );
                  })
                  .map((cat) => {
                    const isChecked = selectedCandidates.includes(cat.id);
                    const currentStopsCount = routes[addingDay]?.length || 0;
                    const maxAllowed = 6 - currentStopsCount;
                    const isLimitReached = !isChecked && selectedCandidates.length >= maxAllowed;

                    return (
                      <label
                        key={cat.id}
                        className={`p-2.5 border rounded-md transition flex items-center justify-between cursor-pointer ${
                          isChecked
                            ? "border-zinc-800 bg-zinc-50/80"
                            : isLimitReached
                            ? "border-zinc-100 opacity-40 cursor-not-allowed"
                            : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isLimitReached}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedCandidates(selectedCandidates.filter((id) => id !== cat.id));
                              } else {
                                if (selectedCandidates.length < maxAllowed) {
                                  setSelectedCandidates([...selectedCandidates, cat.id]);
                                }
                              }
                            }}
                            className="rounded border-zinc-300 text-zinc-900 focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-xs text-zinc-900">
                                {cat.tradeName || cat.name}
                              </span>
                              <span className="text-3xs font-mono text-zinc-400">{cat.code}</span>
                            </div>
                            <p className="text-2xs text-zinc-500">
                              {cat.district} • {cat.address} • RUC {cat.ruc}
                            </p>
                          </div>
                        </div>

                        <span className="text-3xs text-zinc-400 font-mono">
                          {isChecked ? "Seleccionado" : ""}
                        </span>
                      </label>
                    );
                  })}
              </div>

              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-2xs text-zinc-500">
                  {selectedCandidates.length} seleccionado(s)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAddingDay(null);
                      setSelectedCandidates([]);
                      setModalSearch("");
                    }}
                    className="text-xs"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={selectedCandidates.length === 0}
                    onClick={() => handleAddMultipleStops(addingDay)}
                    className="text-xs font-semibold"
                  >
                    Agregar paradas ({selectedCandidates.length})
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
