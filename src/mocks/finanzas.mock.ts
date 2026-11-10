import type {
  CuentaPorCobrar,
  LineaCredito,
  PagoReportado,
} from "@/modules/finanzas/models/finanzas.model";
import { toSortKey } from "@/shared/lib/date";
import { CLIENTES_MOCK } from "./clientes.mock";
import { PAGOS_SEED } from "./pagos.mock";
import { PEDIDOS_MOCK } from "./ventas.mock";

/*
 * Everything here is derived from the client master (limits, debts, sellers) and
 * the payment/order seeds, so Finanzas can never disagree with Comercial.
 */

const REVIEWER = "Elena Castro";

export const PAGOS_REPORTADOS_MOCK: PagoReportado[] = PAGOS_SEED.map((pago) => {
  const pedido = PEDIDOS_MOCK.find((p) => p.code === pago.pedidoCode);
  if (!pedido) throw new Error(`Pago ${pago.id} apunta a un pedido inexistente: ${pago.pedidoCode}`);
  return {
    id: pago.id,
    orderCode: pedido.code,
    orderId: pedido.id,
    clientId: pedido.clienteId,
    clientName: pedido.clienteName,
    clientRuc: pedido.ruc,
    seller: pedido.seller,
    amount: pago.amount,
    paymentMethod: pago.method,
    operationNumber: pago.operationNumber,
    dateReported: `${pago.date}, ${pago.time}`,
    status: pago.status,
    bankAccount: pago.bankAccount,
    notes: pago.notes,
  };
}).sort((a, b) => {
  const [dateA, timeA] = a.dateReported.split(", ");
  const [dateB, timeB] = b.dateReported.split(", ");
  return toSortKey(dateB, timeB) - toSortKey(dateA, timeA);
});

/** Aging buckets that cannot be derived from a single "expired" figure. */
const OVERDUE_BUCKET: Record<string, "overdue1to30" | "overdue31to60" | "overdueMore60"> = {
  "cl-002": "overdue31to60",
  "cl-006": "overdue1to30",
};

function lastReconciledPaymentDate(clienteId: string): string {
  const reconciled = PAGOS_SEED.filter((pago) => {
    const pedido = PEDIDOS_MOCK.find((p) => p.code === pago.pedidoCode);
    return pedido?.clienteId === clienteId && pago.status === "Conciliado";
  }).map((pago) => pago.resolution?.date ?? pago.date);
  if (reconciled.length === 0) return "—";
  return reconciled.sort((a, b) => toSortKey(b) - toSortKey(a))[0];
}

export const CUENTAS_POR_COBRAR_MOCK: CuentaPorCobrar[] = CLIENTES_MOCK.map((c, index) => {
  const bucket = OVERDUE_BUCKET[c.id];
  return {
    id: `cpc-${String(index + 1).padStart(3, "0")}`,
    clientId: c.id,
    clientName: c.name,
    ruc: c.ruc,
    zone: c.zone,
    seller: c.seller,
    creditLimit: c.creditLimit,
    totalDebt: c.currentDebt,
    currentDebt: c.currentDebt - c.expiredDebt,
    overdue1to30: bucket === "overdue1to30" ? c.expiredDebt : 0,
    overdue31to60: bucket === "overdue31to60" ? c.expiredDebt : 0,
    overdueMore60: 0,
    status: c.expiredDebt > 0 ? "En mora" : "Al día",
    lastPaymentDate: lastReconciledPaymentDate(c.id),
  };
});

const PAYMENT_TERM_DAYS: Record<string, number> = {
  "cl-001": 30,
  "cl-002": 15,
  "cl-003": 45,
  "cl-004": 30,
  "cl-005": 30,
  "cl-006": 30,
};

const LINE_STATUS: Record<string, LineaCredito["status"]> = {
  "cl-002": "En evaluación",
  "cl-006": "Bloqueada",
};

const LINE_APPROVED: Record<string, string> = {
  "cl-001": "12 ene. 2026",
  "cl-002": "05 feb. 2026",
  "cl-003": "20 mar. 2026",
  "cl-004": "10 abr. 2026",
  "cl-005": "15 ene. 2026",
  "cl-006": "18 feb. 2026",
};

export const LINEAS_CREDITO_MOCK: LineaCredito[] = CLIENTES_MOCK.map((c, index) => ({
  id: `lc-${String(index + 1).padStart(3, "0")}`,
  clientId: c.id,
  clientName: c.name,
  ruc: c.ruc,
  assignedLimit: c.creditLimit,
  usedAmount: c.currentDebt,
  availableAmount: c.creditLimit - c.currentDebt,
  paymentTermDays: PAYMENT_TERM_DAYS[c.id] ?? 30,
  status: LINE_STATUS[c.id] ?? "Activa",
  approvedDate: LINE_APPROVED[c.id] ?? "12 ene. 2026",
  evaluatedBy: REVIEWER,
}));

/** Last time the bank file was refreshed, shown to Finanzas before importing a new one. */
export const ARCHIVO_FINANZAS_ULTIMA_ACTUALIZACION = "16 oct. 2026, 08:00";
