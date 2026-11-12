"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  Download,
  RefreshCw,
} from "lucide-react";
import type { SellerWorkday } from "../types";

interface ResultsTabProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  workdaysData: SellerWorkday[];
  loadingWorkdays: boolean;
  onRefresh: () => void;
}

export function ResultsTab({
  selectedDate,
  onDateChange,
  workdaysData,
  loadingWorkdays,
  onRefresh,
}: ResultsTabProps) {
  const [expandedWorkdayId, setExpandedWorkdayId] = useState<string | null>(null);

  const handleExportSunat = () => {
    try {
      const rows = workdaysData.flatMap((wd) =>
        wd.visits.map((vis) => ({
          Fecha: selectedDate,
          Codigo_Vendedor: wd.sellerCode,
          Vendedor: wd.sellerName,
          Zona: wd.zone,
          Inicio_Jornada: wd.startedAt,
          Fin_Jornada: wd.endedAt,
          Distancia_Jornada_Km: wd.totalKm,
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
    } catch (err) {
      console.error("Error generating Excel report:", err);
      toast.error("No se pudo generar el reporte de Excel. Inténtalo nuevamente.");
    }
  };

  const totalVisits = workdaysData.reduce((acc, curr) => acc + curr.totalStops, 0);
  const completedVisits = workdaysData.reduce((acc, curr) => acc + curr.completedStops, 0);
  const totalKm = workdaysData.reduce((acc, curr) => acc + curr.totalKm, 0);
  const activeWorkdays = workdaysData.filter((w) => w.status === "En jornada").length;
  const effectiveness = totalVisits > 0 ? `${Math.round((completedVisits / totalVisits) * 100)}%` : "100%";

  return (
    <div className="space-y-4">
      <div className="bg-white border border-zinc-200 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-zinc-500">Fecha de jornada:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-zinc-50 hover:bg-zinc-100 text-zinc-900 text-xs font-semibold px-2.5 py-1.5 rounded-md border border-zinc-200 outline-none cursor-pointer"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
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
            {activeWorkdays} / {workdaysData.length}
          </p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-lg p-3">
          <span className="text-2xs font-medium text-zinc-500">Visitas Completadas</span>
          <p className="text-lg font-bold text-zinc-900 mt-0.5">
            {completedVisits} / {totalVisits}
          </p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-lg p-3">
          <span className="text-2xs font-medium text-zinc-500">Efectividad de Atención</span>
          <p className="text-lg font-bold text-zinc-900 mt-0.5">{effectiveness}</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-lg p-3">
          <span className="text-2xs font-medium text-zinc-500">Distancia Recorrida Total</span>
          <p className="text-lg font-bold text-zinc-900 mt-0.5">
            {totalKm.toFixed(1)} km
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
          {workdaysData.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400">
              No hay jornadas registradas para los comerciales en esta fecha.
            </div>
          ) : (
            workdaysData.map((workday) => {
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
                                    {vis.photosCount > 0 ? "Foto adjunta" : "Sin foto"}
                                  </td>
                                  <td className="py-2 px-3">
                                    <span
                                      className={`inline-block px-1.5 py-0.5 rounded text-3xs font-medium border ${
                                        vis.gpsStatus === "Validado"
                                          ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                                          : "text-zinc-500 bg-zinc-50 border-zinc-200"
                                      }`}
                                    >
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
            })
          )}
        </div>
      </div>
    </div>
  );
}

