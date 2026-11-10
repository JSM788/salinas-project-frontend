/** The day the clickable mock simulates (see docs/flujo-comercial-escenario.md). */
export const SCENARIO_DAY = "16 oct. 2026";
export const SCENARIO_DAY_LONG = "Viernes, 16 de octubre de 2026";

/** "HH:MM - HH:MM" slot start, used to order and to place visits on the hour grid. */
export function slotStart(timeSlot: string): string {
  return timeSlot.split(" - ")[0];
}

export const SLOT_STATUS_LABEL = {
  cancelada: "Cancelada",
  completada: "Completada",
  en_curso: "En curso",
  programada: "Pendiente",
} as const;
