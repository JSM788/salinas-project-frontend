export interface Cliente {
  id: string;
  code: string;
  name: string;
  ruc: string;
  district: string;
  city: string;
  address: string;
  seller: string;
  zone: string;
  condition: "Al día" | "Con atraso";
  since: string;
  lastPurchaseDate: string;
  monthlyPurchases: number;
  availableCredit: number;
  expiredDebt: number;
  creditLimit: number;
  currentDebt: number;
  /** Monthly purchases, oldest first; the last entry is the current month. */
  purchaseHistory: { month: string; amount: number }[];
}

export interface ClienteFilters {
  search?: string;
  district?: string;
  seller?: string;
  status?: string;
  lastPurchase?: string;
  zone?: string;
}

/** Invoice with an open balance, as reported by SAP. */
export interface FacturaPendiente {
  id: string;
  clienteId: string;
  code: string;
  emision: string;
  vencimiento: string;
  importe: number;
  saldoPendiente: number;
  estado: "Por vencer" | "Vencido";
}
