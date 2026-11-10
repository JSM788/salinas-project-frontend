"use client";

import Link from "next/link";
import { SideDrawer } from "@/shared/components/ui/side-drawer";
import { Button } from "@/shared/components/ui/button";
import { ManagedCustomer } from "@/shared/api/customer-management";
import { CustomerRoleCapabilities } from "../../../lib/customer-role-capabilities";

interface CustomerDetailDrawerProps {
  customer: ManagedCustomer | null;
  capabilities: CustomerRoleCapabilities;
  sessionEmail?: string;
  onClose: () => void;
}

const MISSING = "Sin información";

function commercialNames(customer: ManagedCustomer) {
  return (
    customer.assignments
      .filter((assignment) => assignment.role === "commercial")
      .map((assignment) => assignment.displayName?.trim() || "Usuario sin nombre registrado")
      .join(", ") || "Sin asignar"
  );
}

function merchandiserNames(customer: ManagedCustomer) {
  return (
    customer.assignments
      .filter((assignment) => assignment.role === "merchandiser")
      .map((assignment) => assignment.displayName?.trim() || "Usuario sin nombre registrado")
      .join(", ") || "Sin asignar"
  );
}

export function CustomerDetailDrawer({
  customer,
  capabilities,
  sessionEmail,
  onClose,
}: CustomerDetailDrawerProps) {
  const fields: [string, string | null | undefined][] = customer
    ? [
        ["Cliente", customer.name],
        ["RUC", customer.ruc],
        ["Dirección", customer.address],
        ["Distrito", customer.district],
        ["Zona", customer.zone],
        ...(capabilities.canSeeFinancials && customer.condition
          ? ([["Condición", customer.condition]] as [string, string][])
          : []),
        [
          "Comercial",
          capabilities.canViewAllCompanyCustomers
            ? commercialNames(customer)
            : sessionEmail,
        ],
        ...(capabilities.canViewAllCompanyCustomers || capabilities.role === "merchandiser"
          ? ([["Mercaderista", merchandiserNames(customer)]] as [string, string][])
          : []),
      ]
    : [];

  return (
    <SideDrawer
      isOpen={Boolean(customer)}
      onClose={onClose}
      title="Consulta del cliente"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          <Link href="/commercial/field-operations/">
            <Button>Ver agenda</Button>
          </Link>
        </div>
      }
    >
      {customer && (
        <dl className="space-y-4 text-sm">
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt className="text-zinc-500">{label}</dt>
              <dd className="font-medium">{value || MISSING}</dd>
            </div>
          ))}
        </dl>
      )}
    </SideDrawer>
  );
}

