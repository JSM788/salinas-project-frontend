import * as XLSX from "xlsx";
import { formatDisplayDate } from "@/shared/lib/date";
import type {
  ExtractoImport,
  ExtractoMatch,
  ExtractoRow,
  PagoReportado,
} from "../models/finanzas.model";

/*
 * Bank statement ("extracto") import. The real file layout is not known yet, so
 * columns are detected by header name using the aliases below; when the real
 * Excel arrives, adding its header names here is the only change needed.
 */

export const EXTRACTO_HEADER_ALIASES = {
  operationNumber: [
    "noperacion",
    "ndeoperacion",
    "nrooperacion",
    "nrodeoperacion",
    "numerooperacion",
    "numerodeoperacion",
    "operacion",
    "nroop",
    "nop",
  ],
  amount: ["monto", "importe", "abono", "montoabonado", "valor"],
  date: ["fecha", "fechaoperacion", "fechadeoperacion", "fechavalor"],
  bank: ["banco", "entidad"],
  description: ["descripcion", "detalle", "glosa", "concepto", "referencia"],
} as const;

export const EXTRACTO_TEMPLATE_HEADERS = [
  "Fecha",
  "Banco",
  "N° de operación",
  "Descripción",
  "Monto",
];

const normalizeHeader = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

/** Uppercase alphanumerics without leading zeros: "00984124" and "984124" are the same operation. */
const operationKey = (value: unknown) =>
  String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/^0+/, "");

const digitsKey = (value: unknown) =>
  String(value ?? "")
    .replace(/\D/g, "")
    .replace(/^0+/, "");

function parseAmount(value: unknown): number {
  if (typeof value === "number") return value;
  let text = String(value ?? "").replace(/[^\d.,-]/g, "");
  if (text.includes(",") && text.includes(".")) text = text.replace(/,/g, "");
  else if (text.includes(",")) text = text.replace(",", ".");
  const parsed = parseFloat(text);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDate(value: unknown): string {
  if (value instanceof Date) return formatDisplayDate(value);
  return String(value ?? "").trim();
}

function findColumn(headers: string[], aliases: readonly string[]): number {
  return headers.findIndex((header) => aliases.includes(header));
}

export class ExtractoFormatError extends Error {}

/** Reads the first sheet of an .xlsx/.xls/.csv file into normalized statement rows. */
export async function parseExtractoFile(file: File): Promise<ExtractoRow[]> {
  // CSV exports are usually UTF-8; reading them as bytes would assume Windows-1252
  // and corrupt accents, so decode text files ourselves. Binary workbooks are unaffected.
  const isText = /\.(csv|txt)$/i.test(file.name);
  const workbook = isText
    ? XLSX.read(await file.text(), { type: "string", cellDates: true })
    : XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new ExtractoFormatError("El archivo no tiene hojas con datos.");

  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: "" });
  const headerIndex = matrix.findIndex((row) =>
    row.some((cell) => EXTRACTO_HEADER_ALIASES.operationNumber.some((a) => a === normalizeHeader(cell)))
  );
  if (headerIndex < 0) {
    throw new ExtractoFormatError(
      "No se encontró la columna del número de operación. Usa una cabecera como “N° de operación”."
    );
  }

  const headers = matrix[headerIndex].map(normalizeHeader);
  const columns = {
    operation: findColumn(headers, EXTRACTO_HEADER_ALIASES.operationNumber),
    amount: findColumn(headers, EXTRACTO_HEADER_ALIASES.amount),
    date: findColumn(headers, EXTRACTO_HEADER_ALIASES.date),
    bank: findColumn(headers, EXTRACTO_HEADER_ALIASES.bank),
    description: findColumn(headers, EXTRACTO_HEADER_ALIASES.description),
  };
  if (columns.amount < 0) {
    throw new ExtractoFormatError("No se encontró la columna del monto. Usa una cabecera como “Monto” o “Importe”.");
  }

  return matrix
    .slice(headerIndex + 1)
    .map((row, index): ExtractoRow => ({
      rowNumber: headerIndex + index + 2,
      date: columns.date >= 0 ? parseDate(row[columns.date]) : "",
      bank: columns.bank >= 0 ? String(row[columns.bank] ?? "").trim() : "",
      operationNumber: String(row[columns.operation] ?? "").trim(),
      description: columns.description >= 0 ? String(row[columns.description] ?? "").trim() : "",
      amount: parseAmount(row[columns.amount]),
    }))
    .filter((row) => row.operationNumber !== "");
}

