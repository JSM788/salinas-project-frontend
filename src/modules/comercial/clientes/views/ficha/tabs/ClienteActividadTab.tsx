"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  FileText,
  ShoppingCart,
  User,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  ChevronRight,
  Info,
  Package,
} from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { optionsFrom } from "@/shared/lib/options";
import { PAYMENT_STATUS_LABEL } from "@/modules/comercial/ventas/models/venta.model";
import { getRegistrosVisita } from "@/modules/comercial/visitas-jornadas";
import { useDemo } from "@/shared/state/demo-store";
import { Cliente } from "../../../models/cliente.model";
import { ActivityEvent, ActivityType, buildClienteActivity, dayHeading } from "../../../lib/activity";

interface ClienteActividadTabProps {
  cliente: Cliente;
}

const TYPE_ICON: Record<ActivityType, React.ReactNode> = {
  Visitas: <MapPin className="h-4 w-4" />,
  Pagos: <FileText className="h-4 w-4" />,
  Pedidos: <ShoppingCart className="h-4 w-4" />,
  Cotizaciones: <Package className="h-4 w-4" />,
};

const EVIDENCE_LABELS = ["Exhibición", "Góndola", "Cierre"];

export const ClienteActividadTab: React.FC<ClienteActividadTabProps> = ({ cliente }) => {
  const { pedidos, cotizaciones } = useDemo();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [responsableFilter, setResponsableFilter] = useState("Todos");

  const registros = useMemo(
    () => getRegistrosVisita().filter((r) => r.clientId === cliente.id),
    [cliente.id]
  );
  const events = useMemo(
    () => buildClienteActivity(cliente.id, pedidos, cotizaciones, registros),
    [cliente.id, pedidos, cotizaciones, registros]
  );

  const filtered = events.filter((event) => {
    const text = `${event.title} ${event.lines.join(" ")} ${event.responsible}`.toLowerCase();
    return (
      (!search || text.includes(search.toLowerCase())) &&
      (typeFilter === "Todos" || event.type === typeFilter) &&
      (responsableFilter === "Todos" || event.responsible === responsableFilter)
    );
  });

  const groups = useMemo(() => {
    const byDate = new Map<string, ActivityEvent[]>();
    for (const event of filtered) {
      byDate.set(event.date, [...(byDate.get(event.date) ?? []), event]);
    }
    return Array.from(byDate.entries());
  }, [filtered]);

  const lastVisit = registros[0];
  const evidencePlaceholders = registros.reduce((total, r) => total + r.evidenceCount, 0) > 0 ? registros[0] : undefined;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 cols): Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-xs border-zinc-200">
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div>
                <h2 className="text-base font-bold text-zinc-950">Historial de actividad</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Eventos comerciales y evidencias del cliente
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <div className="flex-1 min-w-48">
                  <Input
                    placeholder="Buscar en actividad..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    icon={<Search className="h-3.5 w-3.5 text-zinc-400" />}
                  />
                </div>

                <div className="w-40">
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    options={optionsFrom(
                      events.map((e) => e.type),
                      "Tipo: Todos"
                    )}
                  />
                </div>

                <div className="w-44">
                  <Select
                    value={responsableFilter}
                    onChange={(e) => setResponsableFilter(e.target.value)}
                    options={optionsFrom(
                      events.map((e) => e.responsible),
                      "Responsable: Todos"
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                {groups.length === 0 && (
                  <p className="py-6 text-center text-xs text-zinc-500">
                    {events.length === 0
                      ? "Este cliente aún no registra actividad."
                      : "No hay actividad para los filtros seleccionados."}
                  </p>
                )}

                {groups.map(([date, dayEvents]) => (
                  <div key={date} className="space-y-3">
                    <div className="bg-zinc-100/80 px-3 py-1.5 rounded-md text-2xs font-bold text-zinc-700">
                      {dayHeading(date)}
                    </div>

                    <div className="space-y-3 pl-2 sm:pl-3">
                      {dayEvents.map((event) => (
                        <div
                          key={event.key}
                          className="flex items-start justify-between gap-3 p-3 bg-white border border-zinc-100 rounded-lg hover:border-zinc-200 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xs font-semibold text-zinc-400 mt-1 w-10 shrink-0">
                              {event.time}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-800 flex items-center justify-center shrink-0">
                              {TYPE_ICON[event.type]}
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-zinc-950">{event.title}</span>
                              <p className="text-2xs text-zinc-500">{event.responsible}</p>
                              {event.lines.map((line) => (
                                <p key={line} className="text-2xs text-zinc-600">
                                  {line}
                                </p>
                              ))}
                              {event.warning && (
                                <p className="text-2xs text-amber-600 font-medium">{event.warning}</p>
                              )}
                              {event.evidenceCount !== undefined && event.evidenceCount > 0 && (
                                <div className="pt-1">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-2xs font-medium border border-zinc-200">
                                    <ImageIcon className="h-3 w-3 text-zinc-500" />{" "}
                                    {event.evidenceCount} {event.evidenceCount === 1 ? "evidencia" : "evidencias"}
                                  </span>
                                </div>
                              )}
                              {event.payment && (
                                <div className="flex items-center gap-2 pt-0.5">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-2xs font-medium border border-zinc-200">
                                    {event.payment === "Conciliado" ? (
                                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                    ) : event.payment === "Observado" ? (
                                      <AlertCircle className="h-3 w-3 text-rose-600" />
                                    ) : (
                                      <Clock className="h-3 w-3 text-zinc-500" />
                                    )}{" "}
                                    {PAYMENT_STATUS_LABEL[event.payment]}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <Link
                            href={event.href}
                            className="flex items-center gap-1 text-2xs font-semibold text-zinc-800 hover:text-zinc-950 hover:underline shrink-0 pt-1"
                          >
                            <span>{event.linkLabel}</span>
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 col): Widgets */}
        <div className="space-y-4">
          <Card className="shadow-xs border-zinc-200">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-xs font-bold text-zinc-900 border-b border-zinc-100 pb-2">
                Última visita
              </h3>

              {lastVisit ? (
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-2.5 text-zinc-800">
                    <MapPin className="h-4 w-4 text-zinc-500 shrink-0" />
                    <span className="font-semibold">
                      {lastVisit.date} · {lastVisit.checkOut}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-zinc-800">
                    <User className="h-4 w-4 text-zinc-500 shrink-0" />
                    <span>{lastVisit.seller}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-zinc-800">
                    <FileText className="h-4 w-4 text-zinc-500 shrink-0" />
                    <span>{lastVisit.result}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-500">Sin visitas registradas.</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-xs border-zinc-200">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                <h3 className="text-xs font-bold text-zinc-900">Evidencias recientes</h3>
                <Link
                  href="/comercial/visitas-jornadas/"
                  className="flex items-center gap-0.5 text-2xs font-semibold text-zinc-800 hover:text-zinc-950 hover:underline"
                >
                  <span>Ver evidencias</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              {evidencePlaceholders ? (
                <div className="space-y-3">
                  {Array.from({ length: Math.min(evidencePlaceholders.evidenceCount, 3) }).map((_, index) => (
                    <div
                      key={index}
                      className="h-32 rounded-lg bg-zinc-900 text-zinc-100 flex flex-col justify-end p-3 relative overflow-hidden shadow-inner"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 z-10" />
                      <div className="absolute inset-0 bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />
                      <div className="relative z-20 flex items-center justify-between">
                        <span className="text-xs font-bold text-white drop-shadow-xs">
                          {EVIDENCE_LABELS[index % EVIDENCE_LABELS.length]}
                        </span>
                        <span className="text-2xs text-zinc-300">
                          {evidencePlaceholders.date} · {evidencePlaceholders.checkIn}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500">Sin evidencias registradas.</p>
              )}
            </CardContent>
          </Card>

          <div className="p-3 bg-zinc-100/90 border border-zinc-200/80 rounded-lg flex items-center gap-2.5 text-2xs text-zinc-700">
            <div className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center shrink-0">
              <Info className="h-3 w-3" />
            </div>
            <span>Actividad registrada en la plataforma comercial.</span>
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
