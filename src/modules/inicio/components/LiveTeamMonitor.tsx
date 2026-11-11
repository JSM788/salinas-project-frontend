"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { APP_ROUTES } from "@/config/routes";
import { Badge } from "@/shared/components/ui/badge";

export interface TeamMemberLiveStatus {
  id: string;
  name: string;
  initials: string;
  role: "Comercial" | "Mercaderista";
  route: string;
  status: "en_cliente" | "en_ruta" | "finalizado" | "sin_iniciar";
  visitsCompleted: number;
  visitsScheduled: number;
  ordersCount: number;
  ordersTotal: number;
  lastCheckIn: string;
  currentLocationName?: string;
}

export const DEFAULT_TEAM_STATUS: TeamMemberLiveStatus[] = [
  {
    id: "rep-1",
    name: "Carlos Mendoza Silva",
    initials: "CM",
    role: "Comercial",
    route: "Ruta 01 · Cercado & Breña",
    status: "en_cliente",
    visitsCompleted: 5,
    visitsScheduled: 7,
    ordersCount: 3,
    ordersTotal: 8450,
    lastCheckIn: "11:45 AM",
    currentLocationName: "Bodega Don Pepe",
  },
  {
    id: "rep-2",
    name: "Lucía Paredes Vega",
    initials: "LP",
    role: "Comercial",
    route: "Ruta 02 · Miraflores & San Isidro",
    status: "en_ruta",
    visitsCompleted: 4,
    visitsScheduled: 6,
    ordersCount: 2,
    ordersTotal: 12300,
    lastCheckIn: "12:05 PM",
    currentLocationName: "En traslado a Minimarket El Sol",
  },
  {
    id: "rep-3",
    name: "Jorge Ramos Tello",
    initials: "JR",
    role: "Comercial",
    route: "Ruta 03 · Surco & San Borja",
    status: "en_cliente",
    visitsCompleted: 6,
    visitsScheduled: 8,
    ordersCount: 4,
    ordersTotal: 9150,
    lastCheckIn: "12:10 PM",
    currentLocationName: "Ferretería & Bazar San Martín",
  },
  {
    id: "rep-4",
    name: "Andrea Castillo Ruiz",
    initials: "AC",
    role: "Mercaderista",
    route: "Ruta POP · Cono Norte",
    status: "en_cliente",
    visitsCompleted: 4,
    visitsScheduled: 5,
    ordersCount: 0,
    ordersTotal: 0,
    lastCheckIn: "11:30 AM",
    currentLocationName: "Supermercado San Jorge",
  },
  {
    id: "rep-5",
    name: "Martín Flores Vargas",
    initials: "MF",
    role: "Comercial",
    route: "Ruta 04 · Callao & Bellavista",
    status: "finalizado",
    visitsCompleted: 6,
    visitsScheduled: 6,
    ordersCount: 5,
    ordersTotal: 14800,
    lastCheckIn: "12:00 PM",
    currentLocationName: "Jornada completada",
  },
];

interface LiveTeamMonitorProps {
  team?: TeamMemberLiveStatus[];
}

export const LiveTeamMonitor: React.FC<LiveTeamMonitorProps> = ({ team = DEFAULT_TEAM_STATUS }) => {
  const activeCount = team.filter((t) => t.status === "en_cliente" || t.status === "en_ruta").length;

  return (
    <div className="bg-white border border-zinc-200/90 rounded-xl p-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-zinc-900">Fuerza de Ventas en Vivo</h2>
            <Badge variant="neutral">
              {activeCount} de {team.length} activos
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Monitoreo en tiempo real de rutas, visitas del día y pedidos capturados en campo.
          </p>
        </div>

        <Link href={`${APP_ROUTES.ROUTES}/`}>
          <span className="text-2xs text-zinc-600 hover:text-zinc-950 font-medium inline-flex items-center gap-1 transition-colors">
            <span>Ver mapa de rutas</span>
            <ChevronRight className="h-3 w-3" />
          </span>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-100 text-2xs uppercase text-zinc-400 font-semibold tracking-wider">
              <th className="pb-2.5 font-medium">Vendedor / Preventista</th>
              <th className="pb-2.5 font-medium">Ruta Asignada</th>
              <th className="pb-2.5 font-medium">Estado</th>
              <th className="pb-2.5 font-medium">Avance de Visitas</th>
              <th className="pb-2.5 font-medium">Pedidos Hoy</th>
              <th className="pb-2.5 text-right font-medium">Última Actividad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {team.map((member) => {
              const progress =
                member.visitsScheduled > 0
                  ? Math.round((member.visitsCompleted / member.visitsScheduled) * 100)
                  : 0;

              return (
                <tr key={member.id} className="hover:bg-zinc-50/70 transition-colors">
                  {/* Nombre */}
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-zinc-700 text-2xs shrink-0">
                        {member.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900 truncate">{member.name}</p>
                        <p className="text-2xs text-zinc-400">{member.role}</p>
                      </div>
                    </div>
                  </td>

                  {/* Ruta */}
                  <td className="py-3 px-3">
                    <span className="text-zinc-700 text-xs font-medium">{member.route}</span>
                  </td>

                  {/* Estado en vivo */}
                  <td className="py-3 px-3">
                    {member.status === "en_cliente" && (
                      <Badge variant="success">En cliente</Badge>
                    )}
                    {member.status === "en_ruta" && (
                      <Badge variant="info">En traslado</Badge>
                    )}
                    {member.status === "finalizado" && (
                      <Badge variant="neutral">Jornada cerrada</Badge>
                    )}
                    {member.status === "sin_iniciar" && (
                      <Badge variant="warning">Sin iniciar</Badge>
                    )}
                  </td>

                  {/* Avance de visitas */}
                  <td className="py-3 px-3">
                    <div className="w-28">
                      <div className="flex justify-between text-2xs text-zinc-600 mb-1">
                        <span className="font-semibold">
                          {member.visitsCompleted} / {member.visitsScheduled}
                        </span>
                        <span className="text-zinc-400">{progress}%</span>
                      </div>
                      <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300 bg-zinc-700"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Pedidos */}
                  <td className="py-3 px-3">
                    {member.ordersCount > 0 ? (
                      <div>
                        <span className="font-semibold text-zinc-900 text-xs">
                          S/ {member.ordersTotal.toLocaleString("es-PE")}
                        </span>
                        <p className="text-2xs text-zinc-400">
                          {member.ordersCount} pedido{member.ordersCount > 1 ? "s" : ""}
                        </p>
                      </div>
                    ) : (
                      <span className="text-2xs text-zinc-400">—</span>
                    )}
                  </td>

                  {/* Última actividad */}
                  <td className="py-3 pl-3 text-right">
                    <p className="text-xs font-medium text-zinc-700">{member.lastCheckIn}</p>
                    {member.currentLocationName && (
                      <p className="text-2xs text-zinc-400 truncate max-w-[160px] ml-auto">
                        {member.currentLocationName}
                      </p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

