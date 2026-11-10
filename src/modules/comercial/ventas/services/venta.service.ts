import { COTIZACIONES_MOCK, PEDIDOS_MOCK } from "@/mocks/ventas.mock";
import { Cotizacion, Pedido } from "../models/venta.model";

export function getCotizaciones(): Cotizacion[] {
  return COTIZACIONES_MOCK;
}

export function getCotizacionById(id: string): Cotizacion | undefined {
  return COTIZACIONES_MOCK.find(
    (c) => c.id === id || c.code.toLowerCase() === id.toLowerCase()
  );
}

export function getPedidos(): Pedido[] {
  return PEDIDOS_MOCK;
}

export function getPedidoById(id: string): Pedido | undefined {
  return PEDIDOS_MOCK.find(
    (p) => p.id === id || p.code.toLowerCase() === id.toLowerCase()
  );
}
