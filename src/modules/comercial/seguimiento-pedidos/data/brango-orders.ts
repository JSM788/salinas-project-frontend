import {
  BrangoDeliveryStatus,
  BrangoPendingLink,
  BrangoTrackedOrder,
  DELIVERY_STATUS_META,
} from "../models/brango-order.model";

function buildTimeline(
  status: BrangoDeliveryStatus,
  updatedAt: string,
  noteOverride?: string
) {
  const stepPending = {
    time: "08:15",
    status: "pendiente" as const,
    label: "Pendiente",
    description: "Pedido recibido en Brango.",
    completed: true,
    isCurrent: status === "pendiente",
  };

  if (status === "pendiente") {
    return [stepPending];
  }

  const stepTransit = {
    time: status === "en_transito" ? updatedAt : "09:10",
    status: "en_transito" as const,
    label: "En tránsito",
    description: "Pedido en ruta de entrega.",
    completed: true,
    isCurrent: status === "en_transito",
  };

  if (status === "en_transito") {
    return [stepPending, stepTransit];
  }

  if (status === "observado") {
    return [
      stepPending,
      stepTransit,
      {
        time: updatedAt,
        status: "observado" as const,
        label: "Observado",
        description: noteOverride ?? "Local cerrado al momento de la visita.",
        completed: true,
        isCurrent: true,
      },
    ];
  }

  return [
    stepPending,
    stepTransit,
    {
      time: updatedAt,
      status: "entregado" as const,
      label: "Entregado",
      description: noteOverride ?? "Entrega confirmada por transportista.",
      completed: true,
      isCurrent: true,
    },
  ];
}

function buildHistory(
  code: string,
  status: BrangoDeliveryStatus,
  dateLabel: string,
  updatedAt: string,
  noteOverride?: string
) {
  const base = [
    {
      id: `${code}-ev-1`,
      timestamp: `${dateLabel} · 08:15`,
      originCode: "PENDING" as const,
      status: "pendiente" as const,
      actor: "Webhook Brango",
      note: "Orden registrada e ingresada a programación de despacho.",
    },
  ];

  if (status === "pendiente") return base;

  const transit = {
    id: `${code}-ev-2`,
    timestamp: `${dateLabel} · ${status === "en_transito" ? updatedAt : "09:10"}`,
    originCode: "IN_TRANSIT" as const,
    status: "en_transito" as const,
    actor: "Unidad reparto Brango",
    note: "Salida de almacén confirmada en hoja de ruta.",
  };

  if (status === "en_transito") return [...base, transit];

  const finalMeta = DELIVERY_STATUS_META[status];
  return [
    ...base,
    transit,
    {
      id: `${code}-ev-3`,
      timestamp: `${dateLabel} · ${updatedAt}`,
      originCode: finalMeta.originCode,
      status,
      actor: "Transportista Brango",
      note:
        noteOverride ??
        (status === "observado"
          ? "Entrega observada en punto de destino; reprogramación pendiente."
          : "Entrega confirmada con fotografía de cargo."),
    },
  ];
}

function createOrder(params: {
  id: string;
  code: string;
  customerName: string;
  commercialName: string;
  status: BrangoDeliveryStatus;
  updatedAt: string;
  dateKey?: string;
  dateLabel?: string;
  receivedBy?: string;
  noteOverride?: string;
}): BrangoTrackedOrder {
  const dateKey = params.dateKey ?? "2026-11-01";
  const dateLabel = params.dateLabel ?? "01 nov 2026";
  const meta = DELIVERY_STATUS_META[params.status];

  return {
    id: params.id,
    code: params.code,
    customerName: params.customerName,
    commercialName: params.commercialName,
    status: params.status,
    originCode: meta.originCode,
    updatedAt: params.updatedAt,
    dateKey,
    dateLabel,
    deliveryDateLabel: `${dateLabel} · ${params.updatedAt}`,
    origin: "Brango",
    timeline: buildTimeline(params.status, params.updatedAt, params.noteOverride),
    history: buildHistory(
      params.code,
      params.status,
      dateLabel,
      params.updatedAt,
      params.noteOverride
    ),
    evidence:
      params.status === "entregado"
        ? {
            caption: "Fotografía de ejemplo",
            receivedBy: params.receivedBy ?? "Recepción en tienda",
            capturedAt: `${dateLabel} · ${params.updatedAt}`,
            cargoTag: `${params.code} · Cargo firmado`,
            notes: "Bultos sellados entregados conformes en mostrador.",
          }
        : undefined,
  };
}

