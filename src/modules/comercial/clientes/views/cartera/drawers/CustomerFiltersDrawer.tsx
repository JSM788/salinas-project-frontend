"use client";

import { useState } from "react";
import { SideDrawer } from "@/shared/components/ui/side-drawer";
import { Button } from "@/shared/components/ui/button";
import { Select } from "@/shared/components/ui/select";
import { CustomerAssignee } from "@/shared/api/customer-management";
import { CustomerFilters } from "../../../lib/customer-filters";
import { CustomerRoleCapabilities } from "../../../lib/customer-role-capabilities";

interface CustomerFiltersDrawerProps {
  filters: CustomerFilters;
  assignees: CustomerAssignee[];
  capabilities: CustomerRoleCapabilities;
  financialData: boolean;
  purchaseData: boolean;
  onApply: (filters: CustomerFilters) => void;
  onClose: () => void;
}

export function CustomerFiltersDrawer({
  filters,
  assignees,
  capabilities,
  financialData,
  purchaseData,
  onApply,
  onClose,
}: CustomerFiltersDrawerProps) {
  const [draft, setDraft] = useState(filters);

  return (
    <SideDrawer
      isOpen
      onClose={onClose}
      title="Más filtros"
      footer={
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            Aplicar filtros
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              onApply({
                ...draft,
                assigneeId: "",
                condition: "",
                lastPurchase: "",
              });
              onClose();
            }}
          >
            Limpiar
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {capabilities.canFilterByAssignee && (
          <Select
            aria-label="Responsable en más filtros"
            label="Responsable"
            value={draft.assigneeId}
            onChange={(event) =>
              setDraft((previous) => ({
                ...previous,
                assigneeId: event.target.value,
              }))
            }
            options={[
              { value: "", label: "Todos los responsables" },
              ...assignees.map((member) => ({
                value: member.id,
                label: `${member.displayName?.trim() || "Usuario sin nombre registrado"} · ${member.role === "commercial" ? "Comercial" : "Mercaderista"}`,
              })),
            ]}
          />
        )}

        {capabilities.canSeeFinancials && (
          <>
            <Select
              aria-label="Estado de deuda"
              label="Estado"
              disabled={!financialData}
              value={draft.condition}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  condition: event.target.value,
                }))
              }
              options={[
                { value: "", label: "Todos los estados" },
                { value: "Al día", label: "Al día" },
                { value: "Con atraso", label: "Con atraso" },
              ]}
            />
            {!financialData && (
              <p className="text-xs text-zinc-500">
                Estado de deuda: no hay información financiera conectada.
              </p>
            )}
          </>
        )}

        <Select
          aria-label="Última compra"
          label="Última compra"
          disabled={!purchaseData}
          value={draft.lastPurchase}
          onChange={(event) =>
            setDraft((previous) => ({
              ...previous,
              lastPurchase: event.target.value,
            }))
          }
          options={[
            { value: "", label: "Cualquier fecha" },
            { value: "7_days", label: "Últimos 7 días" },
            { value: "30_days", label: "Últimos 30 días" },
            { value: "90_days", label: "Más de 3 meses" },
          ]}
        />
        {!purchaseData && (
          <p className="text-xs text-zinc-500">
            Última compra: no hay información de ventas conectada.
          </p>
        )}
      </div>
    </SideDrawer>
  );
}

