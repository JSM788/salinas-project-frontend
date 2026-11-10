"use client";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Mail, History } from "lucide-react";
import { AccessHistoryDrawer } from "@/shared/patterns/AccessHistoryDrawer";
import { accessActionLabel } from "@/shared/api/access-history";
import { apiRequest, errorText } from "@/shared/api/client";
import {
  companiesSchema,
  companySchema,
  platformMemberSchema,
  platformMembersSchema,
  PlatformCompany,
  PlatformMember,
  initialCompanyId,
} from "@/shared/api/platform";
import { roleLabels } from "@/shared/api/contracts";
import { runIdempotentCommand } from "@/shared/api/idempotent-command";
import { useAuth } from "@/shared/lib/auth-context";
import { confirmAccessEmail } from "@/shared/lib/confirm-access-email";
import { Button } from "@/shared/components/ui/button";
import { DataTable, type Column } from "@/shared/patterns/DataTable";
import { FilterBar } from "@/shared/patterns/FilterBar";
import { StatusSwitch } from "@/shared/components/ui/status-switch";
import { Select } from "@/shared/components/ui/select";
import { MemberForm } from "./MemberForm";
import { useResource } from "./use-resource";
import { useDirectory } from "./use-resource";
import { Page, queryPath } from "@/shared/api/pagination";
import { resentInvitationSchema } from "@/shared/api/invitations";
import { Workspace, ResourceStatus } from "./Workspace";

