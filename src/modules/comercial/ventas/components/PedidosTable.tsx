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
import {
  PAYMENT_STATUS_LABEL,
  Pedido,
  RESERVATION_STATUS_LABEL,
} from "../models/venta.model";

export const PedidosTable: React.FC = () => {
  const { pedidos } = useDemo();
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("Todos");
  const [seller, setSeller] = useState("Todos");

  const filtered = pedidos.filter((p) => {
    const matchesSearch =
      !search ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.clienteName.toLowerCase().includes(search.toLowerCase());
    const matchesPayment = paymentFilter === "Todos" || p.paymentStatus === paymentFilter;
    const matchesSeller = seller === "Todos" || p.seller === seller;

    return matchesSearch && matchesPayment && matchesSeller;
  });

  const columns: Column<Pedido>[] = [
    {
      header: "Pedido",
      accessorKey: "code",
      cell: (row) => (
        <Link
          href={`/comercial/ventas/pedidos/${row.id}/`}
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
      header: "Total",
      cell: (row) => (
        <span className="font-semibold text-zinc-900">{formatCurrency(row.total)}</span>
      ),
    },
    {
      header: "Pago",
      cell: (row) => (
        <Badge
          variant={
            row.paymentStatus === "Conciliado"
              ? "success"
              : row.paymentStatus === "Observado"
              ? "danger"
              : "warning"
          }
        >
          {PAYMENT_STATUS_LABEL[row.paymentStatus]}
        </Badge>
      ),
    },
    {
      header: "Reserva",
      cell: (row) => (
        <Badge variant={row.reservationStatus === "Confirmada" ? "success" : "warning"}>
          {RESERVATION_STATUS_LABEL[row.reservationStatus]}
        </Badge>
      ),
    },
    {
      header: "Acción",
      className: "w-24 text-right",
      cell: (row) => (
        <Link href={`/comercial/ventas/pedidos/${row.id}/`}>
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
        searchPlaceholder="Buscar pedidos, cliente..."
      >
        <div className="w-44">
          <Select
            label="Pago"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            options={[
              { label: "Todos", value: "Todos" },
              { label: PAYMENT_STATUS_LABEL.Pendiente, value: "Pendiente" },
              { label: PAYMENT_STATUS_LABEL.Conciliado, value: "Conciliado" },
              { label: PAYMENT_STATUS_LABEL.Observado, value: "Observado" },
            ]}
          />
        </div>

        <div className="w-40">
          <Select
            label="Vendedor"
            value={seller}
            onChange={(e) => setSeller(e.target.value)}
            options={optionsFrom(pedidos.map((p) => p.seller))}
          />
        </div>
      </FilterBar>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(row) => row.id}
        entityName="pedidos"
      />
    </div>
  );
};
