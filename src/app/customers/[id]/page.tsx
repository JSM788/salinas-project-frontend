import React from "react";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/shared/layout/DashboardShell";
import { getClienteById, getClientes, ClienteFichaView } from "@/modules/comercial/clientes";

export function generateStaticParams() {
  const clientes = getClientes();
  return clientes.map((c) => ({
    id: c.id,
  }));
}

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const cliente = getClienteById(params.id);

  if (!cliente) {
    notFound();
  }

  return (
    <DashboardShell>
      <ClienteFichaView cliente={cliente} />
    </DashboardShell>
  );
}

