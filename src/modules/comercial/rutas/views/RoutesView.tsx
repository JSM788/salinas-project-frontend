"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import { APP_CONSTANTS } from "@/config/constants";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { APP_ROUTES } from "@/config/routes";
import { DashboardShell } from "@/shared/layout/DashboardShell";
import { PageHeader } from "@/shared/patterns/PageHeader";
import { Tabs } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import { useAuth } from "@/shared/lib/auth-context";
import { errorText } from "@/shared/api/client";
import { useDirectory } from "@/modules/platform/use-resource";
import {
  customerAssigneeSchema,
  managedCustomerSchema,
} from "@/shared/api/customer-management";
import { fieldOperationsApi } from "@/shared/api/services";
import {
  DAYS_OF_WEEK,
  formatDateISO,
  formatDurationMinutes,
  formatTimeHM,
  getMondayOfCurrentWeek,
  toLimaDateISO,
} from "@/shared/lib/date";
import { calculateRouteDistanceKm } from "@/shared/lib/geo";

import type { SellerWorkday, Stop, VisitExecution, WeekRoutesMap } from "../types";
import { createEmptyRoutesMap, isLockedStop } from "../utils";
import { DayRouteCard } from "../components/DayRouteCard";
import { AddStopsModal } from "../components/AddStopsModal";
import { ResultsTab } from "../components/ResultsTab";

