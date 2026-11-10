import React from "react";
import { DashboardShell } from "@/shared/layout/DashboardShell";
import { PageHeader } from "@/shared/patterns/PageHeader";
import { EmptyState } from "@/shared/patterns/EmptyState";
import { Package } from "lucide-react";

export default function InventarioPage() {
  return (
    <DashboardShell>
      <div className="space-y-4">
        <PageHeader title="Inventario y Stock" subtitle="Disponibilidad en almacenes centrales y reservas provisionales" />
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title="Módulo de Inventario en preparación"
          description="Las existencias y reservas SAP provisionales se visualizan directamente en la gestión de pedidos y cotizaciones."
        />
      </div>
    </DashboardShell>
  );
}
