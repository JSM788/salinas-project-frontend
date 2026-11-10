import type {
  MaterialPOP,
  VisitaExtraordinaria,
} from "@/modules/comercial/solicitudes/models/solicitud.model";

export const VISITAS_EXTRAORDINARIAS_MOCK: VisitaExtraordinaria[] = [
  {
    id: "sol-018",
    code: "SOL-018",
    clientName: "Pet Market San Borja",
    seller: "Ana Torres",
    reason: "Fuera de territorio",
    status: "Pendiente",
    date: "20 oct. 2026",
    hour: "10:00",
    justification: "Reforzar presencia de marca en punto de venta.",
  },
  {
    id: "sol-017",
    code: "SOL-017",
    clientName: "Mundo Animal Surco",
    seller: "Lucía Mendoza",
    reason: "Lanzamiento de línea",
    status: "Aprobada",
    date: "15 oct. 2026",
    hour: "11:00",
    justification: "Lanzamiento línea Bravery.",
  },
];

export const MATERIAL_POP_MOCK: MaterialPOP[] = [
  {
    id: "pop-012",
    code: "POP-012",
    clientName: "Pet Market San Borja",
    material: "Exhibidor",
    brand: "Bravery",
    quantity: 1,
    status: "Pendiente",
    reason: "Reforzar exhibición",
    observations: "Para mejorar la visibilidad de la marca en el punto de venta.",
  },
  {
    id: "pop-011",
    code: "POP-011",
    clientName: "Mundo Animal Surco",
    material: "Afiches",
    brand: "Bravery",
    quantity: 10,
    status: "Aprobada",
    reason: "Promoción mensual",
    observations: "Distribución en puntos de venta estratégicos.",
  },
];
