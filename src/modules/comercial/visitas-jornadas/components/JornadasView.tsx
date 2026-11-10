"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, Users, AlertCircle, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Select } from "@/shared/components/ui/select";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { DataTable, Column } from "@/shared/patterns/DataTable";
import { optionsFrom } from "@/shared/lib/options";
import { useDemo } from "@/shared/state/demo-store";
import { AgendaSlot, JornadaSummary } from "../models/visita.model";
import { pendingSlots } from "../lib/progress";
import { SCENARIO_DAY } from "./scenario-day";

interface JornadasViewProps {
  /** Workdays from the demo store (visit counts are derived from the agenda). */
  jornadas: JornadaSummary[];
  pagination?: { currentPage: number; totalCount: number; pageSize: number; onPageChange: (page: number) => void };
  connected?: {
    agenda: AgendaSlot[];
    clients: { seller: string; zone: string }[];
    dateLabel: string;
    pendingCount: number;
    onOpen: (day: JornadaSummary) => void;
  };
}

const STATUS_VARIANT: Record<
  JornadaSummary["status"],
  "info" | "danger" | "success" | "neutral"
> = {
  "En jornada": "info",
  Interrumpida: "danger",
  Finalizada: "success",
  "Sin iniciar": "neutral",
};

const ACTION_LABEL: Record<JornadaSummary["status"], string> = {
  "En jornada": "Abrir",
  Interrumpida: "Revisar",
  Finalizada: "Ver",
  "Sin iniciar": "Ver",
};

const STATUS_ORDER: JornadaSummary["status"][] = [
  "En jornada",
  "Interrumpida",
  "Sin iniciar",
  "Finalizada",
];

