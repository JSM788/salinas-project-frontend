"use client";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Select } from "@/shared/components/ui/select";
import { Tabs } from "@/shared/components/ui/tabs";
import { SideDrawer } from "@/shared/components/ui/side-drawer";
import { PageHeader } from "@/shared/patterns/PageHeader";
import { useAuth } from "@/shared/lib/auth-context";
import { fieldRoutes, roleLabels, visitSchema } from "@/shared/api/contracts";
import { FieldMember, teamRoutes } from "@/shared/api/field-management";
import {
  AgendaSlot,
  JornadaSummary,
  RegistroVisita,
} from "../models/visita.model";
import { AgendaView } from "../components/AgendaView";
import { JornadasView } from "../components/JornadasView";
import { RegistrosView } from "../components/RegistrosView";
import { useField } from "./use-field-query";
import { companyDate, companyTime, planningForDate } from "./planning";
import { ScheduleVisitDrawer } from "./ScheduleVisitDrawer";
import { RecordDetail } from "./RecordDetail";
import { CompanyDateFilter } from "./CompanyDateFilter";
import { FilterBar } from "@/shared/patterns/FilterBar";
import { Pagination } from "@/shared/patterns/Pagination";
import { Visit } from "@/shared/api/contracts";
import { Input } from "@/shared/components/ui/input";
import { scheduledInstant } from "./planning";
import { toast } from "sonner";
import { z } from "zod";
import { useFormErrors } from "@/shared/lib/use-form-errors";
import { FieldError } from "@/shared/components/ui/field-error";

