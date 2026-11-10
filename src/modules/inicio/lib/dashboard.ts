import type { Cliente } from "@/modules/comercial/clientes/models/cliente.model";
import type { Pedido } from "@/modules/comercial/ventas/models/venta.model";
import type { PagoReportado } from "@/modules/finanzas/models/finanzas.model";
import { toSortKey } from "@/shared/lib/date";
import { formatCurrency } from "@/shared/lib/utils";

/*
 * Pure derivations for the Inicio dashboard. Everything is computed from the demo
 * store so the numbers always agree with Ventas, Finanzas and Clientes.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** "oct. 2026" for "16 oct. 2026". */
function monthKey(displayDate: string): string {
  return displayDate.split(" ").slice(1).join(" ");
}

export function isSameMonth(displayDate: string, today: string): boolean {
  return monthKey(displayDate) === monthKey(today);
}

/** Period shown in the header: first day of the scenario month up to today. */
export function periodLabel(today: string): string {
  const [, month, year] = today.split(" ");
  return `1 ${month} ${year} – ${today}`;
}

export interface MonthSummary {
  sales: number;
  orders: number;
}

export function monthSummary(pedidos: Pedido[], today: string): MonthSummary {
  const inMonth = pedidos.filter((p) => isSameMonth(p.date, today));
  return { sales: inMonth.reduce((sum, p) => sum + p.total, 0), orders: inMonth.length };
}

export interface PendingPayments {
  count: number;
  amount: number;
}

/** Payments reported by the sales reps that Finanzas has not reconciled yet. */
export function pendingPayments(pagos: PagoReportado[]): PendingPayments {
  const open = pagos.filter((p) => p.status !== "Conciliado");
  return { count: open.length, amount: open.reduce((sum, p) => sum + p.amount, 0) };
}

export interface ArrearsSummary {
  count: number;
  amount: number;
}

export function arrearsSummary(clientes: Cliente[]): ArrearsSummary {
  const late = clientes.filter((c) => c.condition === "Con atraso");
  return { count: late.length, amount: late.reduce((sum, c) => sum + c.expiredDebt, 0) };
}

export interface PriorityClient {
  id: string;
  initials: string;
  name: string;
  reason: string;
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter((word) => word.length > 2)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

/** Clients that need follow-up: overdue debt first, then observed or unreconciled payments. */
export function priorityClients(
  clientes: Cliente[],
  pagos: PagoReportado[],
  limit = 5
): PriorityClient[] {
  return clientes
    .map((c) => {
      const reasons: string[] = [];
      let score = 0;
      if (c.expiredDebt > 0) {
        reasons.push(`Deuda vencida ${formatCurrency(c.expiredDebt)}`);
        score += 3;
      }
      for (const pago of pagos.filter((p) => p.clientId === c.id)) {
        if (pago.status === "Observado") {
          reasons.push(`Pago observado (${pago.orderCode})`);
          score += 2;
        } else if (pago.status === "Pendiente") {
          reasons.push(`Pago por conciliar (${pago.orderCode})`);
          score += 1;
        }
      }
      return { id: c.id, initials: initialsOf(c.name), name: c.name, reason: reasons.join(" · "), score };
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "es"))
    .slice(0, limit)
    .map(({ id, initials, name, reason }) => ({ id, initials, name, reason }));
}

export interface WeekSales {
  id: string;
  /** Short day range, e.g. "12–18 oct.". */
  range: string;
  total: number;
  orders: number;
}

/** Sales per calendar week (Monday to Sunday) of the scenario month, up to the current week. */
export function weeklySales(pedidos: Pedido[], today: string): WeekSales[] {
  const todayTs = toSortKey(today);
  const month = today.split(" ")[1];
  const reference = new Date(todayTs);
  const monthStart = Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 1);
  const monthEnd = Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() + 1, 0);
  const mondayOf = (ts: number) => ts - ((new Date(ts).getUTCDay() + 6) % 7) * DAY_MS;

  const weeks: WeekSales[] = [];
  for (let start = mondayOf(monthStart); start <= todayTs; start += 7 * DAY_MS) {
    const end = start + 6 * DAY_MS;
    const inWeek = pedidos.filter((p) => {
      const ts = toSortKey(p.date);
      return isSameMonth(p.date, today) && ts >= start && ts <= end;
    });
    const from = new Date(Math.max(start, monthStart)).getUTCDate();
    const to = new Date(Math.min(end, monthEnd)).getUTCDate();
    weeks.push({
      id: `week-${start}`,
      range: `${from}–${to} ${month}`,
      total: inWeek.reduce((sum, p) => sum + p.total, 0),
      orders: inWeek.length,
    });
  }
  return weeks;
}

/** Rounds `value` up to a 1/2/2.5/5 x 10^n step and returns the chart scale for 4 intervals. */
export function chartScale(value: number): { max: number; ticks: number[] } {
  const raw = Math.max(value, 1) / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? raw;
  return { max: step * 4, ticks: [4, 3, 2, 1, 0].map((i) => step * i) };
}

export interface ActivityEntry {
  id: string;
  pedidoId: string;
  pedidoCode: string;
  clienteName: string;
  title: string;
  type: "Pedido" | "Pago";
  /** "Hoy, 09:35", "Ayer, 17:20" or the full date. */
  whenLabel: string;
}

/** Latest order and payment events across all orders. */
export function recentActivity(pedidos: Pedido[], today: string, limit = 6): ActivityEntry[] {
  const todayTs = toSortKey(today);
  return pedidos
    .flatMap((pedido) =>
      pedido.timeline
        .map((event, index) => ({ pedido, event, index }))
        .filter(({ event }) => event.type === "Pedido" || event.type === "Pago")
    )
    .sort(
      (a, b) =>
        toSortKey(b.event.date, b.event.time) - toSortKey(a.event.date, a.event.time) ||
        b.index - a.index
    )
    .slice(0, limit)
    .map(({ pedido, event, index }) => {
      const days = Math.round((todayTs - toSortKey(event.date)) / DAY_MS);
      const day = days === 0 ? "Hoy" : days === 1 ? "Ayer" : event.date;
      return {
        id: `${pedido.id}-${index}`,
        pedidoId: pedido.id,
        pedidoCode: pedido.code,
        clienteName: pedido.clienteName,
        title: event.title,
        type: event.type as "Pedido" | "Pago",
        whenLabel: `${day}, ${event.time}`,
      };
    });
}
