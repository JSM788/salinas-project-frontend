"use client";

import React, { useMemo, useState } from "react";
import {
  MapPin,
  Clock,
  CheckCircle,
  Circle,
  Coffee,
  ChevronRight,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/shared/patterns/PageHeader";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Modal } from "@/shared/components/ui/modal";
import { Select } from "@/shared/components/ui/select";
import { useDemo } from "@/shared/state/demo-store";
import { JornadaSummary } from "../models/visita.model";
import { pendingSlots } from "../lib/progress";
import { getRegistrosVisita } from "../services/visita.service";
import { SCENARIO_DAY, SCENARIO_DAY_LONG, SLOT_STATUS_LABEL, slotStart } from "./scenario-day";

interface DetalleJornadaViewProps {
  jornada: JornadaSummary;
}

const STATUS_VARIANT: Record<JornadaSummary["status"], "info" | "danger" | "success" | "neutral"> = {
  "En jornada": "info",
  Interrumpida: "danger",
  Finalizada: "success",
  "Sin iniciar": "neutral",
};

interface JornadaEvent {
  time: string;
  title: string;
  detail: string;
  client?: string;
}

export const DetalleJornadaView: React.FC<DetalleJornadaViewProps> = ({ jornada: seed }) => {
  const { jornadas, agenda, clientes, reasignarPendientes } = useDemo();
  const [isFinalizada, setIsFinalizada] = useState(false);
  const [isReasignarOpen, setIsReasignarOpen] = useState(false);
  const [destino, setDestino] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  // Live workday from the store (counts are derived from the agenda), seed as fallback.
  const jornada = jornadas.find((j) => j.id === seed.id) ?? seed;
  const seller = jornada.seller;

  const itinerario = useMemo(
    () =>
      agenda
        .filter((slot) => slot.seller === seller)
        .sort((a, b) => slotStart(a.timeSlot).localeCompare(slotStart(b.timeSlot)))
        .map((slot, index) => ({
          num: index + 1,
          slot,
          client: slot.clientName,
          time: slot.timeSlot,
          status: SLOT_STATUS_LABEL[slot.status],
          active: slot.status === "en_curso",
        })),
    [agenda, seller]
  );

  const pendientes = useMemo(() => pendingSlots(agenda, seller), [agenda, seller]);

  const destinos = useMemo(
    () =>
      jornadas
        .filter((j) => j.seller !== seller && j.status !== "Finalizada")
        .map((j) => ({ label: `${j.seller} (${j.status})`, value: j.seller })),
    [jornadas, seller]
  );

  // Events of the scenario day come from the seller's visit records.
  const eventos = useMemo(() => {
    const list: JornadaEvent[] = [];
    if (jornada.status !== "Sin iniciar") {
      list.push({ time: jornada.startTime, title: "Inicio de jornada", detail: "Jornada iniciada." });
    }
    for (const r of getRegistrosVisita(undefined, seller).filter((v) => v.date === SCENARIO_DAY)) {
      list.push({
        time: r.checkIn,
        title: `Check-in en ${r.clientName}`,
        detail: "Llegada registrada.",
        client: r.clientName,
      });
      const evidence = `${r.evidenceCount} ${r.evidenceCount === 1 ? "foto" : "fotos"} de evidencia`;
      list.push({
        time: r.checkOut,
        title: `Check-out en ${r.clientName}`,
        detail: `${r.result}${r.orderCode ? ` (${r.orderCode})` : ""}. ${evidence}.`,
        client: r.clientName,
      });
    }
    return list.sort((a, b) => a.time.localeCompare(b.time));
  }, [seller, jornada.status, jornada.startTime]);

  const ultimoEvento = eventos.length > 0 ? eventos[eventos.length - 1] : null;

  const mapaDistritos = useMemo(() => {
    const ids = new Set(itinerario.map((i) => i.slot.clientId));
    const districts = clientes.filter((c) => ids.has(c.id)).map((c) => c.district);
    return Array.from(new Set(districts)).join(", ");
  }, [itinerario, clientes]);

  const openReasignar = () => {
    setDestino(destinos[0]?.value ?? "");
    setIsReasignarOpen(true);
  };

  const confirmReasignar = () => {
    if (!destino || pendientes.length === 0) return;
    reasignarPendientes(jornada.id, destino);
    setNotice(
      `${pendientes.length} ${pendientes.length === 1 ? "visita pendiente reasignada" : "visitas pendientes reasignadas"} a ${destino}.`
    );
    setIsReasignarOpen(false);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumbs={[
          { label: "Comercial", href: "/comercial/clientes/" },
          { label: "Visitas y jornadas", href: "/comercial/visitas-jornadas/" },
          { label: "Jornadas", href: "/comercial/visitas-jornadas/" },
          { label: seller },
        ]}
        title={`Jornada de ${seller}`}
        subtitle={SCENARIO_DAY_LONG}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Badge variant={STATUS_VARIANT[jornada.status]}>{jornada.status}</Badge>
              <span className="text-xs text-zinc-500 font-medium">
                {jornada.completedVisits} / {jornada.totalVisits} visitas
              </span>
            </div>
            {/* Ocultado temporalmente: acción ejecutada en App Móvil / ERP (SAP/Defontana)
            <Button variant="secondary" size="sm" className="gap-1.5">
              <Coffee className="h-3.5 w-3.5" /> Refrigerio
            </Button>
            <Button
              size="sm"
              onClick={() => setIsFinalizada(true)}
              disabled={isFinalizada}
            >
              {isFinalizada ? "Jornada finalizada" : "Finalizar jornada"}
            </Button>
            */}
          </div>
        }
      />

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Itinerario & Events */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="text-xs font-semibold text-zinc-900 border-b border-zinc-100 pb-2">
                Itinerario del día ({itinerario.length})
              </h3>

              {itinerario.length === 0 && (
                <p className="text-2xs text-zinc-500">Este vendedor no tiene visitas en el itinerario.</p>
              )}

              <div className="space-y-2.5">
                {itinerario.map((item) => (
                  <div
                    key={item.slot.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center text-xs font-bold">
                        {item.num}
                      </span>
                      <div>
                        {/* Ocultado temporalmente: el flujo de ejecución de visita activa ocurre en la App Móvil */}
                        <span className="font-semibold text-xs text-zinc-900">
                          {item.client}
                        </span>
                        <p className="text-2xs text-zinc-400">{item.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.status === "Completada" ? (
                        <span className="flex items-center gap-1 text-2xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle className="h-3 w-3" /> Completada
                        </span>
                      ) : (
                        <span
                          className={`flex items-center gap-1 text-2xs ${
                            item.active ? "text-zinc-900 font-semibold" : "text-zinc-500"
                          }`}
                        >
                          <Circle className="h-3 w-3" /> {item.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Último Evento */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <h4 className="text-2xs font-semibold text-zinc-400 uppercase tracking-wider">
                Último evento
              </h4>
              {ultimoEvento ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 text-zinc-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-zinc-900">
                        {ultimoEvento.client ?? ultimoEvento.title}
                      </p>
                      <p className="text-2xs text-zinc-500">
                        {ultimoEvento.client
                          ? `${ultimoEvento.title}. ${ultimoEvento.detail}`
                          : ultimoEvento.detail}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-2xs text-zinc-400">
                    <span>{ultimoEvento.time}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              ) : (
                <p className="text-2xs text-zinc-500">Aún no hay eventos registrados.</p>
              )}
            </CardContent>
          </Card>

          {/* Línea de tiempo de eventos */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h4 className="text-2xs font-semibold text-zinc-400 uppercase tracking-wider">
                Línea de tiempo de eventos
              </h4>

              {eventos.length === 0 ? (
                <p className="text-2xs text-zinc-500">Aún no hay eventos registrados.</p>
              ) : (
                <div className="space-y-3 text-xs pl-2 border-l border-zinc-200 ml-1">
                  {eventos.map((evento, index) => (
                    <div key={`${evento.time}-${index}`} className="relative pl-3">
                      <span className="absolute -left-[calc(0.75rem+0.5px)] top-1.5 w-2 h-2 rounded-full bg-zinc-900 ring-2 ring-white" />
                      <div className="flex items-baseline justify-between">
                        <span className="font-semibold text-zinc-900">{evento.title}</span>
                        <span className="text-2xs text-zinc-400">{evento.time}</span>
                      </div>
                      <p className="text-2xs text-zinc-500">{evento.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Mapa y Acciones de Gerencia */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="text-xs font-semibold text-zinc-900">
                Ubicaciones por eventos
              </h3>

              {/* Map Canvas Representation */}
              <div className="h-72 rounded-lg bg-zinc-100 border border-zinc-200 relative overflow-hidden flex items-center justify-center p-4">
                {/* Simulated Street Grid */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]" />

                {itinerario.map((item, index) => {
                  const count = itinerario.length;
                  const left = count === 1 ? 50 : 15 + (70 * index) / (count - 1);
                  const top = index % 2 === 0 ? 30 : 60;
                  const tone =
                    item.slot.status === "completada"
                      ? "bg-zinc-900"
                      : item.slot.status === "en_curso"
                      ? "bg-zinc-600"
                      : "bg-zinc-400";
                  return (
                    <div
                      key={item.slot.id}
                      style={{ left: `${left}%`, top: `${top}%` }}
                      className="absolute flex -translate-x-1/2 flex-col items-center"
                    >
                      <div
                        className={`w-7 h-7 rounded-full ${tone} text-white flex items-center justify-center font-bold text-xs shadow-md`}
                      >
                        {item.num}
                      </div>
                      <span className="text-2xs font-semibold bg-white/90 px-1.5 py-0.5 rounded shadow-xs mt-1 max-w-28 truncate">
                        {item.client}
                      </span>
                    </div>
                  );
                })}

                {mapaDistritos && (
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-2xs font-semibold text-zinc-700 shadow-xs border border-zinc-200">
                    {mapaDistritos} - Lima
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Acciones de Gerencia */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="text-xs font-semibold text-zinc-900">
                Acciones de gerencia
              </h3>

              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between">
                <div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                    onClick={openReasignar}
                    disabled={pendientes.length === 0 || destinos.length === 0}
                  >
                    <UserCheck className="h-4 w-4" /> Reasignar pendientes
                  </Button>
                  <p className="text-2xs text-zinc-500 mt-2">
                    {pendientes.length === 0
                      ? "No hay visitas pendientes por reasignar en esta jornada."
                      : destinos.length === 0
                      ? "No hay otros vendedores disponibles para recibir las visitas."
                      : `Permite reasignar las ${pendientes.length} ${
                          pendientes.length === 1 ? "visita pendiente" : "visitas pendientes"
                        } de esta jornada a otro ejecutivo.`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isReasignarOpen}
        onClose={() => setIsReasignarOpen(false)}
        title="Reasignar visitas pendientes"
        subtitle={`Jornada de ${seller}`}
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="secondary" onClick={() => setIsReasignarOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmReasignar} disabled={!destino || pendientes.length === 0}>
              Confirmar reasignación
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <p className="font-semibold text-zinc-900 mb-1.5">
              Visitas que se reasignarán ({pendientes.length})
            </p>
            <ul className="space-y-1.5">
              {pendientes.map((slot) => (
                <li
                  key={slot.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-100 bg-zinc-50/50"
                >
                  <span className="font-medium text-zinc-900">{slot.clientName}</span>
                  <span className="flex items-center gap-1 text-2xs text-zinc-500">
                    <Clock className="h-3 w-3" /> {slot.timeSlot}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              Vendedor destino
            </label>
            <Select value={destino} onChange={(e) => setDestino(e.target.value)} options={destinos} />
          </div>
        </div>
      </Modal>
    </div>
  );
};
