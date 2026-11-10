"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, File, FileText, Info, List, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Select } from "@/shared/components/ui/select";
import { formatCurrency } from "@/shared/lib/utils";
import { optionsFrom } from "@/shared/lib/options";
import { toSortKey } from "@/shared/lib/date";
import { Cotizacion, TimelineEventType } from "../models/venta.model";
import { COTIZACION_STATUS_VARIANT } from "./DetalleCotizacionView";

interface CotizacionHistorialTabProps {
  cotizacion: Cotizacion;
}

const EVENT_ICON: Record<TimelineEventType, React.ReactNode> = {
  Borrador: <File className="h-5 w-5" />,
  Propuesta: <List className="h-5 w-5" />,
  Documento: <FileText className="h-5 w-5" />,
  Pedido: <ShoppingCart className="h-5 w-5" />,
  Pago: <FileText className="h-5 w-5" />,
  Archivo: <FileText className="h-5 w-5" />,
};

/** "Ana Torres · App comercial" -> "App comercial"; "Finanzas" stays as is. */
const originOf = (source: string) => source.split(" · ").pop() ?? source;
const authorOf = (source: string) => (source.includes(" · ") ? source.split(" · ")[0] : source);

export const CotizacionHistorialTab: React.FC<CotizacionHistorialTabProps> = ({ cotizacion }) => {
  const [eventTypeFilter, setEventTypeFilter] = useState("Todos");
  const [originFilter, setOriginFilter] = useState("Todos");

  const events = useMemo(
    () =>
      [...cotizacion.timeline].sort(
        (a, b) => toSortKey(b.date, b.time) - toSortKey(a.date, a.time)
      ),
    [cotizacion.timeline]
  );

  const visibleEvents = events.filter(
    (event) =>
      (eventTypeFilter === "Todos" || event.type === eventTypeFilter) &&
      (originFilter === "Todos" || originOf(event.source) === originFilter)
  );

  const oldest = events[events.length - 1];
  const newest = events[0];

  const documentRows = [
    { label: "Cliente", value: cotizacion.clienteName },
    { label: "Vendedor", value: cotizacion.seller },
    { label: "Creada", value: `${cotizacion.date}, ${cotizacion.time}` },
    { label: "Vigencia hasta", value: cotizacion.validUntil },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 cols): Historial */}
        <Card className="lg:col-span-2 shadow-xs border-zinc-200">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900">Historial de la cotización</h3>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1.3fr] gap-2.5">
              <Select
                label="Tipo de evento"
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                options={optionsFrom(events.map((e) => e.type))}
              />
              <Select
                label="Origen"
                value={originFilter}
                onChange={(e) => setOriginFilter(e.target.value)}
                options={optionsFrom(events.map((e) => originOf(e.source)))}
              />
              <div>
                <span className="block text-2xs font-medium text-zinc-500 mb-1">Fecha</span>
                <div className="flex items-center gap-2 px-3 h-9 border border-zinc-200 rounded-md text-xs bg-white text-zinc-800 shadow-xs">
                  <CalendarDays className="h-4 w-4 text-zinc-600 shrink-0" />
                  <span>{oldest?.date ?? "—"}</span>
                  <span className="text-zinc-400">—</span>
                  <span>{newest?.date ?? "—"}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <ol className="pt-1">
              {visibleEvents.map((event, index) => (
                <li
                  key={`${event.date}-${event.time}-${event.title}`}
                  className="grid grid-cols-[4.5rem_1rem_1fr] gap-x-3"
                >
                  <div className="pt-3 text-xs text-zinc-800 leading-5">
                    <p>{event.date}</p>
                    <p>{event.time}</p>
                  </div>

                  {/* Timeline rail */}
                  <div className="relative flex justify-center">
                    <span className="mt-4 w-2.5 h-2.5 rounded-full border-2 border-zinc-700 bg-white z-10" />
                    {index < visibleEvents.length - 1 && (
                      <span className="absolute top-6 bottom-0 w-px bg-zinc-300" />
                    )}
                  </div>

                  <div className="pb-3">
                    <div className="flex items-start gap-3 p-3 bg-white border border-zinc-100 rounded-lg shadow-xs">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0">
                        {EVENT_ICON[event.type]}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-zinc-950">{event.title}</p>
                        <p className="text-2xs text-zinc-500">
                          {authorOf(event.source)} · {originOf(event.source)}
                        </p>
                        {event.detail && (
                          <p className="text-2xs text-zinc-700 pt-1">{event.detail}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}

              {visibleEvents.length === 0 && (
                <li className="py-8 text-center text-xs text-zinc-500">
                  No hay eventos para los filtros seleccionados.
                </li>
              )}
            </ol>
          </CardContent>
        </Card>

        {/* Right Column (1 col): Documento */}
        <Card className="shadow-xs border-zinc-200 self-start">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-3">
              Documento {cotizacion.code}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-zinc-600">Estado</span>
                <Badge variant={COTIZACION_STATUS_VARIANT[cotizacion.status]}>{cotizacion.status}</Badge>
              </div>
              {documentRows.map((row) => (
                <div key={row.label} className="flex items-start gap-3">
                  <span className="w-28 shrink-0 text-zinc-600">{row.label}</span>
                  <span className="text-zinc-900">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 border-y border-zinc-100 py-3">
              <span className="w-28 shrink-0 text-xs text-zinc-600">Total cotizado</span>
              <span className="text-xl font-extrabold text-zinc-950">
                {formatCurrency(cotizacion.amount)}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="w-28 shrink-0 text-zinc-600">Pedido relacionado</span>
              {cotizacion.pedidoCode ? (
                <Link
                  href={`/comercial/ventas/pedidos/${cotizacion.pedidoCode.toLowerCase()}/`}
                  className="font-semibold text-zinc-900 hover:underline"
                >
                  {cotizacion.pedidoCode}
                </Link>
              ) : (
                <span className="text-zinc-900">Sin convertir</span>
              )}
            </div>

            <div className="p-3 bg-zinc-100 rounded-lg flex items-center gap-2.5 text-2xs text-zinc-700">
              <Info className="h-4 w-4 shrink-0" />
              <span>Los eventos no confirman reserva de stock.</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Note */}
      <div className="text-right text-2xs text-zinc-400">
        <span>Datos ficticios para demostración.</span>
      </div>
    </div>
  );
};
