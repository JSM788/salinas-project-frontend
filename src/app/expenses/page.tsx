"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { DashboardShell } from "@/shared/layout/DashboardShell";
import { PageHeader } from "@/shared/patterns/PageHeader";
import { Button } from "@/shared/components/ui/button";
import { GastosTable, RegistrarGastoDrawer } from "@/modules/comercial/gastos";
import { useDemo } from "@/shared/state/demo-store";

export default function GastosPage() {
  const [isRegistrarOpen, setIsRegistrarOpen] = useState(false);
  const { gastos } = useDemo();

  return (
    <DashboardShell>
      <div className="space-y-4">
        <PageHeader
          breadcrumbs={[
            { label: "Inicio", href: "/inicio/" },
            { label: "Comercial", href: "/comercial/clientes/" },
            { label: "Gastos" },
          ]}
          title="Gastos"
          subtitle="Rendiciones de campo"
          actions={
            /* Ocultado temporalmente: acción ejecutada en App Móvil / ERP (SAP/Defontana)
            <Button size="sm" onClick={() => setIsRegistrarOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Registrar gasto
            </Button>
            */
            undefined
          }
        />

        <GastosTable gastos={gastos} />

        <RegistrarGastoDrawer
          isOpen={isRegistrarOpen}
          onClose={() => setIsRegistrarOpen(false)}
        />
      </div>
    </DashboardShell>
  );
}
