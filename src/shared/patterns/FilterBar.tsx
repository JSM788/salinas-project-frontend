"use client";

import React from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  onToggleMoreFilters?: () => void;
  hasMoreFilters?: boolean;
  rightActions?: React.ReactNode;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  children,
  onToggleMoreFilters,
  hasMoreFilters = false,
  rightActions,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-3 py-2",
        className
      )}
    >
      <div className="flex flex-wrap items-end gap-3 flex-1">
        {/* Search input with fixed 36px height matching select */}
        <div className="relative min-w-64 max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-zinc-200 rounded-md placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
          />
        </div>

        {/* Children dropdowns/filters */}
        {children}

        {/* More filters trigger */}
        {hasMoreFilters && onToggleMoreFilters && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onToggleMoreFilters}
            className="text-xs h-9 px-3 gap-1.5 shrink-0"
          >
            <Filter className="h-3.5 w-3.5 text-zinc-500" />
            Más filtros
          </Button>
        )}
      </div>

      {rightActions && <div className="flex items-center gap-2 self-end">{rightActions}</div>}
    </div>
  );
};
