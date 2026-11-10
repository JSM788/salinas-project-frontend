"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DataTable, Column } from "@/shared/patterns/DataTable";
import { FilterBar } from "@/shared/patterns/FilterBar";
import { Select } from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { formatCurrency } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { CuentaPorCobrar } from "../models/finanzas.model";
import { ExternalLink, PhoneCall } from "lucide-react";

interface CuentasPorCobrarTableProps {
  initialData: CuentaPorCobrar[];
}

export const CuentasPorCobrarTable: React.FC<CuentasPorCobrarTableProps> = ({
  initialData,
}) => {
  const [data] = useState<CuentaPorCobrar[]>(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [zoneFilter, setZoneFilter] = useState("Todas");

  const filteredData = data.filter((c) => {
    const matchesSearch =
      !search ||
      c.clientName.toLowerCase().includes(search.toLowerCase()) ||
      c.ruc.includes(search);
    const matchesStatus = statusFilter === "Todos" || c.status === statusFilter;
    const matchesZone = zoneFilter === "Todas" || c.zone === zoneFilter;

    return matchesSearch && matchesStatus && matchesZone;
  });

  const columns: Column<CuentaPorCobrar>[] = [
    {
      header: "Cliente / RUC",
      sortable: true,
      width: "25%",
      cell: (row) => (
        <div>
          <Link
            href={`/comercial/clientes/${row.clientId}/`}
            className="font-bold text-zinc-900 hover:underline flex items-center gap-1"
          >
            {row.clientName}
            <ExternalLink className="h-3 w-3 text-zinc-400" />
          </Link>
          <span className="text-2xs text-zinc-400">RUC: {row.ruc} · {row.zone}</span>
        </div>
      ),
    },
    {
      header: "Línea Aprobada",
      accessorKey: "creditLimit",
      width: "15%",
      cell: (row) => (
        <span className="text-zinc-700 font-medium">
          {formatCurrency(row.creditLimit)}
        </span>
      ),
    },
    {
      header: "Deuda Total",
      accessorKey: "totalDebt",
      sortable: true,
      width: "15%",
      cell: (row) => (
        <span className="font-extrabold text-zinc-950">
          {formatCurrency(row.totalDebt)}
        </span>
      ),
    },
    {
      header: "Corriente",
      accessorKey: "currentDebt",
      width: "12%",
      cell: (row) => (
        <span className="text-zinc-600">
          {formatCurrency(row.currentDebt)}
        </span>
      ),
    },
    {
      header: "Vencido >30d",
      width: "13%",
      cell: (row) => {
        const vencido = row.overdue31to60 + row.overdueMore60;
        return (
          <span
            className={
              vencido > 0 ? "font-bold text-rose-600" : "text-zinc-400 font-normal"
            }
          >
            {vencido > 0
              ? formatCurrency(vencido)
              : "S/ 0.00"}
          </span>
        );
      },
    },
    {
      header: "Estado",
      accessorKey: "status",
      width: "12%",
      cell: (row) => (
        <Badge
          variant={
            row.status === "Al día"
              ? "success"
              : row.status === "Por vencer"
              ? "warning"
              : "danger"
          }
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Último Pago",
      accessorKey: "lastPaymentDate",
      width: "12%",
      cell: (row) => <span className="text-2xs text-zinc-500">{row.lastPaymentDate}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por cliente o RUC..."
      >
        <div className="w-44">
          <Select
            label="Estado de Deuda"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: "Todos los estados", value: "Todos" },
              { label: "Al día", value: "Al día" },
              { label: "Por vencer", value: "Por vencer" },
              { label: "En mora", value: "En mora" },
            ]}
          />
        </div>

        <div className="w-44">
          <Select
            label="Zona"
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            options={[
              { label: "Todas las zonas", value: "Todas" },
              { label: "Lima Centro", value: "Lima Centro" },
              { label: "Lima Sur", value: "Lima Sur" },
              { label: "Lima Norte", value: "Lima Norte" },
              { label: "Lima Este", value: "Lima Este" },
            ]}
          />
        </div>
      </FilterBar>

      <DataTable
        columns={columns}
        data={filteredData}
        keyExtractor={(row) => row.id}
        entityName="clientes"
      />
    </div>
  );
};
