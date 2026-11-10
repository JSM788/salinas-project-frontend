"use client";
import { useState } from "react";
import { SideDrawer } from "@/shared/components/ui/side-drawer";
import { DataTable, type Column } from "./DataTable";
import { accessHistorySchema, accessEventLabel, accessOutcomeLabel, type AccessEvent } from "@/shared/api/access-history";
import { queryPath } from "@/shared/api/pagination";
import { useResource } from "@/modules/platform/use-resource";
import { ResourceStatus } from "@/modules/platform/Workspace";

export function AccessHistoryDrawer({path,email,timeZone,onClose}:{path:string;email:string;timeZone:string;onClose:()=>void}) {
  const [page,setPage]=useState(1);
  const history=useResource(queryPath(path,{page,pageSize:25}),accessHistorySchema);
  const formatter=new Intl.DateTimeFormat("es-PE",{dateStyle:"medium",timeStyle:"medium",timeZone});
  const columns:Column<AccessEvent>[]=[
    {header:"Fecha y hora",cell:event=><span className="whitespace-nowrap">{formatter.format(new Date(event.occurredAt))}</span>},
    {header:"Actividad",cell:event=><div><p>{accessEventLabel(event.event,event.details?.purpose)}</p>{typeof event.details?.expiresAt === "string" && Number.isFinite(Date.parse(event.details.expiresAt)) && <p className="mt-1 text-2xs text-zinc-500">Vence: {formatter.format(new Date(event.details.expiresAt))}</p>}</div>},
    {header:"Resultado",cell:event=>accessOutcomeLabel(event.outcome)},
  ];
  return <SideDrawer isOpen onClose={onClose} title="Historial de acceso" subtitle={email} width="max-w-3xl">
    <p className="text-xs text-zinc-500">Fechas y horas de la empresa ({timeZone}). «Enviado» no confirma que el destinatario haya recibido o leído el correo.</p>
    <ResourceStatus loading={history.loading} error={history.error} />
    <DataTable columns={columns} data={history.data?.items??[]} keyExtractor={event=>event.id} totalCount={history.data?.total??0} currentPage={page} pageSize={25} onPageChange={setPage} entityName="eventos" emptyMessage="No hay eventos de acceso registrados para este usuario." />
  </SideDrawer>;
}
