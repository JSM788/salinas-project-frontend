"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Pagination } from "./Pagination";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectRow?: (id: string) => void;
  onSelectAll?: () => void;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  entityName?: string;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  selectable = false,
  selectedIds = [],
  onSelectRow,
  onSelectAll,
  totalCount,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  entityName = "registros",
  emptyMessage = "No se encontraron registros.",
}: DataTableProps<T>) {
  const allSelected =
    selectable && data.length > 0 && data.every((row) => selectedIds.includes(keyExtractor(row)));

  const count = totalCount ?? data.length;
  const totalPages = Math.ceil(count / pageSize) || 1;

  return (
    <div className="space-y-4">
      {/* Table Frame */}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          {/* Calibrated header: intermediate clean neutral gray with subtle column borders */}
          <thead className="bg-[#f4f4f5] border-b border-zinc-200 text-zinc-700 font-semibold select-none">
            <tr className="divide-x divide-zinc-200/80">
              {selectable && (
                <th className="w-10 px-3 py-2.5 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onSelectAll}
                    className="rounded border-zinc-300 text-zinc-800 focus:ring-zinc-800 h-3.5 w-3.5 cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={col.width ? { width: col.width } : undefined}
                  className={cn("px-4 py-2.5 text-xs text-zinc-700 font-semibold", col.headerClassName)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <ArrowUpDown className="h-3 w-3 text-zinc-400 cursor-pointer hover:text-zinc-700" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-8 text-center text-zinc-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const rowId = keyExtractor(row);
                const isSelected = selectedIds.includes(rowId);
                return (
                  <tr
                    key={rowId}
                    className={cn(
                      "hover:bg-zinc-50/70 transition-colors divide-x divide-zinc-100",
                      isSelected && "bg-zinc-50"
                    )}
                  >
                    {selectable && (
                      <td className="w-10 px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onSelectRow?.(rowId)}
                          className="rounded border-zinc-300 text-zinc-800 focus:ring-zinc-800 h-3.5 w-3.5 cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className={cn("px-4 py-2.5 align-middle text-zinc-800", col.className)}
                      >
                        {col.cell
                          ? col.cell(row)
                          : col.accessorKey
                          ? String(row[col.accessorKey] ?? "")
                          : null}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={currentPage} total={count} pageSize={pageSize} shown={data.length} entityName={entityName} onPageChange={onPageChange} />
    </div>
  );
}