export function MembersView() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const companies = useDirectory("/platform/companies", companySchema);
  const [companyId, setCompanyId] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false),
    [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<PlatformMember | undefined>();
  const [historyMember,setHistoryMember]=useState<PlatformMember>();
  const [error, setError] = useState("");
  const pending = useRef(new Map<string, string>());
  const company = companies.data?.find((entry) => entry.id === companyId);
  const path = company ? queryPath(`/platform/companies/${company.id}/members`, {page,search,role,active:status ? String(status === "active") : undefined}) : undefined;
  const members = useResource(
    path,
    platformMembersSchema,
  );
  const visible = members.data?.items ?? [];
  useEffect(() => {
    if (!companies.data || companyId) return;
    const requested = new URLSearchParams(window.location.search).get(
      "companyId",
    );
    const selected = initialCompanyId(
      companies.data,
      session?.companyId ?? "",
      requested,
    );
    if (selected) setCompanyId(selected);
    else if (requested)
      setError(
        "La empresa indicada no está disponible. Selecciona una empresa del listado.",
      );
  }, [companies.data, session?.companyId, companyId]);
  const changeStatus = async (member: PlatformMember) => {
    if (
      !company ||
      company.status === "suspended" ||
      busy ||
      member.isPlatformOwner
    )
      return;
    const active = !member.active;
    setBusy(true);
    setError("");
    try {
      const updated = await runIdempotentCommand(
        pending.current,
        JSON.stringify({ companyId, membershipId: member.id, active }),
        (key) =>
          apiRequest(
            `/platform/companies/${companyId}/members/${member.id}/status`,
            platformMemberSchema,
            { body: { active }, key },
          ),
      );
      toast.success(
        active
          ? "Usuario activado en esta empresa."
          : "Usuario desactivado en esta empresa. Su historial se conserva.",
      );
      queryClient.setQueryData<Page<PlatformMember>>(
        ["api", path],
        (current) =>
          current && ({...current,items:current.items.map((item) => item.id === updated.id ? updated : item)}),
      );
      queryClient.setQueryData<PlatformCompany[]>(
        ["directory", "/platform/companies"],
        (current) =>
          current?.map((item) =>
            item.id === companyId
              ? {
                  ...item,
                  activeUserCount: item.activeUserCount + (active ? 1 : -1),
                }
              : item,
          ),
      );
    } catch (cause) {
      toast.error(errorText(cause));
    } finally {
      setBusy(false);
    }
  };
  const resend = async (member:PlatformMember) => {
    if (busy || !company) return;
    if (!confirmAccessEmail(member.email, member.invitationStatus)) return;
    setBusy(true);
    try {
      await runIdempotentCommand(pending.current, `invitation:${company.id}:${member.id}`, key=>apiRequest(`/platform/companies/${company.id}/members/${member.id}/invitation`,resentInvitationSchema,{body:{},key}));
      toast.success(member.invitationStatus === "accepted" ? "Enlace de recuperación preparado para enviar." : "Invitación preparada para enviar.");
      await members.refresh();
    } catch(cause) {toast.error(errorText(cause));} finally {setBusy(false);}
  };
  const columns: Column<PlatformMember>[] = [
    {
      header: "Usuario",
      cell: (m) => (
        <div>
          <span className="font-medium">
            {m.displayName ?? "Sin nombre registrado"}
          </span>
          {m.isPlatformOwner && (
            <span className="block text-2xs text-zinc-400">
              Propietario global
            </span>
          )}
        </div>
      ),
    },
    { header: "Correo", accessorKey: "email" },
      { header: "Teléfono", cell: (member) => member.phone ?? "Sin teléfono registrado" },
    { header: "Rol", cell: (m) => roleLabels[m.role] },
    { header: "Invitación", cell: (m) => m.invitationStatus === "accepted" ? "Aceptada" : m.deliveryStatus === "failed" ? "Envío pendiente de reintento" : m.invitationStatus === "expired" ? "Vencida" : m.deliveryStatus === "sent" ? "Enviada" : "Pendiente de envío" },
    {
      header: "Estado",
      width: "12%",
      cell: (m) => (m.active ? "Activo" : "Inactivo"),
    },
    {
      header: "Acción",
      width: "12%",
      cell: (m) => (
        <div className="flex items-center gap-3">
          <button type="button" title={accessActionLabel(m.invitationStatus)} aria-label={`${accessActionLabel(m.invitationStatus)} a ${m.email}`} disabled={busy || m.isPlatformOwner || !m.active || company?.status === "suspended"} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-100 disabled:opacity-40" onClick={()=>void resend(m)}><Mail className="h-3.5 w-3.5" /></button>
          <button type="button" title="Historial de acceso" aria-label={`Ver historial de acceso de ${m.email}`} disabled={m.isPlatformOwner} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-100 disabled:opacity-40" onClick={()=>setHistoryMember(m)}><History className="h-3.5 w-3.5" /></button>
          <button
            type="button"
            title="Editar usuario"
            aria-label={`Editar a ${m.email}`}
            disabled={
              busy || m.isPlatformOwner || company?.status === "suspended"
            }
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-100 disabled:opacity-40"
            onClick={() => setEditing(m)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <StatusSwitch
            checked={m.active}
            label={
              m.active ? `Desactivar a ${m.email}` : `Activar a ${m.email}`
            }
            disabled={
              busy || m.isPlatformOwner || company?.status === "suspended"
            }
            title={
              company?.status === "suspended"
                ? "Reactiva la empresa para gestionar sus usuarios"
                : m.isPlatformOwner
                  ? "La cuenta propietaria debe permanecer activa"
                  : undefined
            }
            onChange={() => void changeStatus(m)}
          />
        </div>
      ),
    },
  ];
  return (
    <Workspace
      title="Usuarios"
      subtitle="Crea las cuentas y define su empresa y rol"
      actions={
        <Button
          disabled={!companies.data?.length || busy}
          onClick={() => setCreating(true)}
        >
          Nuevo usuario
        </Button>
      }
    >
      <FilterBar
        searchValue={search}
        onSearchChange={(value)=>{setSearch(value);setPage(1);}}
        searchPlaceholder="Buscar por nombre o correo"
      >
        <div className="w-full sm:w-56">
          <Select
            aria-label="Empresa de los usuarios"
            disabled={busy || companies.loading}
            value={companyId}
            onChange={(event) => {
              setCompanyId(event.target.value);
              setPage(1);
              setError("");
            }}
            options={[
              { value: "", label: "Selecciona una empresa" },
              ...(companies.data ?? []).map((entry) => ({
                value: entry.id,
                label: entry.name,
              })),
            ]}
          />
        </div>
        <div className="w-full sm:w-40">
          <Select
            aria-label="Filtrar usuarios por rol"
            value={role}
            onChange={(event) => {setRole(event.target.value);setPage(1);}}
            options={[
              { value: "", label: "Todos los roles" },
              { value: "commercial", label: "Comercial" },
              { value: "merchandiser", label: "Mercaderista" },
              { value: "manager", label: "Gerencia" },
            ]}
          />
        </div>
        <div className="w-full sm:w-40">
          <Select
            aria-label="Filtrar usuarios por estado"
            value={status}
            onChange={(event) => {setStatus(event.target.value);setPage(1);}}
            options={[
              { value: "", label: "Todos los estados" },
              { value: "active", label: "Activos" },
              { value: "inactive", label: "Inactivos" },
            ]}
          />
        </div>
      </FilterBar>
      {company && (
        <p className="text-sm text-zinc-500">
          {company.name}: {company.activeUserCount} usuarios activos de{" "}
          {company.totalUserCount} registrados.{" "}
          {company.status === "suspended" &&
            "La empresa está suspendida; reactívala para gestionar sus usuarios."}
        </p>
      )}
      <ResourceStatus
        loading={companies.loading || members.loading}
        error={error || companies.error || members.error}
      />
      <DataTable
        columns={columns}
        data={visible}
        keyExtractor={(row) => row.id}
        entityName="usuarios"
        totalCount={members.data?.total ?? 0}
        currentPage={page}
        pageSize={25}
        onPageChange={setPage}
        emptyMessage={
          !company
            ? "Selecciona una empresa para consultar sus usuarios. Nuevo usuario permite elegir empresa dentro del formulario."
            : members.loading
              ? "Cargando usuarios…"
              : "No hay usuarios que coincidan con los filtros."
        }
      />
      {historyMember && company && <AccessHistoryDrawer key={`${company.id}:${historyMember.id}`} path={`/platform/companies/${company.id}/members/${historyMember.id}/access-history`} email={historyMember.email} timeZone={company.timeZone} onClose={()=>setHistoryMember(undefined)} />}
      {(creating || editing) && companies.data && (
        <MemberForm
          key={editing?.id ?? "new"}
          member={editing}
          companies={companies.data}
          close={() => {
            setCreating(false);
            setEditing(undefined);
          }}
          saved={(createdCompanyId, updated) => {
            setCreating(false);
            toast.success(
              editing
                ? "Datos del usuario actualizados."
                : "Usuario creado. Se preparó su invitación.",
            );
            setEditing(undefined);
            if(createdCompanyId === companyId) setPage(1);
            void queryClient.invalidateQueries({
              queryKey: ["api"],
            });
            void companies.refresh();
          }}
        />
      )}
    </Workspace>
  );
}