export const JornadasView: React.FC<JornadasViewProps> = ({
  jornadas,
  connected,
  pagination,
}) => {
  const demo = useDemo();
  const agenda = connected ? connected.agenda : demo.agenda;
  const clientes = connected ? connected.clients : demo.clientes;
  const [team, setTeam] = useState("Todos");
  const [status, setStatus] = useState("Todos");
  const [showAlert, setShowAlert] = useState(true);

  // A seller belongs to the teams (zones) of the clients they serve.
  const zonesBySeller = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const c of clientes) {
      if (!map.has(c.seller)) map.set(c.seller, new Set());
      map.get(c.seller)!.add(c.zone);
    }
    return map;
  }, [clientes]);

  const teamOptions = useMemo(() => {
    const zones = Array.from(zonesBySeller.values()).flatMap((set) =>
      Array.from(set),
    );
    return optionsFrom(zones).map((o) =>
      o.value === "Todos" ? o : { ...o, label: `Equipo ${o.label}` },
    );
  }, [zonesBySeller]);

  const statusOptions = useMemo(
    () => [
      { label: "Todos", value: "Todos" },
      ...STATUS_ORDER.filter((s) => !connected || s !== "Interrumpida").map(
        (s) => ({ label: s, value: s }),
      ),
    ],
    [connected],
  );

  const visibleJornadas = jornadas.filter(
    (j) =>
      (team === "Todos" || zonesBySeller.get(j.seller)?.has(team)) &&
      (status === "Todos" || j.status === status),
  );

  const activeCount = jornadas.filter((j) => j.status === "En jornada").length;
  const interrumpidas = jornadas.filter((j) => j.status === "Interrumpida");
  const pendingToReassign = interrumpidas.reduce(
    (total, j) => total + pendingSlots(agenda, j.seller).length,
    0,
  );
  const firstToReview = interrumpidas.find(
    (j) => pendingSlots(agenda, j.seller).length > 0,
  );

  const columns: Column<JornadaSummary>[] = [
    {
      header: connected ? "Responsable" : "Vendedor",
      accessorKey: "seller",
      cell: (row) => (
        <span className="font-semibold text-zinc-900">{row.seller}</span>
      ),
    },
    {
      header: "Inicio",
      cell: (row) => (
        <span className="text-zinc-600">
          {row.status === "Sin iniciar" ? "-" : row.startTime}
        </span>
      ),
    },
    {
      header: "Avance",
      cell: (row) => {
        const percentage =
          row.totalVisits > 0
            ? Math.round((row.completedVisits / row.totalVisits) * 100)
            : 0;
        return (
          <div className="flex items-center gap-2">
            <span className="text-zinc-700 font-medium">
              {row.completedVisits} / {row.totalVisits}
            </span>
            <div className="w-16 h-2 bg-zinc-200 rounded-full overflow-hidden">
              <div
                style={{ width: `${percentage}%` }}
                className="h-full bg-zinc-800 rounded-full"
              />
            </div>
          </div>
        );
      },
    },
    {
      header: "Estado",
      cell: (row) => (
        <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>
      ),
    },
    {
      header: "Acción",
      className: "w-28 text-right",
      cell: (row) =>
        connected ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => connected.onOpen(row)}
          >
            Ver jornada
          </Button>
        ) : (
          <Link href={`/comercial/visitas-jornadas/jornada/${row.id}/`}>
            <Button
              size="sm"
              variant={row.status === "En jornada" ? "primary" : "secondary"}
              className="h-7 text-xs px-2.5"
            >
              {ACTION_LABEL[row.status]}
            </Button>
          </Link>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      {!connected && <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-zinc-200">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 border border-zinc-200 rounded-md text-xs font-medium bg-white text-zinc-800">
            <Calendar className="h-4 w-4 text-zinc-500" />
            <span>{SCENARIO_DAY}</span>
          </div>

          {!connected && (
            <div className="w-40">
              <Select
                label="Equipo"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                options={teamOptions}
              />
            </div>
          )}

          <div className="w-40">
            <Select
              label="Estado"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={statusOptions}
            />
          </div>
        </div>

        {/* Ocultado temporalmente: acción ejecutada en App Móvil / ERP (SAP/Defontana)
        <Link href="/comercial/visitas-jornadas/jornada/j-01/">
          <Button size="sm">Ver mi jornada</Button>
        </Link>
        */}
      </div>}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-zinc-100 text-zinc-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-zinc-950" title={connected ? "Indicador pendiente de datos agregados" : undefined}>
                  {connected ? "—" : activeCount}
                </span>
                <span className="text-xs font-semibold text-zinc-800">
                  {activeCount === 1 ? "Jornada activa" : "Jornadas activas"}
                </span>
              </div>
              <p className="text-2xs text-zinc-400">
                {connected ? "Jornadas activas del equipo" : `de ${jornadas.length} vendedores`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-zinc-100 text-zinc-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-zinc-950" title={connected ? "Indicador pendiente de datos agregados" : undefined}>
                  {connected ? "—" : pendingToReassign}
                </span>
                <span className="text-xs font-semibold text-zinc-800">
                  {connected
                    ? "Visitas pendientes"
                    : "Visitas pendientes de reasignar"}
                </span>
              </div>
              <p
                className={`text-2xs font-medium ${
                  pendingToReassign > 0 ? "text-amber-600" : "text-zinc-400"
                }`}
              >
                {connected
                  ? "Se ejecutan desde la aplicación móvil"
                  : pendingToReassign > 0
                    ? "requieren atención"
                    : "sin pendientes por reasignar"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Banner: derived from interrupted workdays */}
      {showAlert && firstToReview && (
        <div className="p-3 bg-zinc-100 border border-zinc-200 rounded-lg flex items-center justify-between text-xs text-zinc-800">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 text-zinc-600" />
            <span>
              {pendingToReassign}{" "}
              {pendingToReassign === 1
                ? "visita requiere"
                : "visitas requieren"}{" "}
              reasignación por jornada interrumpida (
              {interrumpidas
                .filter((j) => pendingSlots(agenda, j.seller).length > 0)
                .map((j) => j.seller)
                .join(", ")}
              ).
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/comercial/visitas-jornadas/jornada/${firstToReview.id}/`}
            >
              <Button size="sm" variant="secondary" className="h-7 text-xs">
                Revisar visitas
              </Button>
            </Link>
            <button
              onClick={() => setShowAlert(false)}
              aria-label="Cerrar aviso"
              className="p-1 text-zinc-400 hover:text-zinc-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <DataTable
        {...pagination}
        columns={columns}
        data={visibleJornadas}
        keyExtractor={(row) => row.id}
        entityName="jornadas"
      />
    </div>
  );
};
