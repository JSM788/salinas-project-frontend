"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DataTable, Column } from "@/shared/patterns/DataTable";
import { FilterBar } from "@/shared/patterns/FilterBar";
import { Select } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { formatCurrency } from "@/shared/lib/utils";
import { optionsFrom } from "@/shared/lib/options";
import { useDemo } from "@/shared/state/demo-store";
import { Cotizacion } from "../models/venta.model";

export const CotizacionesTable: React.FC = () => {
  const { cotizaciones } = useDemo();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Todos");
  const [seller, setSeller] = useState("Todos");

  const filtered = cotizaciones.filter((c) => {
    const matchesSearch =
      !search ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.clienteName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "Todos" || c.status === status;
    const matchesSeller = seller === "Todos" || c.seller === seller;

    return matchesSearch && matchesStatus && matchesSeller;
  });

  const columns: Column<Cotizacion>[] = [
    {
      header: "Código",
      accessorKey: "code",
      cell: (row) => (
        <Link
          href={`/comercial/ventas/cotizaciones/${row.id}/`}
          className="font-semibold text-zinc-900 hover:underline"
        >
          {row.code}
        </Link>
      ),
    },
    {
      header: "Cliente",
      accessorKey: "clienteName",
      cell: (row) => <span className="font-medium text-zinc-900">{row.clienteName}</span>,
    },
    {
      header: "Vendedor",
      accessorKey: "seller",
    },
    {
      header: "Fecha",
      accessorKey: "date",
    },
    {
      header: "Importe (S/)",
      cell: (row) => (
        <span className="font-semibold text-zinc-900">
          {formatCurrency(row.amount).replace("S/ ", "")}
        </span>
      ),
    },
    {
      header: "Estado",
      cell: (row) => {
        const variant =
          row.status === "Aprobada"
            ? "success"
            : row.status === "Enviada"
            ? "info"
            : "neutral";
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
    {
      header: "Acción",
      className: "w-24 text-right",
      cell: (row) => (
        <Link href={`/comercial/ventas/cotizaciones/${row.id}/`}>
          <Button size="sm" variant="secondary" className="h-7 text-xs px-3">
            Ver
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por código o cliente..."
      >
        <div className="w-36">
          <Select
            label="Estado"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { label: "Todos", value: "Todos" },
              { label: "Borrador", value: "Borrador" },
              { label: "Enviada", value: "Enviada" },
              { label: "Aprobada", value: "Aprobada" },
            ]}
          />
        </div>

        <div className="w-40">
          <Select
            label="Vendedor"
            value={seller}
            onChange={(e) => setSeller(e.target.value)}
            options={optionsFrom(cotizaciones.map((c) => c.seller))}
          />
        </div>
      </FilterBar>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(row) => row.id}
        entityName="cotizaciones"
      />
    </div>
  );
};
