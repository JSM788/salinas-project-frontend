"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { DashboardShell } from "@/shared/layout/DashboardShell";
import { PageHeader } from "@/shared/patterns/PageHeader";
import { Tabs } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import { useDemo } from "@/shared/state/demo-store";
import {
  VisitasExtraordinariasTable,
  MaterialPOPTable,
  SolicitarVisitaDrawer,
  SolicitarMaterialPOPDrawer,
} from "@/modules/comercial/solicitudes";

export default function SolicitudesPage() {
  const [activeTab, setActiveTab] = useState("visitas");
  const [isVisitaOpen, setIsVisitaOpen] = useState(false);
  const [isPopOpen, setIsPopOpen] = useState(false);

  const { visitasExtra: visitas, pops: materiales } = useDemo();

  // Badges count only requests waiting for a decision.
  const tabs = [
    {
      id: "visitas",
      label: "Visitas extraordinarias",
      badge: visitas.filter((v) => v.status === "Pendiente").length,
    },
    {
      id: "material",
      label: "Material POP",
      badge: materiales.filter((m) => m.status === "Pendiente").length,
    },
  ];

  return (
    <DashboardShell>
      <div className="space-y-4">
        <PageHeader
          breadcrumbs={[
            { label: "Inicio", href: "/inicio/" },
            { label: "Comercial", href: "/comercial/clientes/" },
            { label: "Solicitudes" },
          ]}
          title="Solicitudes"
          actions={
            activeTab === "visitas" ? (
              /* "Vista de gerencia" button removed: it had no handler and this page already is the
                 supervision view of the requests. */
              <div className="flex items-center gap-2">
                {/* Ocultado temporalmente: acción ejecutada en App Móvil / ERP (SAP/Defontana)
                <Button size="sm" onClick={() => setIsVisitaOpen(true)}>
                  <Plus className="h-3.5 w-3.5" /> Nueva solicitud
                </Button>
                */}
              </div>
            ) : (
              /* Ocultado temporalmente: acción ejecutada en App Móvil / ERP (SAP/Defontana)
              <Button size="sm" onClick={() => setIsPopOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Solicitar material
              </Button>
              */
              undefined
            )
          }
        />

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "visitas" ? (
          <VisitasExtraordinariasTable solicitudes={visitas} onOpenNew={() => setIsVisitaOpen(true)} />
        ) : (
          <MaterialPOPTable materiales={materiales} onOpenNew={() => setIsPopOpen(true)} />
        )}

        <SolicitarVisitaDrawer
          isOpen={isVisitaOpen}
          onClose={() => setIsVisitaOpen(false)}
        />

        <SolicitarMaterialPOPDrawer
          isOpen={isPopOpen}
          onClose={() => setIsPopOpen(false)}
        />
      </div>
    </DashboardShell>
  );
}
