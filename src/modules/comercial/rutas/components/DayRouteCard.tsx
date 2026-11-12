"use client";

import React from "react";
import { Badge } from "@/shared/components/ui/badge";
import { APP_CONSTANTS } from "@/config/constants";
import {
  Calendar,
  ExternalLink,
  GripVertical,
  Map as MapIcon,
  Trash2,
} from "lucide-react";
import { formatStopSubtitle, getGoogleMapsDirUrl, getStopMapsUrl, isLockedStop } from "../utils";
import type { Stop } from "../types";

interface DayRouteCardProps {
  dayKey: string;
  dayLabel: string;
  dayDate: string;
  stops: Stop[];
  onDragStart: (e: React.DragEvent, dayKey: string, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetDayKey: string, targetIndex?: number) => void;
  onRemoveStop: (dayKey: string, stopId: string) => void;
  onOpenAddModal: (dayKey: string) => void;
}

export function DayRouteCard({
  dayKey,
  dayLabel,
  dayDate,
  stops,
  onDragStart,
  onDragOver,
  onDrop,
  onRemoveStop,
  onOpenAddModal,
}: DayRouteCardProps) {
  const maxStops = APP_CONSTANTS.FIELD_OPERATIONS.MAX_STOPS_PER_DAY;
  const count = stops.length;
  const isFull = count >= maxStops;
  const mapsUrl = getGoogleMapsDirUrl(stops);

  return (
    <div
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, dayKey)}
      className="bg-white border border-zinc-200 rounded-lg p-3 flex flex-col justify-between min-h-120 hover:border-zinc-300 transition-colors"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-zinc-900 uppercase">
              {dayLabel}
            </span>
            <span className="text-3xs text-zinc-400 font-mono">
              {dayDate}
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
              {count}/{maxStops}
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
          {stops.map((stop, idx) => {
            const locked = isLockedStop(stop);
            const subtitle = formatStopSubtitle(stop.district, stop.address);

            return (
              <div
                key={`${stop.id}-${idx}`}
                draggable={!locked}
                onDragStart={(e) => onDragStart(e, dayKey, idx)}
                onDragOver={onDragOver}
                onDrop={(e) => {
                  e.stopPropagation();
                  onDrop(e, dayKey, idx);
                }}
                className={`bg-zinc-50 border border-zinc-200 rounded-md p-2 text-xs space-y-1 transition-all group ${
                  locked
                    ? "opacity-85 cursor-default"
                    : "hover:border-zinc-400 hover:shadow-xs cursor-grab active:cursor-grabbing"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <GripVertical className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600" />
                    <span className="font-semibold text-zinc-700">#{stop.order}</span>
                    <span className="text-3xs font-mono text-zinc-400">{stop.code}</span>
                  </div>

                  {locked ? (
                    <span className="text-3xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
                      {stop.visitStatus === "completed" ? "Visitado" : "En curso"}
                    </span>
                  ) : (
                    <button
                      onClick={() => onRemoveStop(dayKey, stop.id)}
                      className="p-1 text-zinc-400 hover:text-red-600 rounded hover:bg-zinc-100 cursor-pointer transition-colors"
                      title="Quitar parada"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="font-medium text-zinc-900 truncate" title={stop.name}>
                  {stop.tradeName || stop.name}
                </p>
                <p className="text-2xs text-zinc-500 truncate" title={subtitle}>
                  {subtitle}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 text-3xs text-zinc-400">
                  <span>RUC: {stop.ruc}</span>
                  <a
                    href={getStopMapsUrl(stop)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-600 hover:text-zinc-900 flex items-center gap-0.5"
                  >
                    Ver GPS <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={() => onOpenAddModal(dayKey)}
          disabled={isFull}
          className={`w-full py-1.5 border border-dashed rounded-md text-2xs font-medium transition cursor-pointer ${
            isFull
              ? "border-zinc-200 text-zinc-300 cursor-not-allowed bg-zinc-50/50"
              : "border-zinc-300 hover:border-zinc-400 text-zinc-600 bg-white"
          }`}
        >
          {isFull ? `Ruta completa (${maxStops}/${maxStops})` : "+ Agregar clientes"}
        </button>
      </div>
    </div>
  );
}

