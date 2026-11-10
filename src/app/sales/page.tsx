"use client";

import React, { useState } from "react";
import { DashboardShell } from "@/shared/layout/DashboardShell";
import { PageHeader } from "@/shared/patterns/PageHeader";
import { Tabs } from "@/shared/components/ui/tabs";
import { CotizacionesTable, PedidosTable } from "@/modules/comercial/ventas";
import { APP_ROUTES } from "@/config/routes";

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState("cotizaciones");

  const tabs = [
    { id: "cotizaciones", label: "Cotizaciones" },
    { id: "pedidos", label: "Pedidos" },
  ];

  return (
    <DashboardShell>
      <div className="space-y-4">
        <PageHeader
          breadcrumbs={[
            { label: "Comercial", href: `${APP_ROUTES.CUSTOMERS}/` },
            { label: "Ventas" },
          ]}
          title="Ventas"
          subtitle="Supervisa las cotizaciones y pedidos que registran los comerciales desde la app"
        />

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "cotizaciones" ? <CotizacionesTable /> : <PedidosTable />}
      </div>
    </DashboardShell>
  );
}

