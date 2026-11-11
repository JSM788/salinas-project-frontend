"use client";

import React, { useState } from "react";
import { Link2, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { BrangoPendingLink } from "../models/brango-order.model";
import { DeliveryStatusBadge } from "./DeliveryStatusBadge";

interface PendingLinksTabProps {
  pendingLinks: BrangoPendingLink[];
  onLinkOrder: (linkId: string, selectedCustomer: string) => void;
}

export const PendingLinksTab: React.FC<PendingLinksTabProps> = ({
  pendingLinks,
  onLinkOrder,
}) => {
  const [selectedCustomers, setSelectedCustomers] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        pendingLinks.map((item) => [item.id, item.suggestedCustomers[0] ?? ""])
      )
  );

  if (pendingLinks.length === 0) {
    return (
      <div className="bg-white border border-zinc-200/90 rounded-xl p-10 text-center shadow-2xs">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-700">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-900">
          Sin vinculaciones pendientes
        </h3>
        <p className="text-xs text-zinc-500 mt-1">
          Todos los pedidos recibidos desde Brango se encuentran asociados a un cliente de la cartera.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-200/90 rounded-xl p-4 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-zinc-100">
        <div>
          <h2 className="text-sm font-bold text-zinc-900">
            Pedidos de Brango por vincular
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Asocia manualmente pedidos externos cuyo cliente o código no coincidió de forma automática.
          </p>
        </div>
        <span className="text-2xs text-zinc-500 font-medium">
          {pendingLinks.length} pendiente{pendingLinks.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Pedido Brango</th>
              <th className="px-4 py-2.5 font-semibold">Reportado en Brango</th>
              <th className="px-4 py-2.5 font-semibold">Estado</th>
              <th className="px-4 py-2.5 font-semibold">Motivo</th>
              <th className="px-4 py-2.5 font-semibold">Vincular a cliente</th>
              <th className="px-4 py-2.5 font-semibold text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white">
            {pendingLinks.map((item) => {
              const chosenCustomer =
                selectedCustomers[item.id] ?? item.suggestedCustomers[0] ?? "";

              return (
                <tr key={item.id} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="px-4 py-3 font-semibold text-zinc-900 whitespace-nowrap">
                    <div>{item.code}</div>
                    <div className="text-2xs font-normal text-zinc-400">
                      {item.dateLabel} · {item.receivedAt}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900">
                      {item.reportedCustomer}
                    </div>
                    <div className="text-2xs text-zinc-500">
                      Comercial: {item.reportedCommercial}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <DeliveryStatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-zinc-600 max-w-xs">
                    {item.reason}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={chosenCustomer}
                      onChange={(e) =>
                        setSelectedCustomers((prev) => ({
                          ...prev,
                          [item.id]: e.target.value,
                        }))
                      }
                      className="h-8 rounded-md border border-zinc-200 bg-white px-2.5 text-xs text-zinc-800 focus:border-zinc-900 focus:outline-none"
                    >
                      {item.suggestedCustomers.map((customer) => (
                        <option key={customer} value={customer}>
                          {customer}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onLinkOrder(item.id, chosenCustomer)}
                      className="gap-1.5 text-xs"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      <span>Vincular</span>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

