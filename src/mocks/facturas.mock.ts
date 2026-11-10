import type { FacturaPendiente } from "@/modules/comercial/clientes/models/cliente.model";
import { CLIENTES_MOCK } from "./clientes.mock";

function factura(
  code: string,
  clienteId: string,
  emision: string,
  vencimiento: string,
  importe: number,
  estado: FacturaPendiente["estado"]
): FacturaPendiente {
  return { id: `fac-${code.toLowerCase()}`, clienteId, code, emision, vencimiento, importe, saldoPendiente: importe, estado };
}

export const FACTURAS_PENDIENTES_MOCK: FacturaPendiente[] = [
  factura("F00100871", "cl-001", "01 oct. 2026", "31 oct. 2026", 1600, "Por vencer"),
  factura("F00100902", "cl-001", "10 oct. 2026", "09 nov. 2026", 1000, "Por vencer"),
  factura("F00100655", "cl-002", "20 ago. 2026", "19 sep. 2026", 1200, "Vencido"),
  factura("F00100890", "cl-002", "05 oct. 2026", "04 nov. 2026", 1300, "Por vencer"),
  factura("F00100877", "cl-003", "08 oct. 2026", "07 nov. 2026", 1200, "Por vencer"),
  factura("F00100915", "cl-003", "14 oct. 2026", "13 nov. 2026", 800, "Por vencer"),
  factura("F00100860", "cl-004", "06 oct. 2026", "05 nov. 2026", 500, "Por vencer"),
  factura("F00100899", "cl-005", "09 oct. 2026", "08 nov. 2026", 1800, "Por vencer"),
  factura("F00100702", "cl-006", "10 sep. 2026", "10 oct. 2026", 950, "Vencido"),
  factura("F00100868", "cl-006", "07 oct. 2026", "06 nov. 2026", 1250, "Por vencer"),
];

// Guard: open invoices must add up to what the customer master says is owed.
for (const cliente of CLIENTES_MOCK) {
  const open = FACTURAS_PENDIENTES_MOCK.filter((f) => f.clienteId === cliente.id);
  const total = open.reduce((sum, f) => sum + f.saldoPendiente, 0);
  const expired = open.filter((f) => f.estado === "Vencido").reduce((sum, f) => sum + f.saldoPendiente, 0);
  if (total !== cliente.currentDebt || expired !== cliente.expiredDebt) {
    throw new Error(
      `Facturas de ${cliente.code} no cuadran con el maestro: deuda ${total}/${cliente.currentDebt}, vencida ${expired}/${cliente.expiredDebt}`
    );
  }
}
