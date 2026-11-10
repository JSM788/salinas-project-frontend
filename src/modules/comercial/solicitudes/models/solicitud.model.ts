export interface VisitaExtraordinaria {
  id: string;
  code: string;
  clientName: string;
  seller: string;
  reason: string;
  status: "Pendiente" | "Aprobada" | "Rechazada";
  date: string;
  hour: string;
  justification: string;
  /** Supervisor's note saved when the request is approved or rejected. */
  decisionNotes?: string;
}

export interface MaterialPOP {
  id: string;
  code: string;
  clientName: string;
  material: string;
  brand: string;
  quantity: number;
  status: "Pendiente" | "Aprobada" | "Rechazada";
  reason: string;
  observations: string;
  /** Supervisor's note saved when the request is approved or rejected. */
  decisionNotes?: string;
}
