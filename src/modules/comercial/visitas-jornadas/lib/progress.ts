import type { AgendaSlot, JornadaSummary } from "../models/visita.model";

/**
 * A workday's progress is never typed by hand: it is counted from the agenda,
 * so reassigning a visit moves the numbers of both sellers consistently.
 */
export function withProgress(
  jornadas: JornadaSummary[],
  agenda: AgendaSlot[]
): JornadaSummary[] {
  return jornadas.map((jornada) => {
    const own = agenda.filter((slot) => slot.seller === jornada.seller);
    return {
      ...jornada,
      totalVisits: own.length,
      completedVisits: own.filter((slot) => slot.status === "completada").length,
    };
  });
}

/** Visits of a seller that have not started yet (the ones a manager can reassign). */
export function pendingSlots(agenda: AgendaSlot[], seller: string): AgendaSlot[] {
  return agenda.filter((slot) => slot.seller === seller && slot.status === "programada");
}
