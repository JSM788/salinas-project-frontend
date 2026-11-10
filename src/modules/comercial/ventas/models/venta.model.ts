export interface ItemVenta {
  productoId: string;
  name: string;
  sku: string;
  requestedQty: number;
  availableQty: number;
  offeredQty: number;
  unitPrice: number;
  total: number;
}

export type TimelineEventType =
  | "Borrador"
  | "Propuesta"
  | "Documento"
  | "Pedido"
  | "Pago"
  | "Archivo";

export interface TimelineEvent {
  /** Display date, e.g. "16 oct. 2026". */
  date: string;
  /** 24h time, e.g. "09:35". */
  time: string;
  title: string;
  /** Who or what produced the event, e.g. "Ana Torres · App comercial". */
  source: string;
  detail?: string;
  /** Used by the history filters. */
  type: TimelineEventType;
}

export type CotizacionStatus = "Borrador" | "Enviada" | "Aprobada";
export type PaymentStatus = "Pendiente" | "Conciliado" | "Observado";
export type ReservationStatus = "Por confirmar" | "Confirmada";
export type OrderStatus = "Pendiente de validación" | "Validado" | "Entregado";

export interface Cotizacion {
  id: string;
  code: string;
  clienteId: string;
  clienteName: string;
  seller: string;
  /** Creation date, e.g. "16 oct. 2026". */
  date: string;
  /** Creation time, e.g. "09:15". */
  time: string;
  validUntil: string;
  amount: number;
  status: CotizacionStatus;
  items: ItemVenta[];
  notes?: string;
  /** Code of the order created from this quote, if any. */
  pedidoCode?: string;
  timeline: TimelineEvent[];
}

export interface Pedido {
  id: string;
  code: string;
  cotizacionCode?: string;
  clienteId: string;
  clienteName: string;
  ruc: string;
  address: string;
  seller: string;
  date: string;
  time: string;
  total: number;
  paymentCondition: "Contado" | "Crédito";
  paymentStatus: PaymentStatus;
  reservationStatus: ReservationStatus;
  orderStatus: OrderStatus;
  items: ItemVenta[];
  timeline: TimelineEvent[];
}

/** Presentation labels, shared so every screen names states the same way. */
export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  Pendiente: "Esperando archivo",
  Conciliado: "Conciliado",
  Observado: "Observado",
};

export const PAYMENT_STATUS_HINT: Record<PaymentStatus, string> = {
  Pendiente: "Reporte recibido; en espera del archivo del banco",
  Conciliado: "Pago confirmado con el archivo del banco",
  Observado: "Finanzas observó el pago; requiere corrección",
};

export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  "Por confirmar": "Confirmación SAP pendiente",
  Confirmada: "Reserva confirmada",
};

export const RESERVATION_STATUS_HINT: Record<ReservationStatus, string> = {
  "Por confirmar": "Reserva provisional de 6 horas, sujeta a validación en SAP",
  Confirmada: "SAP confirmó la reserva de stock",
};

export const ORDER_STATUS_HINT: Record<OrderStatus, string> = {
  "Pendiente de validación": "Registro ingresado; en proceso con SAP",
  Validado: "Pedido validado",
  Entregado: "Pedido entregado",
};

/** Business rule shown in several screens. */
export const QUOTE_NO_STOCK_RESERVATION_NOTE =
  "Esta cotización no reserva stock. La disponibilidad se revalidará al convertirla a pedido.";
