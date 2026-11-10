"use client";
import { Button } from "@/shared/components/ui/button";
import { useRef, useState } from "react";
import { Mail, History, Pencil } from "lucide-react";
import { TeamMemberForm } from './TeamMemberForm';
import { AccessHistoryDrawer } from "@/shared/patterns/AccessHistoryDrawer";
import { accessActionLabel } from "@/shared/api/access-history";
import { useAuth } from "@/shared/lib/auth-context";
import { toast } from "sonner";
import { confirmAccessEmail } from "@/shared/lib/confirm-access-email";
import { Select } from "@/shared/components/ui/select";
import { DataTable, type Column } from "@/shared/patterns/DataTable";
import { FilterBar } from "@/shared/patterns/FilterBar";
import { teamMembersSchema, type TeamMember } from "@/shared/api/platform";
import { queryPath } from "@/shared/api/pagination";
import { apiRequest, errorText } from "@/shared/api/client";
import { runIdempotentCommand } from "@/shared/api/idempotent-command";
import { resentInvitationSchema } from "@/shared/api/invitations";
import { roleLabels } from "@/shared/api/contracts";
import { useResource } from "@/modules/platform/use-resource";
import {
  Workspace,
  ResourceStatus,
  tableClass,
  cellClass,
} from "@/modules/platform/Workspace";

export function TeamView() {
  const {session}=useAuth();
  const [historyMember,setHistoryMember]=useState<TeamMember>();
  const [editingMember,setEditingMember]=useState<TeamMember>();
  const [search,setSearch]=useState("");
  const [role,setRole]=useState("");
  const [page,setPage]=useState(1);
  const [busy,setBusy]=useState(false);
  const keys=useRef(new Map<string,string>());
  const team=useResource(queryPath("/team/members",{page,search,role}),teamMembersSchema);
  const resend=async(member:TeamMember)=>{
    if(busy || !confirmAccessEmail(member.email,member.invitationStatus))return;
    setBusy(true);
    try {await runIdempotentCommand(keys.current,member.id,key=>apiRequest(`/team/members/${member.id}/invitation`,resentInvitationSchema,{body:{},key}));toast.success(member.invitationStatus==="accepted"?"Enlace de recuperación preparado para enviar.":"Invitación preparada para enviar.");await team.refresh();}
    catch(cause){toast.error(errorText(cause));}finally{setBusy(false);}
  };
  const columns:Column<TeamMember>[]=[
    {header:"Usuario",cell:member=>member.displayName??"Sin nombre registrado"},
    {header:"Correo",accessorKey:"email"},
    {header:"Teléfono",cell:member=>member.phone ?? "Sin teléfono registrado"},
    {header:"Rol",cell:member=>roleLabels[member.role]},
    {header:"Estado",cell:member=>member.active?"Activo":"Inactivo"},
    {header:"Invitación",cell:member=>member.invitationStatus==="accepted"?"Aceptada":member.invitationStatus==="expired"?"Vencida":member.deliveryStatus==="sent"?"Enviada":"Pendiente de envío"},
    {header:"Acción",cell:member=><div className="flex items-center gap-2"><button type="button" title={accessActionLabel(member.invitationStatus)} aria-label={`${accessActionLabel(member.invitationStatus)} a ${member.email}`} disabled={busy || !member.active} onClick={()=>void resend(member)} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-100 disabled:opacity-40"><Mail className="h-4 w-4" /></button><button type="button" title="Historial de acceso" aria-label={`Ver historial de acceso de ${member.email}`} onClick={()=>setHistoryMember(member)} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-100"><History className="h-4 w-4" /></button><button type="button" title="Editar usuario" aria-label={`Editar usuario ${member.displayName ?? member.email}`} disabled={busy} onClick={()=>setEditingMember(member)} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-100 disabled:opacity-40"><Pencil className="h-4 w-4" /></button></div>},
  ];
  return (
    <Workspace
      title="Equipo"
      subtitle="Consulta los usuarios y roles de tu empresa"
    >
      <FilterBar searchValue={search} onSearchChange={value=>{setSearch(value);setPage(1);}} searchPlaceholder="Buscar por nombre o correo"><div className="w-full sm:w-44"><Select aria-label="Filtrar equipo por rol" value={role} onChange={event=>{setRole(event.target.value);setPage(1);}} options={[{value:"",label:"Todos los roles"},{value:"commercial",label:"Comercial"},{value:"merchandiser",label:"Mercaderista"},{value:"manager",label:"Gerencia"}]} /></div></FilterBar>
      <ResourceStatus loading={team.loading} error={team.error} />
      <DataTable columns={columns} data={team.data?.items??[]} keyExtractor={member=>member.id} totalCount={team.data?.total??0} currentPage={page} pageSize={25} onPageChange={setPage} entityName="usuarios" />
      {historyMember && session?.timeZone && <AccessHistoryDrawer key={historyMember.id} path={`/team/members/${historyMember.id}/access-history`} email={historyMember.email} timeZone={session.timeZone} onClose={()=>setHistoryMember(undefined)} />}
      {editingMember && <TeamMemberForm key={editingMember.id} member={editingMember} close={()=>setEditingMember(undefined)} saved={()=>{setEditingMember(undefined);void team.refresh();}} />}
      <p className="text-xs text-zinc-500">
        El propietario de la plataforma crea y habilita los usuarios. Cada
        usuario establece su propia contraseña mediante el enlace enviado.
      </p>
    </Workspace>
  );
}
