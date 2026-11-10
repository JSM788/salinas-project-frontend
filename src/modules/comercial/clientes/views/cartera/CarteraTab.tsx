"use client";

import { DataTable, Column } from "@/shared/patterns/DataTable";
import { FilterBar } from "@/shared/patterns/FilterBar";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { ManagedCustomer } from "@/shared/api/customer-management";
import { CustomerFilters } from "../../lib/customer-filters";
import { CustomerRoleCapabilities } from "../../lib/customer-role-capabilities";

interface CarteraTabProps {
  customers: ManagedCustomer[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  error: string;
  filters: CustomerFilters;
  capabilities: CustomerRoleCapabilities;
  sessionEmail?: string;
  onChangeFilter: (key: keyof CustomerFilters, value: string) => void;
  onOpenMoreFilters: () => void;
  onSelectCustomerDetail: (customer: ManagedCustomer) => void;
  onPageChange: (nextPage: number) => void;
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

export function CarteraTab({
  customers,
  totalCount,
  currentPage,
  pageSize,
  loading,
  error,
  filters,
  capabilities,
  sessionEmail,
  onChangeFilter,
  onOpenMoreFilters,
  onSelectCustomerDetail,
  onPageChange,
}: CarteraTabProps) {
  const columns: Column<ManagedCustomer>[] = [
    {
      header: "Cliente",
      width: "30%",
      cell: (customer) => (
        <div>
          <button
            onClick={() => onSelectCustomerDetail(customer)}
            className="block text-left font-semibold text-zinc-900 hover:underline"
          >
            {customer.name}
          </button>
          <span className="text-2xs text-zinc-400">
            {customer.ruc ? `RUC ${customer.ruc}` : "RUC sin registrar"}
          </span>
        </div>
      ),
    },
    {
      header: "Distrito",
      width: "22%",
      cell: (customer) => <span className="font-medium">{customer.district || MISSING}</span>,
    },
    {
      header: capabilities.role === "merchandiser" ? "Dirección" : "Vendedor",
      cell: (customer) =>
        capabilities.role === "merchandiser"
          ? customer.address || MISSING
          : capabilities.canViewAllCompanyCustomers
            ? commercialNames(customer)
            : sessionEmail,
    },
    ...(capabilities.canSeeFinancials
      ? ([
          {
            header: "Condición",
            cell: (customer: ManagedCustomer) => (
              <span className="text-zinc-500">{customer.condition ?? MISSING}</span>
            ),
          },
        ] as Column<ManagedCustomer>[])
      : []),
    {
      header: "Acción",
      className: "text-right",
      width: "12%",
      cell: (customer) => (
        <Button size="sm" variant="secondary" onClick={() => onSelectCustomerDetail(customer)}>
          Consultar
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <FilterBar
        searchValue={filters.search}
        onSearchChange={(value) => onChangeFilter("search", value)}
        searchPlaceholder="Buscar clientes por nombre o RUC..."
        hasMoreFilters
        onToggleMoreFilters={onOpenMoreFilters}
      >
        <div className="w-44">
          <Input
            aria-label="Filtrar por distrito"
            placeholder="Distrito"
            value={filters.district}
            onChange={(event) => onChangeFilter("district", event.target.value)}
          />
        </div>
      </FilterBar>

      {error && (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-12 text-center text-sm text-zinc-500">Cargando cartera…</p>
      ) : (
        <DataTable
          data={customers}
          columns={columns}
          keyExtractor={(customer) => customer.id}
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={onPageChange}
          entityName="clientes"
        />
      )}
    </div>
  );
}
