import { AGENDA_MOCK, JORNADAS_MOCK, REGISTROS_VISITA_MOCK } from "@/mocks/visitas.mock";
import { AgendaSlot, JornadaSummary, RegistroVisita } from "../models/visita.model";

export function getAgendaItems(): AgendaSlot[] {
  return AGENDA_MOCK;
}

export function getJornadas(): JornadaSummary[] {
  return JORNADAS_MOCK;
}

export function getRegistrosVisita(search?: string, seller?: string, result?: string): RegistroVisita[] {
  let list = REGISTROS_VISITA_MOCK;

  if (search) {
    const q = search.toLowerCase();
    list = list.filter((r) => r.clientName.toLowerCase().includes(q) || r.code.toLowerCase().includes(q));
  }

  if (seller && seller !== "Todos") {
    list = list.filter((r) => r.seller === seller);
  }

  if (result && result !== "Todos") {
    list = list.filter((r) => r.result === result);
  }

  return list;
}
