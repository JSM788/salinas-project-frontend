"use client";
import Link from "next/link";
import { APP_ROUTES } from "@/config/routes";
import { useRef, useState } from "react";
import { Pencil, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { DataTable, type Column } from "@/shared/patterns/DataTable";
import { FilterBar } from "@/shared/patterns/FilterBar";
import { StatusSwitch } from "@/shared/components/ui/status-switch";
import { Select } from "@/shared/components/ui/select";
import { useAuth } from "@/shared/lib/auth-context";
import { companiesSchema } from "@/shared/api/platform";
import { Page, queryPath } from "@/shared/api/pagination";
import type { PlatformCompany } from "@/shared/api/platform";
import { companySchema } from "@/shared/api/platform";
import { apiRequest, errorText } from "@/shared/api/client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { runIdempotentCommand } from "@/shared/api/idempotent-command";
import { useQueryClient } from "@tanstack/react-query";
import { CompanyForm } from "./CompanyForm";
import { EditCompanyForm } from "./EditCompanyForm";
import { useResource } from "./use-resource";
import { Workspace, ResourceStatus } from "./Workspace";

export function CompaniesView() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const pending = useRef(new Map<string, string>());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<PlatformCompany | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const path = queryPath(API_ENDPOINTS.PLATFORM.COMPANIES, { page, search, status });
  const companies = useResource(path, companiesSchema);
  const changeStatus = async (
    company: PlatformCompany,
  ) => {
    const next = company.status === "active" ? "suspended" : "active";
    if (
      next === "suspended" &&
      !window.confirm(
        `¿Suspender ${company.name}? Sus usuarios perderán acceso hasta que reactives la empresa.`,
      )
    )
      return;
    setBusyId(company.id);
    try {
      const updated = await runIdempotentCommand(
        pending.current,
        JSON.stringify({ companyId: company.id, status: next }),
        (key) =>
          apiRequest(
            `/platform/companies/${company.id}/status`,
            companySchema,
            { body: { status: next }, key },
          ),
      );
      queryClient.setQueryData(
        ["api", path],
        (current: Page<PlatformCompany> | undefined) => current && ({...current, items: current.items.map((item) => item.id === updated.id ? updated : item)}),
      );
      void queryClient.invalidateQueries({queryKey:["directory", "/platform/companies"]});
      toast.success(
        next === "suspended"
          ? "Empresa suspendida. Sus usuarios ya no pueden ingresar."
          : "Empresa reactivada. Se conservaron los estados individuales de sus usuarios.",
      );
    } catch (cause) {
      toast.error(errorText(cause));
    } finally {
      setBusyId(null);
    }
  };
  const visible = companies.data?.items ?? [];
  const columns: Column<PlatformCompany>[] = [
    {
      header: "Empresa",
      cell: (c) => (
        <div>
          <p className="font-medium">{c.name}</p>
          <p className="text-2xs text-zinc-400">{c.slug}</p>
        </div>
      ),
    },
    {
      header: "Correo",
      cell: (c) => c.managerEmail ?? "Sin gerente registrado",
    },
    { header: "Zona horaria", accessorKey: "timeZone" },
    {
      header: "Usuarios activos / Total",
      cell: (c) => `${c.activeUserCount} / ${c.totalUserCount}`,
    },
    {
      header: "Acción",
      width: "10%",
      cell: (c) => (
        <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100"
          onClick={() => setEditing(c)}
          aria-label={`Editar ${c.name}`}
          title="Editar empresa"
        >
          <Pencil aria-hidden="true" className="h-4 w-4" />
        </button>
        <Link
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100"
          href={`${APP_ROUTES.ADMIN.USERS}/?companyId=${c.id}`}
          aria-label={`Ver usuarios de ${c.name}`}
          title="Ver usuarios"
        >
          <UsersRound aria-hidden="true" className="h-4 w-4" />
        </Link>
          <StatusSwitch
            checked={c.status === "active"}
            disabled={busyId !== null}
            label={`${c.status === "active" ? "Suspender" : "Reactivar"} ${c.name}`}
            title={c.status === "active" ? "Activa. Suspender empresa" : "Suspendida. Reactivar empresa"}
            onChange={() => void changeStatus(c)}
          />
        </div>
      ),
    },
  ];
  return (
    <Workspace
      title="Empresas"
      subtitle="Administra las empresas de la plataforma y sus usuarios"
      actions={<Button onClick={() => setCreating(true)}>Nueva empresa</Button>}
    >
      <FilterBar
        searchValue={search}
        onSearchChange={(value) => {setSearch(value);setPage(1);}}
        searchPlaceholder="Buscar por empresa o correo"
      >
        <div className="w-full sm:w-44">
          <Select
            aria-label="Filtrar empresas por estado"
            value={status}
            onChange={(event) => {setStatus(event.target.value);setPage(1);}}
            options={[
              { value: "", label: "Todos los estados" },
              { value: "active", label: "Activas" },
              { value: "suspended", label: "Suspendidas" },
            ]}
          />
        </div>
      </FilterBar>
      <ResourceStatus loading={companies.loading} error={companies.error} />
      <DataTable
        columns={columns}
        data={visible}
        keyExtractor={(row) => row.id}
        entityName="empresas"
        totalCount={companies.data?.total ?? 0}
        currentPage={page}
        pageSize={25}
        onPageChange={setPage}
        emptyMessage={
          companies.loading
            ? "Cargando empresas…"
            : "No hay empresas que coincidan con los filtros."
        }
      />
      <p className="text-xs text-zinc-500">
        Los usuarios se crean desde Usuarios, separados de los clientes que
        reciben visitas.
      </p>
      {creating && session && (
        <CompanyForm
          close={() => setCreating(false)}
          saved={(company) => {
            setCreating(false);
            toast.success(
              `Empresa ${company.name} creada. Se preparó la invitación de su gerente.`,
            );
            setPage(1);
            void queryClient.invalidateQueries({queryKey:["api"]});
            void queryClient.invalidateQueries({queryKey:["directory"]});
          }}
        />
      )}
      {editing && (
        <EditCompanyForm
          company={editing}
          close={() => setEditing(null)}
          saved={(company) => {
            setEditing(null);
            toast.success(`Empresa ${company.name} actualizada.`);
            void queryClient.invalidateQueries({queryKey:["api"]});
            void queryClient.invalidateQueries({queryKey:["directory"]});
          }}
        />
      )}
    </Workspace>
  );
}