/**
 * Dataset preliminar para visualizar el flujo de seguimiento Brango.
 * Día 01 nov 2026: 24 pedidos (18 entregados, 4 en tránsito, 2 pendientes/observados).
 */
export const INITIAL_BRANGO_ORDERS: BrangoTrackedOrder[] = [
  createOrder({
    id: "ord-1042",
    code: "BR-1042",
    customerName: "Pet Market San Borja",
    commercialName: "Ana Torres",
    status: "entregado",
    updatedAt: "10:20",
    receivedBy: "K. Paredes (Encargada de tienda)",
  }),
  createOrder({
    id: "ord-1043",
    code: "BR-1043",
    customerName: "Veterinaria Huellitas",
    commercialName: "Carlos Rojas",
    status: "en_transito",
    updatedAt: "10:10",
  }),
  createOrder({
    id: "ord-1044",
    code: "BR-1044",
    customerName: "Distribuidora Patitas",
    commercialName: "Ana Torres",
    status: "pendiente",
    updatedAt: "09:50",
  }),
  createOrder({
    id: "ord-1045",
    code: "BR-1045",
    customerName: "Pet Center La Molina",
    commercialName: "Carlos Rojas",
    status: "observado",
    updatedAt: "09:40",
    noteOverride: "Recepción solicitó reenvío en horario de tarde.",
  }),
  createOrder({
    id: "ord-1046",
    code: "BR-1046",
    customerName: "Agrovet San Miguel",
    commercialName: "Ana Torres",
    status: "entregado",
    updatedAt: "09:25",
    receivedBy: "M. Salazar",
  }),
  createOrder({
    id: "ord-1047",
    code: "BR-1047",
    customerName: "Acuario Pacífico Sur",
    commercialName: "Carlos Rojas",
    status: "entregado",
    updatedAt: "09:18",
  }),
  createOrder({
    id: "ord-1048",
    code: "BR-1048",
    customerName: "Clínica Animal Miraflores",
    commercialName: "Ana Torres",
    status: "en_transito",
    updatedAt: "09:15",
  }),
  createOrder({
    id: "ord-1049",
    code: "BR-1049",
    customerName: "Mascotas del Norte SAC",
    commercialName: "Luis Vega",
    status: "entregado",
    updatedAt: "09:12",
  }),
  createOrder({
    id: "ord-1050",
    code: "BR-1050",
    customerName: "Pet Shop Barranco",
    commercialName: "Ana Torres",
    status: "entregado",
    updatedAt: "09:05",
  }),
  createOrder({
    id: "ord-1051",
    code: "BR-1051",
    customerName: "Forrajes & Mascotas Surco",
    commercialName: "Carlos Rojas",
    status: "entregado",
    updatedAt: "09:00",
  }),
  createOrder({
    id: "ord-1052",
    code: "BR-1052",
    customerName: "Veterinaria El Bosque",
    commercialName: "Luis Vega",
    status: "en_transito",
    updatedAt: "08:55",
  }),
  createOrder({
    id: "ord-1053",
    code: "BR-1053",
    customerName: "Centro Canino Lince",
    commercialName: "Ana Torres",
    status: "entregado",
    updatedAt: "08:52",
  }),
  createOrder({
    id: "ord-1054",
    code: "BR-1054",
    customerName: "AquaPets Jesús María",
    commercialName: "Carlos Rojas",
    status: "entregado",
    updatedAt: "08:48",
  }),
  createOrder({
    id: "ord-1055",
    code: "BR-1055",
    customerName: "Distribuidora San Isidro",
    commercialName: "Ana Torres",
    status: "entregado",
    updatedAt: "08:45",
  }),
  createOrder({
    id: "ord-1056",
    code: "BR-1056",
    customerName: "Pet Boutique Magdalena",
    commercialName: "Luis Vega",
    status: "entregado",
    updatedAt: "08:42",
  }),
  createOrder({
    id: "ord-1057",
    code: "BR-1057",
    customerName: "Agropecuaria Los Olivos",
    commercialName: "Carlos Rojas",
    status: "en_transito",
    updatedAt: "08:40",
  }),
  createOrder({
    id: "ord-1058",
    code: "BR-1058",
    customerName: "Mundo Animal Pueblo Libre",
    commercialName: "Ana Torres",
    status: "entregado",
    updatedAt: "08:36",
  }),
  createOrder({
    id: "ord-1059",
    code: "BR-1059",
    customerName: "Veterinaria Vida Animal",
    commercialName: "Luis Vega",
    status: "entregado",
    updatedAt: "08:33",
  }),
  createOrder({
    id: "ord-1060",
    code: "BR-1060",
    customerName: "Pet Store Chorrillos",
    commercialName: "Carlos Rojas",
    status: "entregado",
    updatedAt: "08:30",
  }),
  createOrder({
    id: "ord-1061",
    code: "BR-1061",
    customerName: "Acuario Tropical Lima",
    commercialName: "Ana Torres",
    status: "entregado",
    updatedAt: "08:28",
  }),
  createOrder({
    id: "ord-1062",
    code: "BR-1062",
    customerName: "Alimentos Caninos Ate",
    commercialName: "Luis Vega",
    status: "entregado",
    updatedAt: "08:25",
  }),
  createOrder({
    id: "ord-1063",
    code: "BR-1063",
    customerName: "VetCare San Borja",
    commercialName: "Carlos Rojas",
    status: "entregado",
    updatedAt: "08:22",
  }),
  createOrder({
    id: "ord-1064",
    code: "BR-1064",
    customerName: "Pet Home Surquillo",
    commercialName: "Ana Torres",
    status: "entregado",
    updatedAt: "08:19",
  }),
  createOrder({
    id: "ord-1065",
    code: "BR-1065",
    customerName: "BioMascotas Breña",
    commercialName: "Luis Vega",
    status: "entregado",
    updatedAt: "08:16",
  }),
  // Registros de fecha anterior para probar filtro de fecha
  createOrder({
    id: "ord-1039",
    code: "BR-1039",
    customerName: "Pet Market San Borja",
    commercialName: "Ana Torres",
    status: "entregado",
    updatedAt: "17:40",
    dateKey: "2026-10-31",
    dateLabel: "31 oct 2026",
  }),
  createOrder({
    id: "ord-1040",
    code: "BR-1040",
    customerName: "Agrovet San Miguel",
    commercialName: "Carlos Rojas",
    status: "entregado",
    updatedAt: "16:15",
    dateKey: "2026-10-31",
    dateLabel: "31 oct 2026",
  }),
];

