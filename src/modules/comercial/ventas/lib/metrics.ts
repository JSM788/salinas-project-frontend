import type { ItemVenta } from "../models/venta.model";

export interface QuantityMetrics {
  requested: number;
  offered: number;
  unattended: number;
  products: number;
  /** Value of what the customer asked for, at list price. */
  requestedValue: number;
  /** Value of what is actually offered/accepted. */
  offeredValue: number;
}

/** Quantities and values derived from line items; never typed by hand in a screen. */
export function quantityMetrics(items: ItemVenta[]): QuantityMetrics {
  const requested = items.reduce((sum, i) => sum + i.requestedQty, 0);
  const offered = items.reduce((sum, i) => sum + i.offeredQty, 0);
  return {
    requested,
    offered,
    unattended: requested - offered,
    products: items.length,
    requestedValue: items.reduce((sum, i) => sum + i.requestedQty * i.unitPrice, 0),
    offeredValue: items.reduce((sum, i) => sum + i.offeredQty * i.unitPrice, 0),
  };
}

export const pluralize = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`;

export const unitsLabel = (count: number) => pluralize(count, "unidad", "unidades");
