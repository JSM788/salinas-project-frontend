import React from "react";
import { DashboardShell } from "@/shared/layout/DashboardShell";
import { PageHeader } from "@/shared/patterns/PageHeader";
import { EmptyState } from "@/shared/patterns/EmptyState";
import { BarChart3 } from "lucide-react";

export default function ReportesPage() {
  return (
    <DashboardShell>
      <div className="space-y-4">
        <PageHeader title="Reportes Comerciales" subtitle="Indicadores clave de rendimiento, ventas y cumplimiento de visitas" />
        <EmptyState
          icon={<BarChart3 className="h-6 w-6" />}
          title="Módulo de Reportes en preparación"
          description="Consolidará métricas de efectividad de visitas en campo, tiempos de atención y avance de cuotas por vendedor."
        />
      </div>
    </DashboardShell>
  );
}
