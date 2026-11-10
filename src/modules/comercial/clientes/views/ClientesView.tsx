"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Upload } from "lucide-react";
import { DashboardShell } from "@/shared/layout/DashboardShell";
import { PageHeader } from "@/shared/patterns/PageHeader";
import { Button } from "@/shared/components/ui/button";
import { Tabs } from "@/shared/components/ui/tabs";
import { useAuth } from "@/shared/lib/auth-context";
import { customerSchema, fieldRoutes } from "@/shared/api/contracts";
import {
  customerAssigneeSchema,
  managedCustomerSchema,
  CustomerAssignee,
  ManagedCustomer,
} from "@/shared/api/customer-management";
import { pageSchema, queryPath } from "@/shared/api/pagination";
import { useResource, useDirectory } from "@/modules/platform/use-resource";
import { emptyCustomerFilters, CustomerFilters } from "../lib/customer-filters";
import { getCustomerRoleCapabilities } from "../lib/customer-role-capabilities";
import { CarteraTab } from "./cartera/CarteraTab";
import { NewCustomerDrawer } from "./cartera/drawers/NewCustomerDrawer";
import { CustomerFiltersDrawer } from "./cartera/drawers/CustomerFiltersDrawer";
import { CustomerDetailDrawer } from "./cartera/drawers/CustomerDetailDrawer";
import { ImportCustomersModal } from "./cartera/drawers/ImportCustomersModal";
import { AsignacionesTab } from "./asignaciones/AsignacionesTab";
import { AssignCustomerDrawer } from "./asignaciones/drawers/AssignCustomerDrawer";

const PAGE_SIZE = 25;
const managedPageSchema = pageSchema(managedCustomerSchema);
const personalPageSchema = pageSchema(customerSchema).transform((result) => ({
  ...result,
  items: result.items.map((customer) => ({
    ...customer,
    ruc: null,
    district: null,
    zone: null,
    condition: null,
    lastPurchaseDate: null,
    assignments: [],
  })),
}));

const FALLBACK_CUSTOMERS: ManagedCustomer[] = [
  {
    id: "cl-001",
    name: "Pet Market San Borja",
    address: "Av. San Borja Norte 1234, San Borja, Lima",
    ruc: "20123456789",
    district: "San Borja",
    zone: "Lima Centro",
    condition: "Al día",
    lastPurchaseDate: "2026-10-16",
    assignments: [
      {
        membershipId: "mem-01",
        email: "ana.torres@empresa.com",
        displayName: "Ana Torres",
        role: "commercial",
      },
      {
        membershipId: "mem-05",
        email: "marcos.vega@empresa.com",
        displayName: "Marcos Vega",
        role: "merchandiser",
      },
    ],
  },
  {
    id: "cl-002",
    name: "Veterinaria Huellitas",
    address: "Av. Larco 890, Miraflores, Lima",
    ruc: "20456789012",
    district: "Miraflores",
    zone: "Lima Centro",
    condition: "Con atraso",
    lastPurchaseDate: "2026-10-14",
    assignments: [
      {
        membershipId: "mem-02",
        email: "carlos.rojas@empresa.com",
        displayName: "Carlos Rojas",
        role: "commercial",
      },
    ],
  },
  {
    id: "cl-003",
    name: "Mundo Animal Surco",
    address: "Av. Primavera 1420, Surco, Lima",
    ruc: "20567890123",
    district: "Santiago de Surco",
    zone: "Lima Sur",
    condition: "Al día",
    lastPurchaseDate: "2026-10-15",
    assignments: [
      {
        membershipId: "mem-06",
        email: "elena.gomez@empresa.com",
        displayName: "Elena Gómez",
        role: "merchandiser",
      },
    ],
  },
  {
    id: "cl-004",
    name: "Mascotas y Más",
    address: "Av. Benavides 3890, Santiago de Surco, Lima",
    ruc: "20601234567",
    district: "Santiago de Surco",
    zone: "Lima Sur",
    condition: "Al día",
    lastPurchaseDate: "2026-10-13",
    assignments: [
      {
        membershipId: "mem-04",
        email: "carlos.diaz@empresa.com",
        displayName: "Carlos Díaz",
        role: "commercial",
      },
      {
        membershipId: "mem-05",
        email: "marcos.vega@empresa.com",
        displayName: "Marcos Vega",
        role: "merchandiser",
      },
    ],
  },
  {
    id: "cl-005",
    name: "Clínica Vet. San Miguel (Recién importado)",
    address: "Av. La Marina 2100, San Miguel, Lima",
    ruc: "20609876543",
    district: "San Miguel",
    zone: "Lima Oeste",
    condition: "Al día",
    lastPurchaseDate: "2026-10-15",
    assignments: [],
  },
  {
    id: "cl-006",
    name: "Agrovet Callao (Recién importado)",
    address: "Av. Sáenz Peña 450, Callao",
    ruc: "20551234567",
    district: "Callao",
    zone: "Callao",
    condition: "Con atraso",
    lastPurchaseDate: "2026-10-12",
    assignments: [],
  },
];

