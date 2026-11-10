import type { Visit, Workday } from "@/shared/api/contracts";

/** Scheduling and actual execution belong to separate date dimensions. */
export function planningForDate<TVisit extends Visit, TWorkday extends Workday>(
  visits: TVisit[],
  workdays: TWorkday[],
  date: string,
  timeZone: string,
) {
  const days = workdays.filter((day) => day.business_date === date);
  const dayIds = new Set(days.map((day) => day.id));
  const pendingDue = visits.filter(
    (visit) =>
      visit.status === "pending" &&
      companyDate(visit.scheduled_at, timeZone) <= date,
  );
  return {
    agenda: visits.filter(
      (visit) => companyDate(visit.scheduled_at, timeZone) === date,
    ),
    days,
    records: visits.filter(
      (visit) =>
        visit.status === "completed" &&
        visit.workday_id !== null &&
        dayIds.has(visit.workday_id),
    ),
    summaries: days.map((day) => {
      const executed = visits.filter((visit) => visit.workday_id === day.id);
      return {
        day,
        completed: day.completed_visits,
        total:
          day.total_visits,
      };
    }),
    pendingDue,
  };
}

/** Convert company-local calendar input explicitly; never use the workstation time zone. */
export function companyDate(value: string | Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (type: string) =>
    parts.find((value) => value.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function companyTime(value: string, timeZone: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));
}

export function scheduledInstant(
  date: string,
  time: string,
  timeZone: string,
): string {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
  )
    throw new Error("Fecha u hora no válidas.");
  const desired = Date.parse(`${date}T${time}:00.000Z`);
  if (
    !Number.isFinite(desired) ||
    new Date(desired).toISOString().slice(0, 10) !== date
  )
    throw new Error("Fecha no válida.");
  let candidate = desired;
  for (let attempt = 0; attempt < 4; attempt++) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(candidate));
    const part = (type: string) =>
      parts.find((value) => value.type === type)!.value;
    const represented = Date.parse(
      `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}:00.000Z`,
    );
    if (represented === desired) return new Date(candidate).toISOString();
    candidate += desired - represented;
  }
  throw new Error("Ese horario no existe en la zona horaria de la empresa.");
}
