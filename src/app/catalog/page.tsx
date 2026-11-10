import React from "react";
import { DashboardShell } from "@/shared/layout/DashboardShell";
import { PageHeader } from "@/shared/patterns/PageHeader";
import { EmptyState } from "@/shared/patterns/EmptyState";
import { BookOpen } from "lucide-react";

export default function CatalogoPage() {
  return (
    <DashboardShell>
      <div className="space-y-4">
        <PageHeader title="Catálogo de Productos" subtitle="Maestro de artículos, marcas y precios vigentes" />
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="Módulo de Catálogo en preparación"
          description="Los productos de referencia están integrados en las vistas de Ventas y Pedidos (Bravery, Royal Canin, Pro Plan)."
        />
      </div>
    </DashboardShell>
  );
}
