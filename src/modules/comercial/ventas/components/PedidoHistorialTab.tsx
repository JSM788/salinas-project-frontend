"use client";

import React, { useMemo, useState } from "react";
import { FileText, Calendar, Clock, Info, CalendarRange } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Select } from "@/shared/components/ui/select";
import { optionsFrom } from "@/shared/lib/options";
import { toSortKey } from "@/shared/lib/date";
import { PAYMENT_STATUS_LABEL, Pedido, TimelineEvent } from "../models/venta.model";
import { PedidoStatusCards } from "./PedidoStatusCards";

interface PedidoHistorialTabProps {
  pedido: Pedido;
}

export const PedidoHistorialTab: React.FC<PedidoHistorialTabProps> = ({ pedido }) => {
  const [eventTypeFilter, setEventTypeFilter] = useState("Todos");
  const [originFilter, setOriginFilter] = useState("Todos");

  const events = useMemo(
    () =>
      [...pedido.timeline].sort(
        (a, b) => toSortKey(b.date, b.time) - toSortKey(a.date, a.time)
      ),
    [pedido.timeline]
  );

  const filtered = events.filter(
    (e) =>
      (eventTypeFilter === "Todos" || e.type === eventTypeFilter) &&
      (originFilter === "Todos" || e.source === originFilter)
  );

  const groups = useMemo(() => {
    const byDate = new Map<string, TimelineEvent[]>();
    for (const event of filtered) {
      byDate.set(event.date, [...(byDate.get(event.date) ?? []), event]);
    }
    return Array.from(byDate.entries());
  }, [filtered]);

  const oldest = events[events.length - 1];
  const newest = events[0];
  const rangeLabel =
    oldest && newest
      ? oldest.date === newest.date
        ? oldest.date
        : `${oldest.date} – ${newest.date}`
      : "Sin eventos";

  return (
    <div className="space-y-5">
      <PedidoStatusCards pedido={pedido} />

      {/* Main Grid: Trazabilidad (2 cols) & Estado Actual (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 cols): Trazabilidad */}
        <Card className="lg:col-span-2 shadow-xs border-zinc-200">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <h3 className="text-xs font-bold text-zinc-900 border-b border-zinc-100 pb-2">
              Trazabilidad del pedido
            </h3>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-44">
                <Select
                  value={eventTypeFilter}
                  onChange={(e) => setEventTypeFilter(e.target.value)}
                  options={optionsFrom(
                    events.map((e) => e.type),
                    "Tipo de evento: Todos"
                  )}
                />
              </div>

              <div className="w-48">
                <Select
                  value={originFilter}
                  onChange={(e) => setOriginFilter(e.target.value)}
                  options={optionsFrom(
                    events.map((e) => e.source),
                    "Origen: Todos"
                  )}
                />
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 rounded-md text-xs font-medium bg-white text-zinc-800 h-9">
                <CalendarRange className="h-4 w-4 text-zinc-500" />
                <span>{rangeLabel}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4 pt-1">
              {groups.length === 0 && (
                <p className="py-6 text-center text-xs text-zinc-500">
                  No hay eventos para los filtros seleccionados.
                </p>
              )}

              {groups.map(([date, dayEvents]) => (
                <div key={date} className="space-y-3">
                  <div className="bg-zinc-100/80 px-3 py-1.5 rounded-md text-2xs font-bold text-zinc-700">
                    {date}
                  </div>

                  <div className="space-y-3 pl-2 sm:pl-3">
                    {dayEvents.map((event, index) => (
                      <div
                        key={`${event.time}-${event.title}-${index}`}
                        className="flex items-start justify-between gap-3 p-3 bg-white border border-zinc-100 rounded-lg"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-2 mt-0.5 shrink-0">
                            <span className="w-2 h-2 rounded-full bg-zinc-900" />
                            <span className="text-2xs font-semibold text-zinc-400">{event.time}</span>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-zinc-950">{event.title}</p>
                            <p className="text-2xs text-zinc-500">{event.source}</p>
                            {event.detail && (
                              <p className="text-2xs text-zinc-700">{event.detail}</p>
                            )}
                            {event.title === "Pago reportado" && (
                              <p className="text-2xs text-zinc-400 mt-1">
                                El comprobante por sí solo no confirma el pago.
                              </p>
                            )}
                          </div>
                        </div>

                        {event.title === "Pago reportado" && (
                          <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200 shrink-0">
                            {PAYMENT_STATUS_LABEL[pedido.paymentStatus]}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Column (1 col): Estado Actual & Note */}
        <div className="space-y-4">
          <Card className="shadow-xs border-zinc-200">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-xs font-bold text-zinc-900 border-b border-zinc-100 pb-2">
                Estado actual
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-zinc-700">
                    <Clock className="h-4 w-4 text-zinc-400 shrink-0" />
                    <span>Pedido</span>
                  </div>
                  <span className="font-bold text-zinc-950 text-right">{pedido.orderStatus}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-zinc-700">
                    <FileText className="h-4 w-4 text-zinc-400 shrink-0" />
                    <span>Pago</span>
                  </div>
                  <span className="font-semibold text-zinc-800 text-right">
                    {PAYMENT_STATUS_LABEL[pedido.paymentStatus]}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-zinc-700">
                    <Calendar className="h-4 w-4 text-zinc-400 shrink-0" />
                    <span>Reserva</span>
                  </div>
                  <span className="font-semibold text-zinc-800 text-right">
                    {pedido.reservationStatus === "Confirmada"
                      ? "Reserva confirmada"
                      : "Confirmación SAP pendiente"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg flex items-start gap-2.5 text-2xs text-zinc-600">
            <div className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Info className="h-3 w-3" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-zinc-800">Eventos de consulta y registro.</p>
              <p className="text-zinc-500">
                {pedido.reservationStatus === "Confirmada"
                  ? "SAP confirmó la reserva de stock de este pedido."
                  : "Aún no existe confirmación de reserva SAP para este pedido."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-right text-2xs text-zinc-400 pt-2 border-t border-zinc-100">
        <span>Datos ficticios para demostración</span>
      </div>
    </div>
  );
};
