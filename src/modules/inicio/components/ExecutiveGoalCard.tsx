"use client";

import React from "react";
import Link from "next/link";
import { Target, TrendingUp, Calendar, ArrowUpRight, DollarSign } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";
import { APP_ROUTES } from "@/config/routes";

interface ExecutiveGoalCardProps {
  currentSales: number;
  targetSales?: number;
  totalOrders: number;
  periodName?: string;
}

export const ExecutiveGoalCard: React.FC<ExecutiveGoalCardProps> = ({
  currentSales,
  targetSales = 120000,
  totalOrders,
  periodName = "Octubre 2026",
}) => {
  const percentage = Math.min(100, Math.round((currentSales / targetSales) * 100));
  const remaining = Math.max(0, targetSales - currentSales);
  const averageTicket = totalOrders > 0 ? currentSales / totalOrders : 0;

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white rounded-xl p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-amber-400">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-200">Meta Comercial de Ventas</p>
              <p className="text-2xs text-zinc-400">{periodName}</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/50">
            {percentage}% alcanzado
          </span>
        </div>

        {/* Cifras principales */}
        <div className="mt-4">
          <p className="text-3xl font-extrabold tracking-tight text-white">
            {formatCurrency(currentSales)}
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            Meta del mes: <span className="font-semibold text-zinc-200">{formatCurrency(targetSales)}</span>
          </p>
        </div>

        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-2xs text-zinc-400 mt-1.5">
            <span>Faltan {formatCurrency(remaining)}</span>
            <span>15 días hábiles restantes</span>
          </div>
        </div>
      </div>

      {/* Métricas secundarias */}
      <div className="mt-5 pt-4 border-t border-zinc-800/80 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-2xs text-zinc-400">Ticket promedio</p>
          <p className="font-bold text-zinc-200 mt-0.5">{formatCurrency(averageTicket)}</p>
        </div>
        <div>
          <p className="text-2xs text-zinc-400">Efectividad de cierre</p>
          <p className="font-bold text-emerald-400 mt-0.5">82.4% de cotizaciones</p>
        </div>
      </div>
    </div>
  );
};

