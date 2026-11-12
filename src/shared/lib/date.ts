import { APP_CONSTANTS } from "@/config/constants";

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export const DAYS_OF_WEEK = [
  { key: "lunes", label: "Lunes", dayIndex: 1 },
  { key: "martes", label: "Martes", dayIndex: 2 },
  { key: "miercoles", label: "Miércoles", dayIndex: 3 },
  { key: "jueves", label: "Jueves", dayIndex: 4 },
  { key: "viernes", label: "Viernes", dayIndex: 5 },
] as const;

export type DayKey = (typeof DAYS_OF_WEEK)[number]["key"];

/** Format a Date as "YYYY-MM-DD". */
export function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Convert ISO timestamp to "YYYY-MM-DD" in Lima timezone. */
export function toLimaDateISO(isoTimestamp: string | Date): string {
  const date = typeof isoTimestamp === "string" ? new Date(isoTimestamp) : isoTimestamp;
  return new Intl.DateTimeFormat("en-CA", { timeZone: APP_CONSTANTS.TIMEZONE }).format(date);
}

/** Returns the Monday Date (at 00:00:00) of the current week. */
export function getMondayOfCurrentWeek(referenceDate: Date = new Date()): Date {
  const d = new Date(referenceDate);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/** Format a date or timestamp to "HH:mm" in Lima locale. Returns "—" if missing or invalid. */
export function formatTimeHM(dateOrIso?: string | Date | null): string {
  if (!dateOrIso) return "—";
  try {
    const d = typeof dateOrIso === "string" ? new Date(dateOrIso) : dateOrIso;
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleTimeString(APP_CONSTANTS.LOCALE, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: APP_CONSTANTS.TIMEZONE,
    });
  } catch (err) {
    console.error("Error formatting time:", err);
    return "—";
  }
}

/** Calculates duration between two timestamps and returns formatted string (e.g. "45 min" or "—"). */
export function formatDurationMinutes(
  start?: string | Date | null,
  end?: string | Date | null,
): string {
  if (!start || !end) return "—";
  try {
    const s = typeof start === "string" ? new Date(start).getTime() : start.getTime();
    const e = typeof end === "string" ? new Date(end).getTime() : end.getTime();
    if (isNaN(s) || isNaN(e)) return "—";
    const mins = Math.max(0, Math.round((e - s) / 60_000));
    return `${mins} min`;
  } catch (err) {
    console.error("Error calculating duration:", err);
    return "—";
  }
}

/** Display date used across the app, e.g. "16 oct. 2026". */
export function formatDisplayDate(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]}. ${date.getFullYear()}`;
}

/** Sortable number for a display date ("16 oct. 2026") and an optional "HH:MM" time. */
export function toSortKey(displayDate: string, time = "00:00"): number {
  const match = displayDate.match(/(\d{1,2})\s+([a-záéíóú]{3})\.?\s+(\d{4})/i);
  if (!match) return 0;
  const month = MONTHS.indexOf(match[2].toLowerCase());
  const [hours, minutes] = time.split(":").map(Number);
  return Date.UTC(Number(match[3]), month < 0 ? 0 : month, Number(match[1]), hours || 0, minutes || 0);
}

/** Adds minutes to an "HH:MM" time (same day, wraps at 24h). */
export function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(":").map(Number);
  const total = (((hours * 60 + mins + minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
