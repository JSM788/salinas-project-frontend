import type {
  Cotizacion,
  CotizacionStatus,
  ItemVenta,
  OrderStatus,
  Pedido,
  TimelineEvent,
} from "@/modules/comercial/ventas/models/venta.model";
import { addMinutes, toSortKey } from "@/shared/lib/date";
import { formatCurrency } from "@/shared/lib/utils";
import { CLIENTES_MOCK } from "./clientes.mock";
import { PAGOS_SEED } from "./pagos.mock";
import { PRODUCTOS_MOCK } from "./productos.mock";

/*
 * Scenario "today": Friday 16 Oct 2026. The field rep (Ana Torres) already
 * quoted, ordered and reported a payment for Pet Market San Borja (CL-001).
 * Every amount, name and RUC is derived from the product and client masters.
 */

const cliente = (id: string) => {
  const found = CLIENTES_MOCK.find((c) => c.id === id);
  if (!found) throw new Error(`Cliente no existe en el maestro: ${id}`);
  return found;
};

function item(productoId: string, requestedQty: number, offeredQty = requestedQty): ItemVenta {
  const producto = PRODUCTOS_MOCK.find((p) => p.id === productoId);
  if (!producto) throw new Error(`Producto no existe en el maestro: ${productoId}`);
  return {
    productoId,
    name: producto.name,
    sku: producto.sku,
    requestedQty,
    availableQty: offeredQty,
    offeredQty,
    unitPrice: producto.price,
    total: offeredQty * producto.price,
  };
}

const totalOf = (items: ItemVenta[]) => items.reduce((sum, i) => sum + i.total, 0);
const unitsOf = (items: ItemVenta[], key: "requestedQty" | "offeredQty") =>
  items.reduce((sum, i) => sum + i[key], 0);
const slug = (code: string) => code.toLowerCase();

const APP_SOURCE = "App comercial";
const PDF_DETAIL = "Evento registrado por el usuario. No se tiene confirmación de entrega ni de lectura.";

interface CotizacionSpec {
  number: number;
  clienteId: string;
  date: string;
  time: string;
  validUntil: string;
  items: ItemVenta[];
  status: CotizacionStatus;
  pedidoCode?: string;
  notes?: string;
}

interface PedidoSpec {
  number: number;
  cotizacionCode?: string;
  clienteId: string;
  date: string;
  time: string;
  items: ItemVenta[];
  orderStatus: OrderStatus;
}

const COTIZACION_SPECS: CotizacionSpec[] = [
  {
    number: 1042,
    clienteId: "cl-001",
    date: "16 oct. 2026",
    time: "09:15",
    validUntil: "23 oct. 2026",
    items: [item("prod-001", 10, 8)],
    status: "Aprobada",
    pedidoCode: "PED-1042",
    notes: "Entrega programada para el almacén central de San Borja.",
  },
  {
    number: 1041,
    clienteId: "cl-003",
    date: "15 oct. 2026",
    time: "11:20",
    validUntil: "22 oct. 2026",
    items: [item("prod-005", 2)],
    status: "Aprobada",
    pedidoCode: "PED-1041",
  },
  {
    number: 1040,
    clienteId: "cl-004",
    date: "13 oct. 2026",
    time: "14:05",
    validUntil: "20 oct. 2026",
    items: [item("prod-001", 2), item("prod-005", 2)],
    status: "Aprobada",
    pedidoCode: "PED-1037",
  },
  {
    number: 1039,
    clienteId: "cl-005",
    date: "15 oct. 2026",
    time: "15:45",
    validUntil: "22 oct. 2026",
    items: [item("prod-004", 2), item("prod-006", 2)],
    status: "Aprobada",
    pedidoCode: "PED-1040",
  },
  {
    number: 1038,
    clienteId: "cl-003",
    date: "14 oct. 2026",
    time: "10:30",
    validUntil: "21 oct. 2026",
    items: [item("prod-001", 2), item("prod-003", 3)],
    status: "Borrador",
  },
];

const PEDIDO_SPECS: PedidoSpec[] = [
  {
    number: 1042,
    cotizacionCode: "COT-1042",
    clienteId: "cl-001",
    date: "16 oct. 2026",
    time: "09:25",
    items: [item("prod-001", 10, 8)],
    orderStatus: "Pendiente de validación",
  },
  {
    number: 1041,
    cotizacionCode: "COT-1041",
    clienteId: "cl-003",
    date: "15 oct. 2026",
    time: "17:10",
    items: [item("prod-005", 2)],
    orderStatus: "Pendiente de validación",
  },
  {
    number: 1040,
    cotizacionCode: "COT-1039",
    clienteId: "cl-005",
    date: "15 oct. 2026",
    time: "15:55",
    items: [item("prod-004", 2), item("prod-006", 2)],
    orderStatus: "Validado",
  },
  {
    number: 1039,
    clienteId: "cl-002",
    date: "14 oct. 2026",
    time: "12:30",
    items: [item("prod-005", 1), item("prod-001", 3)],
    orderStatus: "Validado",
  },
  {
    number: 1037,
    cotizacionCode: "COT-1040",
    clienteId: "cl-004",
    date: "13 oct. 2026",
    time: "14:20",
    items: [item("prod-001", 2), item("prod-005", 2)],
    orderStatus: "Validado",
  },
  {
    number: 1035,
    clienteId: "cl-006",
    date: "12 oct. 2026",
    time: "16:00",
    items: [item("prod-004", 2), item("prod-002", 3)],
    orderStatus: "Pendiente de validación",
  },
  {
    number: 1031,
    clienteId: "cl-001",
    date: "10 oct. 2026",
    time: "11:15",
    items: [item("prod-002", 7)],
    orderStatus: "Validado",
  },
  {
    number: 1018,
    clienteId: "cl-001",
    date: "02 oct. 2026",
    time: "10:40",
    items: [item("prod-003", 6)],
    orderStatus: "Entregado",
  },
];

