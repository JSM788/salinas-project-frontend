"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, AlertTriangle, Wallet } from "lucide-react";
import { PageHeader } from "@/shared/patterns/PageHeader";
import { Tabs } from "@/shared/components/ui/tabs";
import { formatCurrency } from "@/shared/lib/utils";
import { useDemo } from "@/shared/state/demo-store";
import { CUENTAS_POR_COBRAR_MOCK } from "@/mocks/finanzas.mock";
import { ConciliacionPagosTable } from "./ConciliacionPagosTable";
import { CuentasPorCobrarTable } from "./CuentasPorCobrarTable";
import { LineasCreditoTable } from "./LineasCreditoTable";

const SCENARIO_DAY = "16 oct. 2026";

export const FinanzasView: React.FC = () => {
  const [activeTab, setActiveTab] = useState("conciliacion");
  const { pagos, pedidos, clientes } = useDemo();

  // Quick stats, all derived from the shared store
  const pagosPendientes = pagos.filter((p) => p.status === "Pendiente");
  const pendientesConciliacion = pagosPendientes.length;
  const montoPendiente = pagosPendientes.reduce((acc, p) => acc + p.amount, 0);

  const clientesConSaldo = clientes.filter((c) => c.currentDebt > 0);
  const deudaTotal = clientes.reduce((acc, c) => acc + c.currentDebt, 0);
  const clientesEnMora = clientes.filter((c) => c.expiredDebt > 0);
  const deudaVencida = clientesEnMora.reduce((acc, c) => acc + c.expiredDebt, 0);

  const conciliadosHoy = pedidos
    .filter((pedido) =>
      pedido.timeline.some((e) => e.title === "Pago conciliado" && e.date === SCENARIO_DAY)
    )
    .map((pedido) => pagos.find((p) => p.orderId === pedido.id))
    .filter((pago): pago is NonNullable<typeof pago> => !!pago && pago.status === "Conciliado");
  const montoConciliadoHoy = conciliadosHoy.reduce((acc, p) => acc + p.amount, 0);

  const tabs = [
    {
      id: "conciliacion",
      label: "Conciliación de pagos",
      badge: pendientesConciliacion > 0 ? pendientesConciliacion : undefined,
    },
    {
      id: "cuentas-cobrar",
      label: "Cuentas por cobrar y mora",
    },
    {
      id: "lineas-credito",
      label: "Líneas de crédito",
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Finanzas y Cobranzas"
        subtitle="Conciliación bancaria, liberación de pedidos y control de crédito comercial"
        breadcrumbs={[
          { label: "Inicio", href: "/inicio/" },
          { label: "Finanzas" },
        ]}
      />

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Por Conciliar */}
        <div className="bg-white border border-zinc-200/90 rounded-xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xs font-medium text-zinc-500">Por conciliar</p>
            <p className="text-xl font-bold tracking-tight text-zinc-900 mt-0.5">
              {formatCurrency(montoPendiente)}
            </p>
            <p className="text-2xs text-amber-700 font-medium mt-0.5">
              {pendientesConciliacion}{" "}
              {pendientesConciliacion === 1 ? "comprobante pendiente" : "comprobantes pendientes"}
            </p>
          </div>
        </div>

        {/* Card 2: Cartera Total */}
        <div className="bg-white border border-zinc-200/90 rounded-xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xs font-medium text-zinc-500">Cartera total por cobrar</p>
            <p className="text-xl font-bold tracking-tight text-zinc-900 mt-0.5">
              {formatCurrency(deudaTotal)}
            </p>
            <p className="text-2xs text-zinc-500 mt-0.5">{clientesConSaldo.length} clientes con saldo</p>
          </div>
        </div>

        {/* Card 3: Deuda vencida */}
        <div className="bg-white border border-zinc-200/90 rounded-xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xs font-medium text-zinc-500">Deuda vencida</p>
            <p className="text-xl font-bold tracking-tight text-rose-600 mt-0.5">
              {formatCurrency(deudaVencida)}
            </p>
            <p className="text-2xs text-rose-600 font-medium mt-0.5">
              {clientesEnMora.length} {clientesEnMora.length === 1 ? "cliente en mora" : "clientes en mora"}
            </p>
          </div>
        </div>

        {/* Card 4: Conciliados hoy */}
        <div className="bg-white border border-zinc-200/90 rounded-xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xs font-medium text-zinc-500">Conciliados hoy</p>
            <p className="text-xl font-bold tracking-tight text-emerald-600 mt-0.5">
              {formatCurrency(montoConciliadoHoy)}
            </p>
            <p className="text-2xs text-zinc-500 mt-0.5">
              {conciliadosHoy.length} {conciliadosHoy.length === 1 ? "pago conciliado" : "pagos conciliados"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "conciliacion" && <ConciliacionPagosTable />}

        {activeTab === "cuentas-cobrar" && (
          <CuentasPorCobrarTable initialData={CUENTAS_POR_COBRAR_MOCK} />
        )}

        {activeTab === "lineas-credito" && <LineasCreditoTable />}
      </div>
    </div>
  );
};
