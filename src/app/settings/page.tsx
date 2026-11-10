import React from "react";
import { DashboardShell } from "@/shared/layout/DashboardShell";
import { PageHeader } from "@/shared/patterns/PageHeader";
import { EmptyState } from "@/shared/patterns/EmptyState";
import { Settings } from "lucide-react";

export default function ConfiguracionPage() {
  return (
    <DashboardShell>
      <div className="space-y-4">
        <PageHeader title="Configuración del Sistema" subtitle="Parámetros de empresa, roles de usuario y permisos" />
        <EmptyState
          icon={<Settings className="h-6 w-6" />}
          title="Módulo de Configuración en preparación"
          description="Espacio reservado para gestión de usuarios, roles comerciales y capacidades de empresa según la arquitectura prevista."
        />
      </div>
    </DashboardShell>
  );
}
