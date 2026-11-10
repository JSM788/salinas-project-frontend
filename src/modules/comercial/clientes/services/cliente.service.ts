import { CLIENTES_MOCK } from "@/mocks/clientes.mock";
import { FACTURAS_PENDIENTES_MOCK } from "@/mocks/facturas.mock";
import { adaptMockClienteToCliente } from "../adapters/cliente.adapter";
import { Cliente, ClienteFilters, FacturaPendiente } from "../models/cliente.model";

export function getClientes(filters?: ClienteFilters): Cliente[] {
  let list = CLIENTES_MOCK.map(adaptMockClienteToCliente);

  if (filters?.search) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.ruc.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }

  if (filters?.district && filters.district !== "Todos") {
    list = list.filter((c) => c.district.toLowerCase() === filters.district?.toLowerCase());
  }

  if (filters?.seller && filters.seller !== "Todos") {
    list = list.filter((c) => c.seller === filters.seller);
  }

  if (filters?.zone && filters.zone !== "Todas") {
    list = list.filter((c) => c.zone === filters.zone);
  }

  return list;
}

export function getClienteById(id: string): Cliente | undefined {
  const raw = CLIENTES_MOCK.find((c) => c.id === id || c.code.toLowerCase() === id.toLowerCase());
  return raw ? adaptMockClienteToCliente(raw) : undefined;
}

export function getFacturasPendientes(clienteId: string): FacturaPendiente[] {
  return FACTURAS_PENDIENTES_MOCK.filter((f) => f.clienteId === clienteId);
}
