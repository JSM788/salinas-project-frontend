import { MockCliente } from "@/mocks/clientes.mock";
import { Cliente } from "../models/cliente.model";

export function adaptMockClienteToCliente(raw: MockCliente): Cliente {
  return {
    id: raw.id,
    code: raw.code,
    name: raw.name,
    ruc: raw.ruc,
    district: raw.district,
    city: raw.city,
    address: raw.address,
    seller: raw.seller,
    zone: raw.zone,
    condition: raw.condition,
    since: raw.since,
    lastPurchaseDate: raw.lastPurchaseDate,
    monthlyPurchases: raw.monthlyPurchases,
    availableCredit: raw.availableCredit,
    expiredDebt: raw.expiredDebt,
    creditLimit: raw.creditLimit,
    currentDebt: raw.currentDebt,
    purchaseHistory: raw.purchaseHistory,
  };
}
