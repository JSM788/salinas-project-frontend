"use client";

import { Briefcase, Package, UserCheck } from "lucide-react";
import { DataTable, Column } from "@/shared/patterns/DataTable";
import { FilterBar } from "@/shared/patterns/FilterBar";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { CustomerAssignee, ManagedCustomer } from "@/shared/api/customer-management";
import { CustomerFilters } from "../../lib/customer-filters";

interface AsignacionesTabProps {
  customers: ManagedCustomer[];
  assignees: CustomerAssignee[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  error: string;
  filters: CustomerFilters;
  selectedIds: string[];
  onChangeFilter: (key: keyof CustomerFilters, value: string) => void;
  onToggleSelected: (id: string) => void;
  onSelectPage: () => void;
  onOpenAssign: (customerIds: string[]) => void;
  onSelectCustomerDetail: (customer: ManagedCustomer) => void;
  onPageChange: (nextPage: number) => void;
}

const MISSING = "Sin información";

export function AsignacionesTab({
  customers,
  assignees,
  totalCount,
  currentPage,
  pageSize,
  loading,
  error,
  filters,
  selectedIds,
  onChangeFilter,
  onToggleSelected,
  onSelectPage,
  onOpenAssign,
  onSelectCustomerDetail,
  onPageChange,
}: AsignacionesTabProps) {
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
      header: "Responsables",
      cell: (customer) => {
        const comm = customer.assignments.find((a) => a.role === "commercial");
        const merch = customer.assignments.find((a) => a.role === "merchandiser");

        if (!comm && !merch) {
          return <span className="font-medium text-amber-700">Sin asignar</span>;
        }

        return (
          <div className="flex flex-col gap-1">
            {comm && (
              <div
                className="flex items-center gap-1.5 text-zinc-900 group cursor-default"
                title={`Comercial: ${comm.displayName?.trim() || comm.email}`}
              >
                <Briefcase className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span className="truncate max-w-[150px]">
                  {comm.displayName?.trim() || comm.email}
                </span>
              </div>
            )}
            {merch && (
              <div
                className="flex items-center gap-1.5 text-zinc-900 group cursor-default"
                title={`Mercaderista: ${merch.displayName?.trim() || merch.email}`}
              >
                <Package className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span className="truncate max-w-[150px]">
                  {merch.displayName?.trim() || merch.email}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Zona",
      cell: (customer) => customer.zone || MISSING,
    },
    {
      header: "Acción",
      className: "text-right",
      width: "12%",
      cell: (customer) => (
        <Button size="sm" variant="secondary" onClick={() => onOpenAssign([customer.id])}>
          <UserCheck className="mr-1 h-3.5 w-3.5" />
          Asignar
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
        hasMoreFilters={false}
      >
        <div className="w-56">
          <Select
            aria-label="Filtrar por responsable"
            value={filters.assigneeId}
            onChange={(event) => onChangeFilter("assigneeId", event.target.value)}
            options={[
              { value: "", label: "Responsable: Todos" },
              ...assignees.map((member) => ({
                value: member.id,
                label: `Responsable: ${member.displayName?.trim() || "Usuario sin nombre registrado"}`,
              })),
            ]}
          />
        </div>
        <div className="w-44">
          <Input
            aria-label="Filtrar por distrito"
            placeholder="Distrito"
            value={filters.district}
            onChange={(event) => onChangeFilter("district", event.target.value)}
          />
        </div>
        <div className="w-40">
          <Input
            aria-label="Filtrar por zona"
            placeholder="Zona"
            value={filters.zone}
            onChange={(event) => onChangeFilter("zone", event.target.value)}
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
          selectable
          selectedIds={selectedIds}
          onSelectRow={onToggleSelected}
          onSelectAll={onSelectPage}
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={onPageChange}
          entityName="clientes"
        />
      )}

      {selectedIds.length > 0 && !loading && !error && (
        <div className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-6 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-xl">
          <span className="whitespace-nowrap text-xs font-semibold">
            {selectedIds.length}{" "}
            {selectedIds.length === 1 ? "cliente seleccionado" : "clientes seleccionados"}
          </span>
          <Button size="sm" onClick={() => onOpenAssign(selectedIds)}>
            Asignar responsable
          </Button>
        </div>
      )}
    </div>
  );
}
