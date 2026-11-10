"use client";

import React, { useState } from "react";
import { PageHeader } from "@/shared/patterns/PageHeader";
import { Tabs } from "@/shared/components/ui/tabs";
import { useAuth } from "@/shared/lib/auth-context";
import { useLiveCliente } from "@/shared/state/demo-store";
import { Cliente } from "../../models/cliente.model";
import {
  FichaTabId,
  getCustomerRoleCapabilities,
} from "../../lib/customer-role-capabilities";
import { ClienteResumenTab } from "./tabs/ClienteResumenTab";
import { ClienteComprasTab } from "./tabs/ClienteComprasTab";
import { ClienteCreditoTab } from "./tabs/ClienteCreditoTab";
import { ClienteActividadTab } from "./tabs/ClienteActividadTab";

interface ClienteFichaViewProps {
  cliente: Cliente;
}

const ALL_TABS: { id: FichaTabId; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "compras", label: "Compras" },
  { id: "credito", label: "Crédito y deuda" },
  { id: "actividad", label: "Actividad" },
];

export const ClienteFichaView: React.FC<ClienteFichaViewProps> = ({ cliente: seed }) => {
  const { session } = useAuth();
  const capabilities = getCustomerRoleCapabilities(session);
  const cliente = useLiveCliente(seed);

  const visibleTabs = ALL_TABS.filter((tab) => capabilities.fichaTabs.includes(tab.id));
  const defaultTab = visibleTabs[0]?.id ?? "actividad";
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const currentTab = visibleTabs.some((tab) => tab.id === activeTab) ? activeTab : defaultTab;

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumbs={[
          { label: "Comercial", href: "/commercial/customers/" },
          { label: "Clientes", href: "/commercial/customers/" },
          { label: cliente.name },
        ]}
        title={cliente.name}
        subtitle={`Cliente · ${cliente.code}`}
      />

      <Tabs tabs={visibleTabs} activeTab={currentTab} onChange={setActiveTab} />

      {currentTab === "resumen" && capabilities.fichaTabs.includes("resumen") ? (
        <ClienteResumenTab
          cliente={cliente}
          onViewAllActivity={() => setActiveTab("actividad")}
        />
      ) : currentTab === "compras" && capabilities.fichaTabs.includes("compras") ? (
        <ClienteComprasTab cliente={cliente} />
      ) : currentTab === "credito" && capabilities.fichaTabs.includes("credito") ? (
        <ClienteCreditoTab cliente={cliente} />
      ) : currentTab === "actividad" ? (
        <ClienteActividadTab cliente={cliente} />
      ) : null}
    </div>
  );
};