export function RoutesView() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const canManage =
    session?.permissions?.includes("manage_customers") === true ||
    session?.permissions?.includes("manage_field_operations") === true;

  const realCustomersDir = useDirectory(
    canManage ? API_ENDPOINTS.CUSTOMERS.ROOT : undefined,
    managedCustomerSchema,
  );
  const realAssigneesDir = useDirectory(
    canManage ? API_ENDPOINTS.CUSTOMERS.ASSIGNEES : undefined,
    customerAssigneeSchema,
  );

  const [activeTab, setActiveTab] = useState<string>("rutas");
  const [commercial, setCommercial] = useState<string>("");
  const [routes, setRoutes] = useState<WeekRoutesMap>(createEmptyRoutesMap);
  const [scheduling, setScheduling] = useState(false);
  const [serverVisitCount, setServerVisitCount] = useState(0);
  const [addingDay, setAddingDay] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateISO(new Date()));

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<{ dayKey: string; index: number } | null>(null);

  const mondayDate = useMemo(() => getMondayOfCurrentWeek(), []);
  const weekDates = useMemo(() => {
    const dates: Record<string, string> = {};
    DAYS_OF_WEEK.forEach(({ key, dayIndex }) => {
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

  // Load weekly routes from backend via TanStack Query + service layer
  const weeklyAgendaQuery = useQuery({
    queryKey: ["routes-weekly-agenda", commercial, weekDates.lunes, weekDates.viernes],
    enabled: Boolean(commercial),
    queryFn: () =>
      fieldOperationsApi.getAgenda({
        membershipId: commercial,
        dateFrom: weekDates.lunes,
        dateTo: weekDates.viernes,
        pageSize: APP_CONSTANTS.PAGINATION.MAX_PAGE_SIZE,
      }),
  });
  const loadingAgenda = weeklyAgendaQuery.isFetching;

  useEffect(() => {
    if (!weeklyAgendaQuery.data) return;
    const newRoutes = createEmptyRoutesMap();
    const items = weeklyAgendaQuery.data.items || [];
    let activeCount = 0;

    items.forEach((visit) => {
      if (visit.status === "cancelled") return;
      const visitDateStr = toLimaDateISO(visit.scheduled_at);
      const matchedDay = DAYS_OF_WEEK.find(({ key }) => weekDates[key] === visitDateStr);
      if (matchedDay) {
        const hasCoords =
          visit.customer_latitude != null && visit.customer_longitude != null;
        newRoutes[matchedDay.key].push({
          id: visit.customer_id,
          order: visit.stop_order ?? newRoutes[matchedDay.key].length + 1,
          code: visit.customer_ruc ? `RUC-${visit.customer_ruc.slice(0, 8)}` : "CLI",
          name: visit.customer_name,
          tradeName: visit.customer_name,
          district: visit.customer_district || "Sin distrito",
          address: visit.customer_address,
          ruc: visit.customer_ruc || "Sin RUC",
          phone: "-",
          lat: hasCoords ? visit.customer_latitude : null,
          lng: hasCoords ? visit.customer_longitude : null,
          hasCoords,
          visitStatus: visit.status,
        });
        activeCount++;
      }
    });

    // Sort stops by order
    Object.keys(newRoutes).forEach((k) => {
      newRoutes[k].sort((a, b) => a.order - b.order);
      newRoutes[k] = newRoutes[k].map((item, idx) => ({ ...item, order: idx + 1 }));
    });

    setRoutes(newRoutes);
    setServerVisitCount(activeCount);
  }, [weeklyAgendaQuery.data, weekDates]);

  // Load day results from backend via TanStack Query + service layer
  const dayResultsQuery = useQuery({
    queryKey: ["routes-day-results", selectedDate],
    enabled: activeTab === "resultados",
    queryFn: () =>
      Promise.all([
        fieldOperationsApi.getWorkdays({
          date: selectedDate,
          pageSize: APP_CONSTANTS.PAGINATION.MAX_PAGE_SIZE,
        }),
        fieldOperationsApi.getAgenda({
          date: selectedDate,
          pageSize: APP_CONSTANTS.PAGINATION.MAX_PAGE_SIZE,
        }),
      ]),
  });
  const loadingWorkdays = dayResultsQuery.isFetching;

  const workdaysData = useMemo<SellerWorkday[]>(() => {
    if (!dayResultsQuery.data) return [];
    const [workdaysRes, visitsRes] = dayResultsQuery.data;
    const workdays = workdaysRes.items || [];
    const visits = visitsRes.items || [];

    return commercialOptions.map((co) => {
      const wd = workdays.find((w) => w.membership_id === co.value);
      const sellerVisits = visits.filter((v) => v.membership_id === co.value);

      const visitsExec: VisitExecution[] = sellerVisits.map((v, i) => {
        let resName: VisitExecution["result"] = "Pendiente";
        if (v.result === "attended") resName = "Atendida";
        else if (v.result === "closed") resName = "Local cerrado";
        else if (v.result === "unavailable") resName = "No atendida";

        return {
          id: v.id,
          order: v.stop_order ?? i + 1,
          customerName: v.customer_name,
          sedeCode: v.customer_ruc ? `RUC-${v.customer_ruc}` : "CLI",
          district: v.customer_district || "Sin distrito",
          address: v.customer_address,
          arrivedAt: formatTimeHM(v.arrived_at),
          endedAt: formatTimeHM(v.ended_at),
          duration: formatDurationMinutes(v.arrived_at, v.ended_at),
          result: resName,
          photosCount: v.has_evidence ? 1 : 0,
          gpsStatus:
            v.arrived_at &&
            v.customer_latitude != null &&
            v.customer_longitude != null
              ? "Validado"
              : "No aplica",
        };
      });

      const completed = visitsExec.filter((v) => v.result !== "Pendiente").length;
      const geoOrderedVisits = sellerVisits
        .filter(
          (v) =>
            (v.status === "completed" || v.status === "active") &&
            v.customer_latitude != null &&
            v.customer_longitude != null,
        )
        .sort((a, b) => {
          if (a.arrived_at && b.arrived_at) {
            return new Date(a.arrived_at).getTime() - new Date(b.arrived_at).getTime();
          }
          return (a.stop_order ?? Number.MAX_SAFE_INTEGER) - (b.stop_order ?? Number.MAX_SAFE_INTEGER);
        })
        .map((v) => ({
          latitude: v.customer_latitude!,
          longitude: v.customer_longitude!,
        }));
      const totalKm = calculateRouteDistanceKm(geoOrderedVisits);
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
        startedAt: formatTimeHM(wd?.started_at),
        endedAt: wd?.ended_at ? formatTimeHM(wd.ended_at) : wd?.status === "active" ? "En curso" : "—",
        completedStops: completed,
        totalStops: visitsExec.length,
        totalKm,
        status: statusText,
        visits: visitsExec,
      };
    });
  }, [dayResultsQuery.data, commercialOptions]);

  const catalog = useMemo<Omit<Stop, "order">[]>(() => {
    return (realCustomersDir.data ?? []).map((c, idx) => {
      const hasCoords = c.latitude != null && c.longitude != null;
      return {
        id: c.id,
        code: c.ruc ? `RUC-${c.ruc.slice(0, 8)}` : `CLI-${String(idx + 1).padStart(4, "0")}`,
        name: c.name,
        tradeName: c.name,
        district: c.district || "Sin distrito",
        address: c.address,
        ruc: c.ruc || "Sin RUC",
        phone: "-",
        lat: hasCoords ? c.latitude : null,
        lng: hasCoords ? c.longitude : null,
        hasCoords,
      };
    });
  }, [realCustomersDir.data]);

  // Set of all customer IDs assigned across the current week
  const assignedWeekCustomerIds = useMemo(() => {
    const set = new Set<string>();
    Object.values(routes).forEach((stopList) => {
      stopList.forEach((stop) => set.add(stop.id));
    });
    return set;
  }, [routes]);

  const handleDragStart = (e: React.DragEvent, dayKey: string, index: number) => {
    const item = routes[dayKey]?.[index];
    if (item && isLockedStop(item)) {
      e.preventDefault();
      return;
    }
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
    const candidate = sourceList[draggedItem.index];
    if (!candidate || isLockedStop(candidate)) {
      setDraggedItem(null);
      return;
    }

    const [movedItem] = sourceList.splice(draggedItem.index, 1);

    if (draggedItem.dayKey === targetDayKey) {
      const insertAt = targetIndex !== undefined ? targetIndex : sourceList.length;
      sourceList.splice(insertAt, 0, movedItem);
      const reindexed = sourceList.map((item, idx) => ({ ...item, order: idx + 1 }));
      setRoutes({ ...routes, [targetDayKey]: reindexed });
      toast.info("Orden de paradas actualizado");
    } else {
      if (routes[targetDayKey].some(isLockedStop)) {
        toast.info("No puedes agregar paradas a un día cuya jornada ya comenzó o finalizó.");
        setDraggedItem(null);
        return;
      }
      const targetList = [...routes[targetDayKey]];
      if (targetList.some((stop) => stop.id === movedItem.id)) {
        toast.error("Este cliente ya está asignado en ese día.");
        setDraggedItem(null);
        return;
      }
      if (targetList.length >= APP_CONSTANTS.FIELD_OPERATIONS.MAX_STOPS_PER_DAY) {
        toast.error(`Límite alcanzado: Máximo ${APP_CONSTANTS.FIELD_OPERATIONS.MAX_STOPS_PER_DAY} paradas por día.`);
        setDraggedItem(null);
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
    const target = routes[dayKey].find((s) => s.id === stopId);
    if (target && isLockedStop(target)) {
      toast.info("No se puede quitar una visita ya iniciada o completada.");
      return;
    }
    const filtered = routes[dayKey].filter((s) => s.id !== stopId);
    const reindexed = filtered.map((item, idx) => ({ ...item, order: idx + 1 }));
    setRoutes({ ...routes, [dayKey]: reindexed });
    toast.info("Parada removida de la ruta");
  };

  const handleAddMultipleStops = (selectedCustomerIds: string[]) => {
    if (!addingDay) return;
    const current = routes[addingDay];
    const availableSlots = APP_CONSTANTS.FIELD_OPERATIONS.MAX_STOPS_PER_DAY - current.length;
    if (availableSlots <= 0) {
      toast.error(`Límite alcanzado: Máximo ${APP_CONSTANTS.FIELD_OPERATIONS.MAX_STOPS_PER_DAY} paradas por ruta diaria.`);
      return;
    }

    const toAdd = catalog
      .filter((c) => selectedCustomerIds.includes(c.id) && !assignedWeekCustomerIds.has(c.id))
      .slice(0, availableSlots);

    if (toAdd.length === 0) {
      toast.error("Selecciona al menos un cliente disponible para esta semana.");
      return;
    }

    const newStops: Stop[] = toAdd.map((cand, i) => ({
      ...cand,
      id: cand.id,
      order: current.length + 1 + i,
      visitStatus: "pending",
    }));

    setRoutes({ ...routes, [addingDay]: [...current, ...newStops] });
    setAddingDay(null);
    toast.success(`Se agregaron ${newStops.length} paradas a la ruta de ${addingDay.toUpperCase()}`);
  };

  const handleScheduleWeek = async () => {
    if (scheduling || !commercial) return;
    setScheduling(true);
    try {
      const daysPayload = DAYS_OF_WEEK.map(({ key }) => ({
        date: weekDates[key],
        customerIds: routes[key].map((s) => s.id),
      }));

      const totalStops = daysPayload.reduce((acc, d) => acc + d.customerIds.length, 0);
      if (totalStops === 0 && serverVisitCount === 0) {
        toast.error("Agrega clientes a al menos un día antes de sincronizar la agenda.");
        return;
      }

      const syncResult = await fieldOperationsApi.syncWeeklyRoutes(
        {
          membershipId: commercial,
          days: daysPayload,
        },
        `sync-${commercial}-${weekDates.lunes}-${Date.now()}`,
      );

      toast.success(
        syncResult.scheduled > 0
          ? `¡Agenda semanal sincronizada con éxito en base de datos! (${syncResult.scheduled} visitas programadas)`
          : "Agenda semanal actualizada en base de datos (0 visitas programadas).",
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["routes-weekly-agenda"] }),
        queryClient.invalidateQueries({ queryKey: ["routes-day-results"] }),
        queryClient.invalidateQueries({ queryKey: ["api"] }),
      ]);
    } catch (cause) {
      toast.error(errorText(cause));
    } finally {
      setScheduling(false);
    }
  };

  return (
    <DashboardShell connected>
      <div className="space-y-5">
        <PageHeader
          breadcrumbs={[
            { label: "Operación de campo", href: `${APP_ROUTES.CUSTOMERS}/` },
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
                  onClick={() => void weeklyAgendaQuery.refetch()}
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
                  <b>Semana actual:</b> Lunes ({weekDates.lunes}) a Viernes ({weekDates.viernes}). Máximo {APP_CONSTANTS.FIELD_OPERATIONS.MAX_STOPS_PER_DAY} paradas por día. Los cambios se guardan directamente en PostgreSQL.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {DAYS_OF_WEEK.map(({ key, label }) => (
                <DayRouteCard
                  key={key}
                  dayKey={key}
                  dayLabel={label}
                  dayDate={weekDates[key]}
                  stops={routes[key] || []}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onRemoveStop={handleRemove}
                  onOpenAddModal={setAddingDay}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === "resultados" && (
          <ResultsTab
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            workdaysData={workdaysData}
            loadingWorkdays={loadingWorkdays}
            onRefresh={() => void dayResultsQuery.refetch()}
          />
        )}

        {addingDay && (
          <AddStopsModal
            dayKey={addingDay}
            dayDate={weekDates[addingDay]}
            catalog={catalog}
            assignedWeekCustomerIds={assignedWeekCustomerIds}
            currentStopsCount={routes[addingDay]?.length || 0}
            onClose={() => setAddingDay(null)}
            onAdd={handleAddMultipleStops}
          />
        )}
      </div>
    </DashboardShell>
  );
}