const FALLBACK_ASSIGNEES: CustomerAssignee[] = [
  { id: "mem-01", displayName: "Ana Torres", email: "ana.torres@empresa.com", role: "commercial" },
  { id: "mem-02", displayName: "Carlos Rojas", email: "carlos.rojas@empresa.com", role: "commercial" },
  { id: "mem-03", displayName: "Lucía Mendoza", email: "lucia.mendoza@empresa.com", role: "commercial" },
  { id: "mem-04", displayName: "Carlos Díaz", email: "carlos.diaz@empresa.com", role: "commercial" },
  { id: "mem-05", displayName: "Marcos Vega", email: "marcos.vega@empresa.com", role: "merchandiser" },
  { id: "mem-06", displayName: "Elena Gómez", email: "elena.gomez@empresa.com", role: "merchandiser" },
];

export function ClientesView() {
  const { session } = useAuth();
  const capabilities = getCustomerRoleCapabilities(session);
  const canManage = capabilities.canViewAllCompanyCustomers;

  const [tab, setTab] = useState("cartera");
  const [filters, setFilters] = useState(emptyCustomerFilters);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [assignmentIds, setAssignmentIds] = useState<string[] | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [detail, setDetail] = useState<ManagedCustomer | null>(null);

  const directory = useDirectory(
    canManage ? "/customers/assignees" : undefined,
    customerAssigneeSchema,
  );
  const resource = useResource(
    queryPath(canManage ? "/customers" : fieldRoutes.customers, {
      page,
      pageSize: PAGE_SIZE,
      search: filters.search,
      ...(canManage
        ? {
            district: filters.district,
            zone: filters.zone,
            membershipId: filters.assigneeId,
          }
        : {}),
    }),
    canManage ? managedPageSchema : personalPageSchema,
  );

  const customers: ManagedCustomer[] = resource.data?.items ?? [];
  const assignees = directory.data ?? [];
  const loading = resource.loading;
  const error = "";
  const load = resource.refresh;

  useEffect(() => {
    setPage(1);
  }, [filters, tab]);

  const assignmentCustomers = customers.filter((customer) =>
    assignmentIds?.includes(customer.id),
  );

  const changeFilter = (key: keyof CustomerFilters, value: string) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
    setPage(1);
    setSelectedIds([]);
  };

  const changeTab = (nextTab: string) => {
    setTab(nextTab);
    setFilters(emptyCustomerFilters);
    setSelectedIds([]);
    setPage(1);
  };

  const toggleSelected = (id: string) =>
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((selected) => selected !== id)
        : [...previous, id],
    );

  const selectPage = () =>
    setSelectedIds((previous) =>
      customers.every((customer) => previous.includes(customer.id))
        ? previous.filter((id) => !customers.some((customer) => customer.id === id))
        : Array.from(new Set([...previous, ...customers.map((customer) => customer.id)])),
    );

  return (
    <DashboardShell connected>
      <div className="space-y-4 pb-16">
        <PageHeader
          breadcrumbs={[{ label: "Comercial" }, { label: "Clientes" }]}
          title="Clientes"
          subtitle={
            capabilities.canManageDirectory
              ? "Gestiona la cartera y sus responsables"
              : "Consulta tu cartera y programa las visitas desde Agenda"
          }
          actions={
            <div className="flex gap-2">
              {capabilities.canManageDirectory && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowImportModal(true)}
                    className="gap-1.5"
                  >
                    <Upload className="h-4 w-4 text-zinc-600" />
                    Importar Clientes (.xlsx)
                  </Button>
                  <Button onClick={() => setShowCreate(true)}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    Nuevo cliente
                  </Button>
                </>
              )}
            </div>
          }
        />

        <Tabs
          tabs={[
            { id: "cartera", label: "Cartera" },
            ...(capabilities.canAssignResponsibles
              ? [{ id: "asignaciones", label: "Asignaciones" }]
              : []),
          ]}
          activeTab={tab}
          onChange={changeTab}
        />

        {tab === "asignaciones" && capabilities.canAssignResponsibles ? (
          <AsignacionesTab
            customers={customers}
            assignees={assignees}
            totalCount={resource.data?.total ?? 0}
            currentPage={page}
            pageSize={PAGE_SIZE}
            loading={loading}
            error={error}
            filters={filters}
            selectedIds={selectedIds}
            onChangeFilter={changeFilter}
            onToggleSelected={toggleSelected}
            onSelectPage={selectPage}
            onOpenAssign={(ids) => setAssignmentIds(ids)}
            onSelectCustomerDetail={setDetail}
            onPageChange={(next) => {
              setPage(next);
              setSelectedIds([]);
            }}
          />
        ) : (
          <CarteraTab
            customers={customers}
            totalCount={resource.data?.total ?? 0}
            currentPage={page}
            pageSize={PAGE_SIZE}
            loading={loading}
            error={error}
            filters={filters}
            capabilities={capabilities}
            sessionEmail={session?.email}
            onChangeFilter={changeFilter}
            onOpenMoreFilters={() => setShowFilters(true)}
            onSelectCustomerDetail={setDetail}
            onPageChange={(next) => {
              setPage(next);
              setSelectedIds([]);
            }}
          />
        )}

        {showCreate && capabilities.canManageDirectory && (
          <NewCustomerDrawer
            assignees={assignees}
            onClose={() => setShowCreate(false)}
            onSaved={() => {
              setShowCreate(false);
              setPage(1);
              void load();
              toast.success("Cliente registrado.");
            }}
          />
        )}

        {assignmentIds && capabilities.canAssignResponsibles && (
          <AssignCustomerDrawer
            customers={assignmentCustomers}
            assignees={assignees}
            onClose={() => setAssignmentIds(null)}
            onSaved={() => {
              setAssignmentIds(null);
              setSelectedIds([]);
              toast.success("Asignación guardada.");
              void load();
            }}
          />
        )}

        {showFilters && (
          <CustomerFiltersDrawer
            filters={filters}
            assignees={assignees}
            capabilities={capabilities}
            financialData={customers.some((customer) => customer.condition !== null)}
            purchaseData={customers.some((customer) => customer.lastPurchaseDate !== null)}
            onApply={setFilters}
            onClose={() => setShowFilters(false)}
          />
        )}

        <CustomerDetailDrawer
          customer={detail}
          capabilities={capabilities}
          sessionEmail={session?.email}
          onClose={() => setDetail(null)}
        />

        {showImportModal && capabilities.canManageDirectory && (
          <ImportCustomersModal
            onClose={() => setShowImportModal(false)}
            onImported={() => {
              setPage(1);
              void load();
            }}
          />
        )}
      </div>
    </DashboardShell>
  );
}

export const CustomersWorkspace = ClientesView;