/** Crosses the reported payments with the statement by operation number and amount. */
export function matchExtracto(
  pagos: PagoReportado[],
  rows: ExtractoRow[],
  fileName: string,
  importedAt: string
): ExtractoImport {
  const claimed = new Set<number>();
  const matches: Record<string, ExtractoMatch> = {};

  const findRow = (pago: PagoReportado) => {
    const exact = rows.find(
      (row) => !claimed.has(row.rowNumber) && operationKey(row.operationNumber) === operationKey(pago.operationNumber)
    );
    if (exact) return exact;
    const digits = digitsKey(pago.operationNumber);
    if (digits.length < 5) return undefined;
    return rows.find(
      (row) => !claimed.has(row.rowNumber) && digitsKey(row.operationNumber) === digits
    );
  };

  for (const pago of pagos) {
    const row = findRow(pago);
    if (row) claimed.add(row.rowNumber);

    if (pago.status === "Conciliado") {
      matches[pago.id] = { status: "ya_conciliado", rowNumber: row?.rowNumber, extractoAmount: row?.amount };
    } else if (!row) {
      matches[pago.id] = { status: "no_figura" };
    } else if (Math.abs(row.amount - pago.amount) < 0.01) {
      matches[pago.id] = { status: "coincide", rowNumber: row.rowNumber, extractoAmount: row.amount };
    } else {
      matches[pago.id] = { status: "monto_distinto", rowNumber: row.rowNumber, extractoAmount: row.amount };
    }
  }

  return {
    fileName,
    importedAt,
    totalRows: rows.length,
    unmatchedRows: rows.filter((row) => !claimed.has(row.rowNumber)),
    matches,
  };
}

const BANK_LABEL: Record<PagoReportado["paymentMethod"], string> = {
  "Transferencia BCP": "BCP",
  "Transferencia BBVA": "BBVA",
  Interbank: "Interbank",
  "Depósito en efectivo": "BCP",
};

/**
 * Builds a sample statement so the import can be demoed without a real bank file:
 * one exact match, two amount differences, already reconciled payments and
 * deposits from unrelated customers.
 */
export function downloadExtractoDemo(pagos: PagoReportado[]) {
  const amountFor = (pago: PagoReportado) => {
    if (pago.id === "pago-002") return 600; // short by S/ 20
    if (pago.id === "pago-006") return 1050; // short by S/ 50 (interplaza fee)
    return pago.amount;
  };

  const rows: (string | number)[][] = pagos.map((pago) => [
    pago.dateReported.split(",")[0],
    BANK_LABEL[pago.paymentMethod],
    pago.operationNumber,
    `Abono ${pago.clientName}`,
    amountFor(pago),
  ]);
  rows.push(
    ["16 oct. 2026", "BCP", "00984771", "Abono Distribuidora Andina", 2300],
    ["16 oct. 2026", "Interbank", "IBK-77201", "Abono Pet Center La Molina", 415.5]
  );

  const sheet = XLSX.utils.aoa_to_sheet([EXTRACTO_TEMPLATE_HEADERS, ...rows]);
  sheet["!cols"] = [{ wch: 14 }, { wch: 12 }, { wch: 18 }, { wch: 34 }, { wch: 12 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Movimientos");
  XLSX.writeFile(workbook, "extracto_ejemplo_2026-10-16.xlsx");
}
