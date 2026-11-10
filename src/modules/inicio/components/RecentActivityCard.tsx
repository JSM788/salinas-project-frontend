import React from "react";
import Link from "next/link";
import { CreditCard, FileText } from "lucide-react";
import type { ActivityEntry } from "../lib/dashboard";

interface RecentActivityCardProps {
  entries: ActivityEntry[];
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ entries }) => (
  <div className="bg-white border border-zinc-200/90 rounded-xl p-4 shadow-2xs">
    <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
      <h2 className="text-sm font-bold text-zinc-900">Actividad reciente</h2>
      <Link
        href="/comercial/ventas/"
        className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
      >
        Ver todas
      </Link>
    </div>

    {entries.length === 0 ? (
      <p className="py-6 text-center text-xs text-zinc-400">Aún no hay actividad registrada.</p>
    ) : (
      <div className="divide-y divide-zinc-100">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="py-3 flex items-center justify-between gap-3 text-xs group hover:bg-zinc-50/60 -mx-2 px-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center shrink-0">
                {entry.type === "Pago" ? (
                  <CreditCard className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
              </div>
              <div className="text-zinc-700 truncate">
                <Link
                  href={`/comercial/ventas/pedidos/${entry.pedidoId}/`}
                  className="font-semibold text-zinc-900 hover:underline"
                >
                  {entry.pedidoCode}
                </Link>{" "}
                · {entry.title} · <span className="text-zinc-700">{entry.clienteName}</span>
              </div>
            </div>
            <span className="text-2xs text-zinc-400 font-medium shrink-0">{entry.whenLabel}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);
