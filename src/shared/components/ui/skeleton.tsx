import React from "react";
import { cn } from "@/shared/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Primitiva universal de Skeleton Shimmer
 * No requiere librerías externas; utiliza animación Tailwind nativa.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-zinc-200/75", className)}
      {...props}
    />
  );
}

/**
 * Skeleton para tarjetas de métricas o KPIs
 */
export function SkeletonMetricCard() {
  return (
    <div className="bg-white border border-zinc-200/90 rounded-xl p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

/**
 * Skeleton para filas de tablas de datos
 */
export function SkeletonTableRows({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-zinc-100">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="py-3 flex items-center gap-4">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <Skeleton
              key={cIdx}
              className={cn(
                "h-4",
                cIdx === 0 ? "w-40" : cIdx === cols - 1 ? "w-20 ml-auto" : "w-28"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

