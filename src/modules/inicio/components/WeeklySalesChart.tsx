import React from "react";
import { formatCurrency } from "@/shared/lib/utils";
import { chartScale, type WeekSales } from "../lib/dashboard";

interface WeeklySalesChartProps {
  weeks: WeekSales[];
  totalOrders: number;
}

export const WeeklySalesChart: React.FC<WeeklySalesChartProps> = ({ weeks, totalOrders }) => {
  const { max, ticks } = chartScale(Math.max(0, ...weeks.map((w) => w.total)));
  const columns = { gridTemplateColumns: `repeat(${Math.max(weeks.length, 1)}, minmax(0, 1fr))` };

  return (
    <div className="bg-white border border-zinc-200/90 rounded-xl p-4 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-zinc-900">Ventas por semana</h2>
        <span className="text-xs font-medium text-zinc-500">
          Total: {totalOrders} {totalOrders === 1 ? "pedido" : "pedidos"}
        </span>
      </div>

      <div className="pt-6 pb-1">
        {/* Plot area: gridlines are positioned by value, bars grow from the baseline. */}
        <div className="relative h-40 ml-14">
          {ticks.map((tick) => (
            <div
              key={tick}
              className={`absolute left-0 right-0 border-t ${
                tick === 0 ? "border-zinc-200" : "border-dashed border-zinc-100"
              }`}
              style={{ bottom: `${(tick / max) * 100}%` }}
            >
              <span className="absolute -left-14 w-12 -translate-y-1/2 text-right text-2xs text-zinc-400">
                {tick.toLocaleString("es-PE")}
              </span>
            </div>
          ))}

          <div className="absolute inset-0 grid gap-2 sm:gap-6 z-10" style={columns}>
            {weeks.map((week) => (
              <div key={week.id} className="h-full flex flex-col items-center justify-end">
                <div
                  className="relative w-full max-w-12 bg-zinc-500 rounded-t-xs hover:bg-zinc-700 transition-colors"
                  style={{ height: `${Math.min(100, (week.total / max) * 100)}%` }}
                >
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xs font-semibold text-zinc-700 whitespace-nowrap">
                    {formatCurrency(week.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Week labels */}
        <div className="grid gap-2 sm:gap-6 ml-14 mt-2" style={columns}>
          {weeks.map((week) => (
            <div key={week.id} className="text-center">
              <p className="text-2xs font-semibold text-zinc-700 leading-tight whitespace-nowrap">
                {week.range}
              </p>
              <p className="text-3xs text-zinc-400 leading-tight mt-0.5 whitespace-nowrap">
                {week.orders} {week.orders === 1 ? "pedido" : "pedidos"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