const byTime = (a: TimelineEvent, b: TimelineEvent) =>
  toSortKey(a.date, a.time) - toSortKey(b.date, b.time);

function buildCotizacion(spec: CotizacionSpec): Cotizacion {
  const c = cliente(spec.clienteId);
  const code = `COT-${spec.number}`;
  const source = `${c.seller} · ${APP_SOURCE}`;
  const requested = unitsOf(spec.items, "requestedQty");
  const offered = unitsOf(spec.items, "offeredQty");
  const amount = totalOf(spec.items);
  const pedido = PEDIDO_SPECS.find((p) => p.cotizacionCode === code);

  const timeline: TimelineEvent[] = [
    {
      date: spec.date,
      time: addMinutes(spec.time, -3),
      type: "Borrador",
      title: "Borrador creado",
      source,
      detail: "Se creó un borrador de cotización.",
    },
    {
      date: spec.date,
      time: addMinutes(spec.time, -1),
      type: "Propuesta",
      title: "Cantidades de la propuesta registradas",
      source,
      detail:
        `Solicitadas: ${requested} · Ofrecidas: ${offered} · No atendidas: ${requested - offered}` +
        (requested > offered ? ". Stock insuficiente al cotizar." : ""),
    },
  ];

  if (spec.status !== "Borrador") {
    timeline.push(
      {
        date: spec.date,
        time: spec.time,
        type: "Documento",
        title: `Cotización generada ${code}`,
        source,
        detail: `Se generó la cotización ${code} por un total de ${formatCurrency(amount)}.`,
      },
      {
        date: spec.date,
        time: addMinutes(spec.time, 2),
        type: "Documento",
        title: "PDF compartido",
        source,
        detail: PDF_DETAIL,
      }
    );
  }

  if (pedido) {
    timeline.push({
      date: pedido.date,
      time: pedido.time,
      type: "Pedido",
      title: "Convertida a pedido",
      source,
      detail: `Se registró el pedido PED-${pedido.number}.`,
    });
  }

  return {
    id: slug(code),
    code,
    clienteId: c.id,
    clienteName: c.name,
    seller: c.seller,
    date: spec.date,
    time: spec.time,
    validUntil: spec.validUntil,
    amount,
    status: spec.status,
    items: spec.items,
    notes: spec.notes,
    pedidoCode: spec.pedidoCode,
    timeline: timeline.sort(byTime),
  };
}

function buildPedido(spec: PedidoSpec): Pedido {
  const c = cliente(spec.clienteId);
  const code = `PED-${spec.number}`;
  const source = `${c.seller} · ${APP_SOURCE}`;
  const pago = PAGOS_SEED.find((p) => p.pedidoCode === code);
  const cotizacion = spec.cotizacionCode
    ? COTIZACION_SPECS.find((q) => `COT-${q.number}` === spec.cotizacionCode)
    : undefined;
  const requested = unitsOf(spec.items, "requestedQty");
  const accepted = unitsOf(spec.items, "offeredQty");
  const total = totalOf(spec.items);
  const paymentStatus = pago?.status ?? "Pendiente";
  const reconciled = paymentStatus === "Conciliado";

  const timeline: TimelineEvent[] = [];

  if (cotizacion) {
    timeline.push({
      date: cotizacion.date,
      time: cotizacion.time,
      type: "Documento",
      title: "Cotización registrada",
      source,
      detail: `${spec.cotizacionCode} · ${c.seller}`,
    });
  }
  timeline.push(
    {
      date: spec.date,
      time: spec.time,
      type: "Propuesta",
      title: "Cantidad aceptada registrada",
      source,
      detail: `Solicitadas: ${requested} · Aceptadas: ${accepted} · Demanda no atendida: ${requested - accepted}`,
    },
    {
      date: spec.date,
      time: spec.time,
      type: "Pedido",
      title: "Pedido registrado",
      source,
      detail: `${code} · ${formatCurrency(total)}`,
    }
  );

  if (pago) {
    timeline.push({
      date: pago.date,
      time: pago.time,
      type: "Pago",
      title: "Pago reportado",
      source,
      detail: `${pago.method} · OP ${pago.operationNumber} · ${formatCurrency(pago.amount)}`,
    });
    if (pago.resolution) {
      timeline.push({
        date: pago.resolution.date,
        time: pago.resolution.time,
        type: "Pago",
        title: pago.status === "Conciliado" ? "Pago conciliado" : "Pago observado",
        source: "Finanzas",
        detail: pago.resolution.detail,
      });
    }
  }

  if (code === "PED-1042") {
    timeline.push({
      date: "16 oct. 2026",
      time: "08:00",
      type: "Archivo",
      title: "Archivo financiero actualizado",
      source: "Integración financiera",
      detail: "Última versión disponible para conciliación; anterior al reporte del pago.",
    });
  }

  return {
    id: slug(code),
    code,
    cotizacionCode: spec.cotizacionCode,
    clienteId: c.id,
    clienteName: c.name,
    ruc: c.ruc,
    address: c.address,
    seller: c.seller,
    date: spec.date,
    time: spec.time,
    total,
    paymentCondition: "Contado",
    paymentStatus,
    reservationStatus: reconciled ? "Confirmada" : "Por confirmar",
    orderStatus: spec.orderStatus,
    items: spec.items,
    timeline: timeline.sort(byTime),
  };
}

export const COTIZACIONES_MOCK: Cotizacion[] = COTIZACION_SPECS.map(buildCotizacion);
export const PEDIDOS_MOCK: Pedido[] = PEDIDO_SPECS.map(buildPedido);
