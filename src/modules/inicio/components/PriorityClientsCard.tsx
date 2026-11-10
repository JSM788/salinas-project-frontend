import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { clienteTieneFicha } from "@/shared/state/demo-store";
import type { PriorityClient } from "../lib/dashboard";

interface PriorityClientsCardProps {
  clients: PriorityClient[];
}

export const PriorityClientsCard: React.FC<PriorityClientsCardProps> = ({ clients }) => (
  <div className="lg:col-span-5 bg-white border border-zinc-200/90 rounded-xl p-4 shadow-2xs flex flex-col">
    <div className="flex items-start justify-between pb-3 border-b border-zinc-100">
      <div>
        <h2 className="text-sm font-bold text-zinc-900">Clientes en prioridad</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Deuda vencida y pagos por conciliar</p>
      </div>
      <Link
        href="/comercial/clientes/"
        className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors pt-0.5"
      >
        Ver todos
      </Link>
    </div>

    {clients.length === 0 ? (
      <p className="py-6 text-center text-xs text-zinc-400">No hay clientes que requieran seguimiento.</p>
    ) : (
      <div className="divide-y divide-zinc-100">
        {clients.map((client) => (
          <div
            key={client.id}
            className="py-3 flex items-center justify-between group hover:bg-zinc-50/60 -mx-2 px-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-zinc-200/80 text-zinc-700 flex items-center justify-center text-xs font-bold shrink-0">
                {client.initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-900 truncate">{client.name}</p>
                <p className="text-2xs text-zinc-500 mt-0.5 truncate">{client.reason}</p>
              </div>
            </div>

            {clienteTieneFicha(client.id) && (
              <Link
                href={`/comercial/clientes/${client.id}/`}
                className="inline-flex items-center text-xs font-medium text-zinc-700 hover:text-zinc-950 shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform"
              >
                Revisar
                <ArrowRight className="h-3 w-3 ml-1 text-zinc-500 group-hover:text-zinc-900" />
              </Link>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);
