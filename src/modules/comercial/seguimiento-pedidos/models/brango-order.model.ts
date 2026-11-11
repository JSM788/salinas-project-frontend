export type BrangoDeliveryStatus =
  | "entregado"
  | "en_transito"
  | "pendiente"
  | "observado";

export type BrangoOriginCode =
  | "DELIVERED"
  | "IN_TRANSIT"
  | "PENDING"
  | "OBSERVED";

export interface BrangoTrackingStep {
  time: string;
  status: BrangoDeliveryStatus;
  label: string;
  description: string;
  completed: boolean;
  isCurrent?: boolean;
}

export interface BrangoSyncEvent {
  id: string;
  timestamp: string;
  originCode: BrangoOriginCode;
  status: BrangoDeliveryStatus;
  actor: string;
  note: string;
}

export interface BrangoOrderEvidence {
  caption: string;
  receivedBy: string;
  capturedAt: string;
  cargoTag: string;
  notes: string;
}

export interface BrangoTrackedOrder {
  id: string;
  code: string;
  customerName: string;
  commercialName: string;
  status: BrangoDeliveryStatus;
  originCode: BrangoOriginCode;
  updatedAt: string;
  dateKey: string;
  dateLabel: string;
  deliveryDateLabel: string;
  origin: "Brango";
  timeline: BrangoTrackingStep[];
  history: BrangoSyncEvent[];
  evidence?: BrangoOrderEvidence;
}

export interface BrangoPendingLink {
  id: string;
  code: string;
  reportedCustomer: string;
  reportedCommercial: string;
  receivedAt: string;
  dateKey: string;
  dateLabel: string;
  originCode: BrangoOriginCode;
  status: BrangoDeliveryStatus;
  reason: string;
  suggestedCustomers: string[];
}

export const DELIVERY_STATUS_META: Record<
  BrangoDeliveryStatus,
  { label: string; originCode: BrangoOriginCode }
> = {
  entregado: { label: "Entregado", originCode: "DELIVERED" },
  en_transito: { label: "En tránsito", originCode: "IN_TRANSIT" },
  pendiente: { label: "Pendiente", originCode: "PENDING" },
  observado: { label: "Observado", originCode: "OBSERVED" },
};

