export interface Stop {
  id: string;
  order: number;
  code: string;
  name: string;
  tradeName?: string;
  district: string;
  address: string;
  ruc: string;
  phone: string;
  lat?: number | null;
  lng?: number | null;
  hasCoords: boolean;
  visitStatus?: "pending" | "active" | "completed" | "cancelled";
}

export interface VisitExecution {
  id: string;
  order: number;
  customerName: string;
  sedeCode: string;
  district: string;
  address: string;
  arrivedAt: string;
  endedAt: string;
  duration: string;
  result: "Atendida" | "Local cerrado" | "No atendida" | "Refrigerio" | "Pendiente";
  photosCount: number;
  gpsStatus: "Validado" | "No aplica";
}

export interface SellerWorkday {
  id: string;
  sellerCode: string;
  sellerName: string;
  zone: string;
  startedAt: string;
  endedAt: string;
  completedStops: number;
  totalStops: number;
  totalKm: number;
  status: "En jornada" | "Finalizada" | "Sin iniciar";
  visits: VisitExecution[];
}

export type WeekRoutesMap = Record<string, Stop[]>;

