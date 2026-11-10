import type {
  AgendaSlot,
  JornadaSummary,
  RegistroVisita,
} from "@/modules/comercial/visitas-jornadas/models/visita.model";
import { withProgress } from "@/modules/comercial/visitas-jornadas/lib/progress";
import { CLIENTES_MOCK } from "./clientes.mock";

const cliente = (id: string) => {
  const found = CLIENTES_MOCK.find((c) => c.id === id);
  if (!found) throw new Error(`Cliente no existe en el maestro: ${id}`);
  return found;
};

const TODAY = "16 oct. 2026";

function agenda(
  id: string,
  clientId: string,
  timeSlot: string,
  status: AgendaSlot["status"]
): AgendaSlot {
  const c = cliente(clientId);
  return {
    id,
    clientId,
    timeSlot,
    clientName: c.name,
    seller: c.seller,
    district: c.district,
    date: TODAY,
    status,
  };
}

export const AGENDA_MOCK: AgendaSlot[] = [
  agenda("ag-01", "cl-001", "09:00 - 10:00", "completada"),
  agenda("ag-02", "cl-002", "10:00 - 11:00", "completada"),
  agenda("ag-03", "cl-006", "11:00 - 12:00", "completada"),
  agenda("ag-04", "cl-004", "14:00 - 15:00", "programada"),
  agenda("ag-05", "cl-003", "15:00 - 16:00", "programada"),
  agenda("ag-06", "cl-005", "16:00 - 17:00", "programada"),
];

/** Base workday data; visit counts are derived from the agenda (see withProgress). */
export const JORNADAS_MOCK: JornadaSummary[] = withProgress(
  [
    { id: "j-01", seller: "Ana Torres", startTime: "08:00", completedVisits: 0, totalVisits: 0, status: "En jornada" },
    { id: "j-02", seller: "Luis Ramos", startTime: "08:10", completedVisits: 0, totalVisits: 0, status: "Finalizada" },
    { id: "j-03", seller: "Carlos Díaz", startTime: "08:15", completedVisits: 0, totalVisits: 0, status: "Sin iniciar" },
    { id: "j-04", seller: "Carlos Rojas", startTime: "08:05", completedVisits: 0, totalVisits: 0, status: "Finalizada" },
    { id: "j-05", seller: "Lucía Mendoza", startTime: "08:20", completedVisits: 0, totalVisits: 0, status: "Interrumpida" },
  ],
  AGENDA_MOCK
);

function registro(
  number: number,
  clientId: string,
  date: string,
  result: RegistroVisita["result"],
  checkIn: string,
  checkOut: string,
  duration: string,
  evidenceCount: number,
  observations: string,
  orderCode?: string
): RegistroVisita {
  const c = cliente(clientId);
  return {
    id: `vis-${String(number).padStart(3, "0")}`,
    code: `VIS-${String(number).padStart(3, "0")}`,
    clientId,
    clientName: c.name,
    seller: c.seller,
    date,
    result,
    evidenceCount,
    checkIn,
    checkOut,
    duration,
    observations,
    orderCode,
  };
}

/*
 * Every "Con pedido" visit points at a real order created during that visit
 * (check-in <= order time <= check-out), and every order has its visit.
 */
export const REGISTROS_VISITA_MOCK: RegistroVisita[] = [
  registro(20, "cl-002", TODAY, "Sin compra", "10:05", "10:40", "35 min", 1, "Pidió retomar el pedido la próxima semana."),
  registro(19, "cl-006", TODAY, "Sin compra", "11:05", "11:30", "25 min", 1, "Aún tiene stock suficiente por esta semana."),
  registro(18, "cl-001", TODAY, "Con pedido", "09:10", "09:45", "35 min", 2, "Cliente conforme con el pedido. Interés en más stock para próxima visita.", "PED-1042"),
  registro(17, "cl-005", "15 oct. 2026", "Con pedido", "15:30", "16:15", "45 min", 3, "Pedido formalizado con pago al contado.", "PED-1040"),
  registro(16, "cl-003", "15 oct. 2026", "Con pedido", "16:50", "17:25", "35 min", 2, "Pedido de reposición de alimento premium.", "PED-1041"),
  registro(15, "cl-002", "14 oct. 2026", "Con pedido", "12:00", "12:55", "55 min", 2, "Pedido de reposición con pago al contado.", "PED-1039"),
  registro(14, "cl-004", "15 oct. 2026", "Local cerrado", "14:10", "14:15", "5 min", 1, "Local en remodelación de fachada."),
  registro(13, "cl-004", "13 oct. 2026", "Con pedido", "14:00", "14:45", "45 min", 2, "Pedido generado a partir de la cotización COT-1040.", "PED-1037"),
  registro(12, "cl-006", "12 oct. 2026", "Con pedido", "15:40", "16:35", "55 min", 2, "Depósito en efectivo reportado al cierre de la visita.", "PED-1035"),
  registro(11, "cl-001", "10 oct. 2026", "Con pedido", "10:50", "11:55", "65 min", 2, "Pedido de alimento para gatos.", "PED-1031"),
  registro(10, "cl-001", "02 oct. 2026", "Con pedido", "10:20", "11:10", "50 min", 2, "Pedido de alimento para cachorros.", "PED-1018"),
];
