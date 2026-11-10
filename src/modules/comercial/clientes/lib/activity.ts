import type {
  Cotizacion,
  Pedido,
} from "@/modules/comercial/ventas/models/venta.model";
import { unitsLabel } from "@/modules/comercial/ventas/lib/metrics";
import type { RegistroVisita } from "@/modules/comercial/visitas-jornadas/models/visita.model";
import { toSortKey } from "@/shared/lib/date";
import { formatCurrency } from "@/shared/lib/utils";

export type ActivityType = "Visitas" | "Pagos" | "Pedidos" | "Cotizaciones";

export interface ActivityEvent {
  key: string;
  type: ActivityType;
  date: string;
  time: string;
  title: string;
  responsible: string;
  lines: string[];
  /** Extra line highlighted in amber (e.g. unattended demand). */
  warning?: string;
  evidenceCount?: number;
  href: string;
  linkLabel: string;
  /** Payment state to show next to payment events. */
  payment?: Pedido["paymentStatus"];
}

const VISIT_TITLE: Record<RegistroVisita["result"], string> = {
  Atendida: "Visita atendida",
  "No atendida": "Visita no atendida",
  "Con pedido": "Visita completada",
  "Sin compra": "Visita sin compra",
  "Local cerrado": "Local cerrado",
};

/** Builds a customer's activity feed from the same records every other screen reads. */
export function buildClienteActivity(
  clienteId: string,
  pedidos: Pedido[],
  cotizaciones: Cotizacion[],
  registros: RegistroVisita[],
): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  for (const visita of registros.filter((r) => r.clientId === clienteId)) {
    events.push({
      key: visita.id,
      type: "Visitas",
      date: visita.date,
      time: visita.checkOut,
      title: VISIT_TITLE[visita.result],
      responsible: visita.seller,
      lines: [
        `Check-in ${visita.checkIn} · Check-out ${visita.checkOut} · Resultado: ${visita.result}`,
        ...(visita.observations ? [visita.observations] : []),
      ],
      evidenceCount: visita.evidenceCount,
      href: "/comercial/visitas-jornadas/",
      linkLabel: "Ver visita",
    });
  }

  for (const cotizacion of cotizaciones.filter(
    (c) => c.clienteId === clienteId,
  )) {
    const sent = cotizacion.timeline.find((e) => e.title === "PDF compartido");
    if (!sent) continue;
    events.push({
      key: `${cotizacion.id}-sent`,
      type: "Cotizaciones",
      date: sent.date,
      time: sent.time,
      title: "Cotización enviada",
      responsible: cotizacion.seller,
      lines: [`${cotizacion.code} · ${formatCurrency(cotizacion.amount)}`],
      href: `/comercial/ventas/cotizaciones/${cotizacion.id}/`,
      linkLabel: "Ver cotización",
    });
  }

  for (const pedido of pedidos.filter((p) => p.clienteId === clienteId)) {
    const units = pedido.items.reduce((sum, i) => sum + i.offeredQty, 0);
    const requested = pedido.items.reduce((sum, i) => sum + i.requestedQty, 0);
    events.push({
      key: `${pedido.id}-order`,
      type: "Pedidos",
      date: pedido.date,
      time: pedido.time,
      title: "Pedido registrado",
      responsible: pedido.seller,
      lines: [
        `${pedido.code} · ${unitsLabel(units)} aceptadas · ${formatCurrency(pedido.total)}`,
      ],
      warning:
        requested > units
          ? `${unitsLabel(requested - units)} de demanda no atendida.`
          : undefined,
      href: `/comercial/ventas/pedidos/${pedido.id}/`,
      linkLabel: "Ver pedido",
    });

    for (const event of pedido.timeline.filter((e) => e.type === "Pago")) {
      events.push({
        key: `${pedido.id}-${event.date}-${event.time}-${event.title}`,
        type: "Pagos",
        date: event.date,
        time: event.time,
        title: event.title,
        responsible: event.source.split(" · ")[0],
        lines: [`${pedido.code} · ${event.detail ?? ""}`],
        payment:
          event.title === "Pago reportado" ? pedido.paymentStatus : undefined,
        href: `/comercial/ventas/pedidos/${pedido.id}/`,
        linkLabel: "Ver pedido",
      });
    }
  }

  return events.sort(
    (a, b) => toSortKey(b.date, b.time) - toSortKey(a.date, a.time),
  );
}

/** "Hoy · 16 oct. 2026" / "Ayer · 15 oct. 2026" / plain date. */
export function dayHeading(date: string, today = "16 oct. 2026"): string {
  const diffDays = Math.round(
    (toSortKey(today) - toSortKey(date)) / 86_400_000,
  );
  if (diffDays === 0) return `Hoy · ${date}`;
  if (diffDays === 1) return `Ayer · ${date}`;
  return date;
}