export const INITIAL_PENDING_LINKS: BrangoPendingLink[] = [
  {
    id: "lnk-201",
    code: "BR-1066",
    reportedCustomer: "PET MARKET SB EIRL",
    reportedCommercial: "Ana Torres",
    receivedAt: "10:18",
    dateKey: "2026-11-01",
    dateLabel: "01 nov 2026",
    originCode: "DELIVERED",
    status: "entregado",
    reason: "Nombre comercial recibido desde Brango sin código de cliente vinculado.",
    suggestedCustomers: [
      "Pet Market San Borja",
      "Pet Home Surquillo",
      "Pet Store Chorrillos",
    ],
  },
  {
    id: "lnk-202",
    code: "BR-1067",
    reportedCustomer: "CLINICA HUELLAS SAC",
    reportedCommercial: "Carlos Rojas",
    receivedAt: "09:56",
    dateKey: "2026-11-01",
    dateLabel: "01 nov 2026",
    originCode: "IN_TRANSIT",
    status: "en_transito",
    reason: "Razón social distinta a la registrada en cartera de clientes.",
    suggestedCustomers: [
      "Veterinaria Huellitas",
      "Clínica Animal Miraflores",
      "VetCare San Borja",
    ],
  },
  {
    id: "lnk-203",
    code: "BR-1068",
    reportedCustomer: "DIST PATITAS LIMA",
    reportedCommercial: "Sin asignar",
    receivedAt: "09:12",
    dateKey: "2026-11-01",
    dateLabel: "01 nov 2026",
    originCode: "PENDING",
    status: "pendiente",
    reason: "Pedido registrado directamente en Brango sin comercial asociado.",
    suggestedCustomers: [
      "Distribuidora Patitas",
      "Distribuidora San Isidro",
      "Mascotas del Norte SAC",
    ],
  },
];

export const AVAILABLE_DATE_FILTERS = [
  { value: "2026-11-01", label: "01 nov 2026" },
  { value: "2026-10-31", label: "31 oct 2026" },
  { value: "all", label: "Todas las fechas" },
] as const;

export const AVAILABLE_COMMERCIALS = [
  "Ana Torres",
  "Carlos Rojas",
  "Luis Vega",
] as const;

