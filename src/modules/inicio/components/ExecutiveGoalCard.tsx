"use client";

import React from "react";
import { Target } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";
import { Badge } from "@/shared/components/ui/badge";

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
    <div className="bg-white border border-zinc-200/90 rounded-xl p-4 shadow-2xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700 shrink-0">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900">Meta Comercial de Ventas</p>
              <p className="text-xs text-zinc-500">{periodName}</p>
            </div>
          </div>
          <Badge variant="neutral">{percentage}% alcanzado</Badge>
        </div>

        {/* Cifras principales */}
        <div className="mt-4">
          <p className="text-2xl font-bold tracking-tight text-zinc-900">
            {formatCurrency(currentSales)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Meta del mes: <span className="font-semibold text-zinc-800">{formatCurrency(targetSales)}</span>
          </p>
        </div>

        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-zinc-800 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-2xs text-zinc-500 mt-1.5">
            <span>Faltan {formatCurrency(remaining)}</span>
            <span>15 días hábiles restantes</span>
          </div>
        </div>
      </div>

      {/* Métricas secundarias */}
      <div className="mt-5 pt-3 border-t border-zinc-100 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-2xs text-zinc-500">Ticket promedio</p>
          <p className="font-semibold text-zinc-900 mt-0.5">{formatCurrency(averageTicket)}</p>
        </div>
        <div>
          <p className="text-2xs text-zinc-500">Efectividad de cierre</p>
          <p className="font-semibold text-zinc-900 mt-0.5">82.4% de cotizaciones</p>
        </div>
      </div>
    </div>
  );
};

