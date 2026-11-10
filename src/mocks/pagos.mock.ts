import type { PagoStatus } from "@/modules/finanzas/models/finanzas.model";

/**
 * Raw payment reports sent by the field app. Single source for both the order
 * timelines (ventas.mock) and the Finanzas reconciliation queue (finanzas.mock).
 */
export interface PagoSeed {
  id: string;
  pedidoCode: string;
  method: "Transferencia BCP" | "Transferencia BBVA" | "Interbank" | "Depósito en efectivo";
  operationNumber: string;
  amount: number;
  date: string;
  time: string;
  status: PagoStatus;
  bankAccount: string;
  notes: string;
  /** Finance-side timeline note once the payment left "Pendiente". */
  resolution?: { time: string; date: string; detail: string };
}

const BCP = "Cta Cte BCP Soles 193-2039481-0-22";
const BBVA = "Cta Cte BBVA Soles 0011-0284-0100039281";
const INTERBANK = "Cta Cte Interbank 200-3001829401";

export const PAGOS_SEED: PagoSeed[] = [
  {
    id: "pago-001",
    pedidoCode: "PED-1042",
    method: "Transferencia BCP",
    operationNumber: "845219",
    amount: 1440,
    date: "16 oct. 2026",
    time: "09:35",
    status: "Pendiente",
    bankAccount: BCP,
    notes: "Comprobante adjunto por la vendedora en campo durante la visita.",
  },
  {
    id: "pago-002",
    pedidoCode: "PED-1041",
    method: "Transferencia BBVA",
    operationNumber: "BBVA-448190",
    amount: 620,
    date: "15 oct. 2026",
    time: "17:20",
    status: "Pendiente",
    bankAccount: BBVA,
    notes: "Pago al contado reportado al cierre del día.",
  },
  {
    id: "pago-003",
    pedidoCode: "PED-1040",
    method: "Interbank",
    operationNumber: "IBK-77130",
    amount: 1330,
    date: "15 oct. 2026",
    time: "16:10",
    status: "Conciliado",
    bankAccount: INTERBANK,
    notes: "Pedido formalizado en la visita con pago al contado.",
    resolution: { date: "15 oct. 2026", time: "18:05", detail: "Conciliado con el archivo del banco." },
  },
  {
    id: "pago-004",
    pedidoCode: "PED-1039",
    method: "Interbank",
    operationNumber: "IBK-77129",
    amount: 850,
    date: "14 oct. 2026",
    time: "12:50",
    status: "Conciliado",
    bankAccount: INTERBANK,
    notes: "Pago total reportado.",
    resolution: { date: "14 oct. 2026", time: "17:30", detail: "Conciliado con el archivo del banco." },
  },
  {
    id: "pago-005",
    pedidoCode: "PED-1037",
    method: "Transferencia BCP",
    operationNumber: "00981245",
    amount: 980,
    date: "13 oct. 2026",
    time: "14:40",
    status: "Conciliado",
    bankAccount: BCP,
    notes: "Pago total confirmado en cuenta.",
    resolution: { date: "13 oct. 2026", time: "18:00", detail: "Conciliado con el archivo del banco." },
  },
  {
    id: "pago-006",
    pedidoCode: "PED-1035",
    method: "Depósito en efectivo",
    operationNumber: "AG-11029",
    amount: 1100,
    date: "12 oct. 2026",
    time: "16:30",
    status: "Observado",
    bankAccount: BCP,
    notes: "Monto reportado no coincide con el depósito en ventanilla (falta S/ 50 de comisión interplaza).",
    resolution: {
      date: "13 oct. 2026",
      time: "09:10",
      detail: "Observado: el monto depositado no coincide con el reportado.",
    },
  },
  {
    id: "pago-007",
    pedidoCode: "PED-1031",
    method: "Transferencia BCP",
    operationNumber: "00979802",
    amount: 980,
    date: "10 oct. 2026",
    time: "11:50",
    status: "Conciliado",
    bankAccount: BCP,
    notes: "Pago total confirmado en cuenta.",
    resolution: { date: "10 oct. 2026", time: "17:45", detail: "Conciliado con el archivo del banco." },
  },
  {
    id: "pago-008",
    pedidoCode: "PED-1018",
    method: "Transferencia BCP",
    operationNumber: "00970455",
    amount: 780,
    date: "02 oct. 2026",
    time: "11:00",
    status: "Conciliado",
    bankAccount: BCP,
    notes: "Pago total confirmado en cuenta.",
    resolution: { date: "02 oct. 2026", time: "16:20", detail: "Conciliado con el archivo del banco." },
  },
];
