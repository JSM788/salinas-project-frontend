"use client";

import React, { useMemo, useState } from "react";
import { DataTable, Column } from "@/shared/patterns/DataTable";
import { optionsFrom } from "@/shared/lib/options";
import { toSortKey } from "@/shared/lib/date";
import { FilterBar } from "@/shared/patterns/FilterBar";
import { Select } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { RegistroVisita } from "../models/visita.model";
import { RegistroVisitaDrawer } from "./RegistroVisitaDrawer";

interface RegistrosViewProps {
  registros: RegistroVisita[];
  pagination?: { currentPage: number; totalCount: number; pageSize: number; onPageChange: (page: number) => void };
  renderDetail?: (record: RegistroVisita, close: () => void) => React.ReactNode;
}

export const RegistrosView: React.FC<RegistrosViewProps> = ({
  registros,
  renderDetail,
  pagination,
}) => {
  const [search, setSearch] = useState("");
  const [seller, setSeller] = useState("Todos");
  const [result, setResult] = useState("Todos");
  const [date, setDate] = useState("Todos");
  const [selectedRegistro, setSelectedRegistro] =
    useState<RegistroVisita | null>(null);

  const sellerOptions = useMemo(
    () => optionsFrom(registros.map((r) => r.seller)),
    [registros],
  );
  const dateOptions = useMemo(() => {
    const dates = Array.from(new Set(registros.map((r) => r.date)));
    dates.sort((a, b) => toSortKey(b) - toSortKey(a));
    return [
      { label: "Todas", value: "Todos" },
      ...dates.map((d) => ({ label: d, value: d })),
    ];
  }, [registros]);

  const filtered = registros
    .filter((r) => {
      const matchesSearch =
        !search ||
        r.clientName.toLowerCase().includes(search.toLowerCase()) ||
        r.code.toLowerCase().includes(search.toLowerCase());
      const matchesSeller = seller === "Todos" || r.seller === seller;
      const matchesResult = result === "Todos" || r.result === result;
      const matchesDate = date === "Todos" || r.date === date;

      return matchesSearch && matchesSeller && matchesResult && matchesDate;
    })
    .sort(
      (a, b) => toSortKey(b.date, b.checkIn) - toSortKey(a.date, a.checkIn),
    );

  const columns: Column<RegistroVisita>[] = [
    {
      header: "Código",
      accessorKey: "code",
      cell: (row) => (
        <span className="font-semibold text-zinc-900">{row.code}</span>
      ),
    },
    {
      header: "Cliente",
      accessorKey: "clientName",
      cell: (row) => (
        <span className="font-medium text-zinc-900">{row.clientName}</span>
      ),
    },
    {
      header: renderDetail ? "Responsable" : "Vendedor",
      accessorKey: "seller",
    },
    {
      header: "Fecha",
      accessorKey: "date",
    },
    {
      header: "Resultado",
      cell: (row) => {
        const variant =
          row.result === "Con pedido" || row.result === "Atendida"
            ? "success"
            : row.result === "Sin compra" || row.result === "No atendida"
              ? "neutral"
              : "warning";
        return <Badge variant={variant}>{row.result}</Badge>;
      },
    },
    {
      header: "Evidencia",
      cell: (row) => (
        <span className="text-zinc-500">
          {row.evidenceCount} {row.evidenceCount === 1 ? "foto" : "fotos"}
        </span>
      ),
    },
    {
      header: "Acción",
      className: "w-24 text-right",
      cell: (row) => (
        <Button
          size="sm"
          variant="secondary"
          className="h-7 text-xs px-3"
          onClick={() => setSelectedRegistro(row)}
        >
          Ver
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {!renderDetail && <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por cliente o código..."
      >
        <div className="w-40">
          <Select
            label={renderDetail ? "Responsable" : "Vendedor"}
            value={seller}
            onChange={(e) => setSeller(e.target.value)}
            options={sellerOptions}
          />
        </div>

        <div className="w-40">
          <Select
            label="Fecha"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            options={dateOptions}
          />
        </div>

        <div className="w-36">
          <Select
            label="Resultado"
            value={result}
            onChange={(e) => setResult(e.target.value)}
            options={
              renderDetail
                ? [
                    { label: "Todos", value: "Todos" },
                    ...["Atendida", "Local cerrado", "No atendida"].map(
                      (value) => ({ label: value, value }),
                    ),
                  ]
                : [
                    { label: "Todos", value: "Todos" },
                    { label: "Con pedido", value: "Con pedido" },
                    { label: "Sin compra", value: "Sin compra" },
                    { label: "Local cerrado", value: "Local cerrado" },
                  ]
            }
          />
        </div>
      </FilterBar>}

      <DataTable
        {...pagination}
        columns={columns}
        data={filtered}
        keyExtractor={(row) => row.id}
        entityName="registros"
      />

      {renderDetail ? (
        selectedRegistro &&
        renderDetail(selectedRegistro, () => setSelectedRegistro(null))
      ) : (
        <RegistroVisitaDrawer
          isOpen={!!selectedRegistro}
          onClose={() => setSelectedRegistro(null)}
          registro={selectedRegistro}
        />
      )}
    </div>
  );
};
