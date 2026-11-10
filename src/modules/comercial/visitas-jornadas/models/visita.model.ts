export interface AgendaSlot {
  id: string;
  clientId: string;
  timeSlot: string;
  clientName: string;
  seller: string;
  district: string;
  date: string;
  status: "programada" | "en_curso" | "completada" | "cancelada";
}

export interface JornadaSummary {
  id: string;
  seller: string;
  startTime: string;
  completedVisits: number;
  totalVisits: number;
  status: "En jornada" | "Interrumpida" | "Sin iniciar" | "Finalizada";
}

export interface RegistroVisita {
  id: string;
  code: string;
  clientId: string;
  clientName: string;
  seller: string;
  date: string;
  result:
    "Con pedido" | "Sin compra" | "Local cerrado" | "Atendida" | "No atendida";
  evidenceCount: number;
  checkIn: string;
  checkOut: string;
  duration: string;
  observations: string;
  orderCode?: string;
}
