export type PagoStatus = "Pendiente" | "Conciliado" | "Observado";

export interface PagoReportado {
  id: string;
  orderCode: string;
  orderId: string;
  clientId: string;
  clientName: string;
  clientRuc: string;
  seller: string;
  amount: number;
  paymentMethod: "Transferencia BCP" | "Transferencia BBVA" | "Interbank" | "Depósito en efectivo";
  operationNumber: string;
  dateReported: string;
  status: PagoStatus;
  voucherUrl?: string;
  bankAccount: string;
  notes?: string;
}

export interface CuentaPorCobrar {
  id: string;
  clientId: string;
  clientName: string;
  ruc: string;
  zone: string;
  seller: string;
  creditLimit: number;
  totalDebt: number;
  currentDebt: number; // No vencido
  overdue1to30: number; // 1 a 30 días
  overdue31to60: number; // 31 a 60 días
  overdueMore60: number; // Más de 60 días
  status: "Al día" | "Por vencer" | "En mora";
  lastPaymentDate: string;
}

export interface LineaCredito {
  id: string;
  clientId: string;
  clientName: string;
  ruc: string;
  assignedLimit: number;
  usedAmount: number;
  availableAmount: number;
  paymentTermDays: number;
  status: "Activa" | "Bloqueada" | "En evaluación";
  approvedDate: string;
  evaluatedBy: string;
}

/** One row of the bank statement ("extracto") uploaded by Finanzas. */
export interface ExtractoRow {
  rowNumber: number;
  date: string;
  bank: string;
  operationNumber: string;
  description: string;
  amount: number;
}

export type ExtractoMatchStatus =
  | "coincide"
  | "monto_distinto"
  | "no_figura"
  | "ya_conciliado";

export interface ExtractoMatch {
  status: ExtractoMatchStatus;
  /** Amount found in the statement for the same operation, when any. */
  extractoAmount?: number;
  rowNumber?: number;
}

export interface ExtractoImport {
  fileName: string;
  /** Display date-time of the import, e.g. "16 oct. 2026, 10:30". */
  importedAt: string;
  totalRows: number;
  /** Statement rows that match no reported payment. */
  unmatchedRows: ExtractoRow[];
  matches: Record<string, ExtractoMatch>;
}

export const EXTRACTO_MATCH_LABEL: Record<ExtractoMatchStatus, string> = {
  coincide: "Coincide",
  monto_distinto: "Monto distinto",
  no_figura: "No figura en el extracto",
  ya_conciliado: "Ya conciliado",
};