const outcomes = {
  attended: "Atendida",
  closed: "Local cerrado",
  unavailable: "No atendida",
} as const;
export function ConnectedFieldView() {
  const { session } = useAuth();
  const canManage =
    session?.permissions?.includes("manage_field_operations") === true;
  const [roleFilter, setRoleFilter] = useState<FieldMember["role"] | "">("");
  const [memberFilter, setMemberFilter] = useState("");
  const [search,setSearch]=useState("");
  const [page,setPage]=useState(1);
  const [tab,setTab]=useState("agenda");
  const [selectedDay,setSelectedDay]=useState<string|null>(null);
  const date=selectedDay ?? companyDate(new Date(),session?.scope==="tenant"?session.timeZone:"UTC");
  const [editingVisit,setEditingVisit]=useState<Visit>();
  const [editDate,setEditDate]=useState("");
  const [editTime,setEditTime]=useState("");
  const editErrors = useFormErrors({ fields: ["day", "time"], aliases: { scheduledAt: "day" } });
  const team = canManage;
  const { data, error, busy, stale, reload, mutate } = useField(
    team,
    {
          date,page,search,
          ...(team ? {
          ...(roleFilter ? { role: roleFilter } : {}),
          ...(memberFilter ? { membershipId: memberFilter } : {}),
        } : {}),
    }, tab,
  );
  const [openDay, setOpenDay] = useState<string | null>(null);
  if (!session || session.scope !== "tenant") return null;
  const dateLabel = new Intl.DateTimeFormat("es-PE", {
    timeZone: "UTC",
    dateStyle: "short",
  }).format(new Date(date + "T12:00:00Z"));
  const longLabel = new Intl.DateTimeFormat("es-PE", {
    timeZone: "UTC",
    dateStyle: "full",
  }).format(new Date(date + "T12:00:00Z"));
  const selection = planningForDate(
    data ? data.visits : [],
    data ? data.workdays : [],
    date,
    session.timeZone,
  );
  const visits = data?.visits ?? [];
  const responsible = (row: {
    member_email?: string;
    member_role?: FieldMember["role"] | null;
  }) =>
    team && row.member_email
      ? `${row.member_email} · ${row.member_role ? roleLabels[row.member_role] : "Rol histórico no registrado"}`
      : session.email;
  const agenda: AgendaSlot[] = visits.map((visit) => ({
    id: visit.id,
    clientId: visit.customer_id,
    clientName: visit.customer_name,
    seller: responsible(visit),
    district: visit.customer_address,
    date: dateLabel,
    timeSlot: companyTime(visit.scheduled_at, session.timeZone),
    status:
      visit.status === "pending"
        ? "programada"
        : visit.status === "active"
          ? "en_curso"
          : visit.status === "cancelled" ? "cancelada" : "completada",
  }));
  const days = selection.days;
  const jornadas: JornadaSummary[] = selection.summaries.map(
    ({ day, completed, total }) => ({
      id: day.id,
      seller: responsible(day),
      startTime: companyTime(day.started_at, session.timeZone),
      completedVisits: completed,
      totalVisits: total,
      status: day.status === "active" ? "En jornada" : "Finalizada",
    }),
  );
  const records: RegistroVisita[] = (data?.visits ?? [])
    .filter((visit) => visit.status === "completed" && visit.result !== null)
    .map((visit) => ({
      id: visit.id,
      code: visit.id.slice(0, 8).toUpperCase(),
      clientId: visit.customer_id,
      clientName: visit.customer_name,
      seller: responsible(visit),
      date: dateLabel,
      result: outcomes[visit.result!],
      evidenceCount: visit.has_evidence ? 1 : 0,
      checkIn: visit.arrived_at
        ? companyTime(visit.arrived_at, session.timeZone)
        : "—",
      checkOut: visit.ended_at
        ? companyTime(visit.ended_at, session.timeZone)
        : "—",
      duration:
        visit.arrived_at && visit.ended_at
          ? Math.max(
              0,
              Math.round(
                (Date.parse(visit.ended_at) - Date.parse(visit.arrived_at)) /
                  60000,
              ),
            ) + " min"
          : "—",
      observations: visit.observations === null ? "" : visit.observations,
    }));
  const selectedWorkday = days.find((day) => day.id === openDay);
  const startEdit=(visit:Visit)=>{setEditingVisit(visit);setEditDate(companyDate(visit.scheduled_at,session.timeZone));setEditTime(companyTime(visit.scheduled_at,session.timeZone));editErrors.reset();};
  const saveEdit=async(event:React.FormEvent)=>{
    event.preventDefault();if(!editingVisit || busy)return;
    const local = editErrors.validate(z.object({
      day: z.iso.date({ error: "Ingresa una fecha válida." }),
      time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Ingresa una hora válida."),
    }), { day: editDate, time: editTime });
    if (!local) return;
    let scheduledAt: string;
    try { scheduledAt = scheduledInstant(local.day, local.time, session.timeZone); }
    catch (cause) { editErrors.setFieldError("time", cause instanceof Error ? cause.message : "Revisa la hora de la visita."); return; }
    if(await mutate(`/field-operations/visits/${editingVisit.id}/reschedule`,{scheduledAt,expectedVersion:editingVisit.version},visitSchema,editErrors.handle)){setEditingVisit(undefined);toast.success("Visita reprogramada.");}
  };
  const renderFilters = (actions?: React.ReactNode) => (
      <FilterBar rightActions={actions} searchValue={search} onSearchChange={value=>{setSearch(value);setPage(1);}} searchPlaceholder="Buscar cliente o responsable">
      <div className="w-44 shrink-0">
        <CompanyDateFilter value={date} timeZone={session.timeZone}
          onApply={value=>{setSelectedDay(value);setPage(1);}} />
      </div>
      {canManage && (
        <>
          {team && (
            <>
              <div className="w-40 shrink-0"><Select
                label="Rol"
                aria-label="Filtrar equipo por rol"
                value={roleFilter}
                disabled={busy}
                onChange={(event) => {
                  setRoleFilter(event.target.value as FieldMember["role"] | "");
                  setMemberFilter("");
                  setPage(1);
                }}
                options={[
                  { value: "", label: "Todos los roles" },
                  { value: "commercial", label: "Comercial" },
                  { value: "merchandiser", label: "Mercaderista" },
                ]}
              /></div>
              <div className="w-56 shrink-0"><Select
                label="Responsable"
                aria-label="Filtrar equipo por responsable"
                value={memberFilter}
                disabled={busy}
                onChange={(event) => {setMemberFilter(event.target.value);setPage(1);}}
                options={[
                  { value: "", label: "Todos los responsables" },
                  ...(data?.members ?? [])
                    .filter(
                      (member) => !roleFilter || member.role === roleFilter,
                    )
                    .map((member) => ({
                      value: member.id,
                      label: `${member.email} · ${roleLabels[member.role]}`,
                    })),
                ]}
              /></div>
            </>
          )}
        </>
      )}
      </FilterBar>
  );
  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[
          { label: "Operación de campo", href: "/commercial/customers/" },
          { label: "Visitas y jornadas" },
        ]}
        title="Visitas y jornadas"
        subtitle={
          team
            ? "Programa visitas para el equipo y consulta su avance desde móvil"
            : "Consulta tu agenda y los registros de tu actividad móvil"
        }
      />
      <Tabs
        tabs={[
          { id: "agenda", label: "Agenda" },
          { id: "jornadas", label: "Jornadas" },
          { id: "registros", label: "Registros" },
        ]}
        activeTab={tab}
        onChange={value=>{setTab(value);setPage(1);}}
      />
      {tab !== "agenda" && renderFilters()}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
        >
          {error}
        </div>
      )}
      {!data && !error && (
        <p role="status">Cargando planificación y registros…</p>
      )}
      {data && (
        <>
          {tab === "agenda" && (
            <AgendaView
              agendaItems={agenda}
              connected={{
                renderFilters,
                renderActions: team ? (slot) => {
                  const visit=visits.find(item=>item.id===slot.id);
                  if(!visit || visit.status!=="pending")return null;
                  return <div className="flex gap-2"><Button size="sm" variant="outline" disabled={busy} onClick={()=>startEdit(visit)}>Reprogramar</Button><Button size="sm" variant="outline" disabled={busy} onClick={()=>{if(window.confirm("¿Cancelar esta visita? Su registro se conservará."))void mutate(`/field-operations/visits/${visit.id}/cancel`,{expectedVersion:visit.version},visitSchema).then(ok=>{if(ok)toast.success("Visita cancelada.");});}}>Cancelar</Button></div>;
                } : undefined,
                dateLabel,
                dateLongLabel: longLabel,
                canSchedule:
                  (team || session.role === "commercial") && !busy && !stale,
                renderScheduler: (open, close) => (
                  <ScheduleVisitDrawer
                    open={open}
                    close={close}
                    date={date}
                    timeZone={session.timeZone}
                    email={session.email}
                    customers={data.customers}
                    members={team ? data.members : undefined}
                    busy={busy}
                    disabled={busy || stale}
                    save={(input, onError) =>
                      mutate(
                        team ? teamRoutes.schedule : fieldRoutes.schedule,
                        input,
                        visitSchema,
                        onError,
                      )
                    }
                  />
                ),
              }}
            />
          )}
          {tab === "jornadas" && (
            <>
              <JornadasView
                jornadas={jornadas}
                pagination={{ currentPage: page, totalCount: data.total, pageSize: 25, onPageChange: setPage }}
                connected={{
                  agenda,
                  clients: data.visits.map((visit) => ({
                    seller: responsible(visit),
                    zone: visit.customer_address,
                  })),
                  dateLabel,
                  pendingCount: selection.pendingDue.length,
                  onOpen: (day) => setOpenDay(day.id),
                }}
              />
              {!days.length && (
                <p className="text-xs text-zinc-500">
                  No hay una jornada registrada para esta fecha. El inicio se
                  registra desde móvil.
                </p>
              )}
            </>
          )}
          {tab === "registros" && (
            <RegistrosView
              registros={records}
              pagination={{ currentPage: page, totalCount: data.total, pageSize: 25, onPageChange: setPage }}
              renderDetail={(record, close) => (
                <RecordDetail
                  record={record}
                  address={
                    data.visits.find((visit) => visit.id === record.id)!
                      .customer_address
                  }
                  close={close}
                  team={team}
                  audit={
                    data.visits.find((visit) => visit.id === record.id)?.audit
                  }
                />
              )}
            />
          )}
          {tab === "agenda" && <Pagination page={page} total={data.total} pageSize={25} shown={data.visits.length} onPageChange={setPage} entityName="visitas" />}
        </>
      )}
      <SideDrawer isOpen={Boolean(editingVisit)} onClose={()=>{if(!busy)setEditingVisit(undefined);}} title="Reprogramar visita" footer={<Button type="submit" form="reschedule-visit" disabled={busy}>Guardar cambios</Button>}>
        <form id="reschedule-visit" noValidate onSubmit={saveEdit} className="space-y-4">
          <label className="block text-sm">Fecha<Input required type="date" value={editDate} disabled={busy} aria-invalid={Boolean(editErrors.fields.day)} aria-describedby={editErrors.fields.day ? "reschedule-date-error" : undefined} onChange={event=>{editErrors.clear("day");setEditDate(event.target.value);}} /><FieldError id="reschedule-date-error" message={editErrors.fields.day} /></label>
          <label className="block text-sm">Hora<Input required type="time" value={editTime} disabled={busy} aria-invalid={Boolean(editErrors.fields.time)} aria-describedby={editErrors.fields.time ? "reschedule-time-error" : undefined} onChange={event=>{editErrors.clear("time");setEditTime(event.target.value);}} /><FieldError id="reschedule-time-error" message={editErrors.fields.time} /></label>
          <p className="text-xs text-zinc-500">La planificación no puede modificarse si la jornada ya comenzó.</p>
          {editErrors.error&&<p role="alert" className="text-sm text-rose-700">{editErrors.error}</p>}
        </form>
      </SideDrawer>
      <SideDrawer
        isOpen={Boolean(selectedWorkday)}
        onClose={() => setOpenDay(null)}
        title="Detalle de jornada"
        footer={
          <Button variant="secondary" onClick={() => setOpenDay(null)}>
            Cerrar
          </Button>
        }
      >
        {selectedWorkday && (
          <div className="space-y-4 text-sm">
            <p>{responsible(selectedWorkday)}</p>
            <dl className="grid grid-cols-2 gap-3">
              <dt>Fecha</dt>
              <dd>{dateLabel}</dd>
              <dt>Estado</dt>
              <dd>
                {selectedWorkday.status === "active"
                  ? "En jornada"
                  : "Finalizada"}
              </dd>
              <dt>Inicio</dt>
              <dd>
                {companyTime(selectedWorkday.started_at, session.timeZone)}
              </dd>
              <dt>Cierre</dt>
              <dd>
                {selectedWorkday.ended_at
                  ? companyTime(selectedWorkday.ended_at, session.timeZone)
                  : "Sin cerrar"}
              </dd>
              <dt>Visitas completadas</dt>
              <dd>
                {
                  jornadas.find((day) => day.id === selectedWorkday.id)
                    ?.completedVisits
                }{" "}
                /{" "}
                {
                  jornadas.find((day) => day.id === selectedWorkday.id)
                    ?.totalVisits
                }
              </dd>
            </dl>
            <p className="text-xs text-zinc-500">
              El inicio, las llegadas y el cierre se registran desde la
              aplicación móvil.
            </p>
          </div>
        )}
      </SideDrawer>
    </div>
  );
}
