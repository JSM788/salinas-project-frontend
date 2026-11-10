const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

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
