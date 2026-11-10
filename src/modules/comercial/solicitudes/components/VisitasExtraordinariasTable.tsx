"use client";

import React, { useMemo, useState } from "react";
import { DataTable, Column } from "@/shared/patterns/DataTable";
import { FilterBar } from "@/shared/patterns/FilterBar";
import { Select } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { optionsFrom } from "@/shared/lib/options";
import { useDemo } from "@/shared/state/demo-store";
import { VisitaExtraordinaria } from "../models/solicitud.model";
import { RevisarSolicitudDrawer } from "./RevisarSolicitudDrawer";

interface VisitasExtraordinariasTableProps {
  solicitudes: VisitaExtraordinaria[];
  onOpenNew?: () => void;
}

export const VisitasExtraordinariasTable: React.FC<VisitasExtraordinariasTableProps> = ({
  solicitudes,
}) => {
  const { resolverVisitaExtra } = useDemo();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Todos");
  const [seller, setSeller] = useState("Todos");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Read the live row so the drawer shows the decision right after it is saved.
  const selectedItem = solicitudes.find((s) => s.id === selectedId) ?? null;
  const sellerOptions = useMemo(() => optionsFrom(solicitudes.map((s) => s.seller)), [solicitudes]);

  const filtered = solicitudes.filter((s) => {
    const matchesSearch =
      !search ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "Todos" || s.status === status;
    const matchesSeller = seller === "Todos" || s.seller === seller;

    return matchesSearch && matchesStatus && matchesSeller;
  });

  const handleDecision = (action: "aprobar" | "rechazar", notes: string) => {
    if (!selectedItem) return;
    resolverVisitaExtra(selectedItem.id, action === "aprobar" ? "Aprobada" : "Rechazada", notes);
  };

  const columns: Column<VisitaExtraordinaria>[] = [
    {
      header: "Solicitud",
      accessorKey: "code",
      cell: (row) => <span className="font-semibold text-zinc-900">{row.code}</span>,
    },
    {
      header: "Cliente",
      accessorKey: "clientName",
      cell: (row) => <span className="font-medium text-zinc-900">{row.clientName}</span>,
    },
    {
      header: "Solicitante",
      accessorKey: "seller",
    },
    {
      header: "Fecha solicitada",
      cell: (row) => (
        <span>
          {row.date}, {row.hour}
        </span>
      ),
    },
    {
      header: "Motivo",
      accessorKey: "reason",
    },
    {
      header: "Estado",
      cell: (row) => {
        const variant =
          row.status === "Aprobada"
            ? "success"
            : row.status === "Pendiente"
            ? "warning"
            : "danger";
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
    {
      header: "Acción",
      className: "w-24 text-right",
      cell: (row) => (
        <Button
          size="sm"
          variant="secondary"
          className="h-7 text-xs px-3"
          onClick={() => setSelectedId(row.id)}
        >
          {row.status === "Pendiente" ? "Revisar" : "Ver"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar solicitudes, cliente..."
      >
        <div className="w-36">
          <Select
            label="Estado"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { label: "Todos", value: "Todos" },
              { label: "Pendiente", value: "Pendiente" },
              { label: "Aprobada", value: "Aprobada" },
              { label: "Rechazada", value: "Rechazada" },
            ]}
          />
        </div>

        <div className="w-40">
          <Select
            label="Solicitante"
            value={seller}
            onChange={(e) => setSeller(e.target.value)}
            options={sellerOptions}
          />
        </div>
      </FilterBar>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(row) => row.id}
        entityName="solicitudes"
      />

      <RevisarSolicitudDrawer
        isOpen={!!selectedItem}
        onClose={() => setSelectedId(null)}
        solicitud={selectedItem}
        onDecide={handleDecision}
      />
    </div>
  );
};
