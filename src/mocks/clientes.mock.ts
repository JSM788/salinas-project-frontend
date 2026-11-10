export interface MockCliente {
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

export const CLIENTES_MOCK: MockCliente[] = [
  {
    id: "cl-001",
    code: "CL-001",
    name: "Pet Market San Borja",
    ruc: "20123456789",
    district: "San Borja",
    city: "Lima",
    address: "Av. San Borja Norte 1234, San Borja, Lima",
    seller: "Ana Torres",
    zone: "Lima Centro",
    condition: "Al día",
    since: "12 ene. 2023",
    lastPurchaseDate: "16 oct. 2026",
    monthlyPurchases: 3200,
    availableCredit: 2400,
    expiredDebt: 0,
    creditLimit: 5000,
    currentDebt: 2600,
    purchaseHistory: [{ month: "May", amount: 2600 }, { month: "Jun", amount: 4500 }, { month: "Jul", amount: 3900 }, { month: "Ago", amount: 4800 }, { month: "Sep", amount: 2900 }, { month: "Oct", amount: 3200 }],
  },
  {
    id: "cl-002",
    code: "CL-002",
    name: "Veterinaria Huellitas",
    ruc: "20456789012",
    district: "Miraflores",
    city: "Lima",
    address: "Av. Larco 890, Miraflores, Lima",
    seller: "Carlos Rojas",
    zone: "Lima Centro",
    condition: "Con atraso",
    since: "04 mar. 2022",
    lastPurchaseDate: "14 oct. 2026",
    monthlyPurchases: 850,
    availableCredit: 500,
    expiredDebt: 1200,
    creditLimit: 3000,
    currentDebt: 2500,
    purchaseHistory: [{ month: "May", amount: 1500 }, { month: "Jun", amount: 2100 }, { month: "Jul", amount: 1700 }, { month: "Ago", amount: 2400 }, { month: "Sep", amount: 1600 }, { month: "Oct", amount: 850 }],
  },
  {
    id: "cl-003",
    code: "CL-003",
    name: "Mundo Animal Surco",
    ruc: "20567890123",
    district: "Santiago de Surco",
    city: "Lima",
    address: "Av. Primavera 1420, Surco, Lima",
    seller: "Lucía Mendoza",
    zone: "Lima Sur",
    condition: "Al día",
    since: "18 ago. 2023",
    lastPurchaseDate: "15 oct. 2026",
    monthlyPurchases: 620,
    availableCredit: 6000,
    expiredDebt: 0,
    creditLimit: 8000,
    currentDebt: 2000,
    purchaseHistory: [{ month: "May", amount: 3800 }, { month: "Jun", amount: 4200 }, { month: "Jul", amount: 5100 }, { month: "Ago", amount: 3900 }, { month: "Sep", amount: 4700 }, { month: "Oct", amount: 620 }],
  },
  {
    id: "cl-004",
    code: "CL-004",
    name: "Mascotas y Más",
    ruc: "20601234567",
    district: "Santiago de Surco",
    city: "Lima",
    address: "Av. Benavides 3890, Santiago de Surco, Lima",
    seller: "Carlos Díaz",
    zone: "Lima Sur",
    condition: "Al día",
    since: "05 nov. 2021",
    lastPurchaseDate: "13 oct. 2026",
    monthlyPurchases: 980,
    availableCredit: 3500,
    expiredDebt: 0,
    creditLimit: 4000,
    currentDebt: 500,
    purchaseHistory: [{ month: "May", amount: 2200 }, { month: "Jun", amount: 2600 }, { month: "Jul", amount: 3100 }, { month: "Ago", amount: 2500 }, { month: "Sep", amount: 2700 }, { month: "Oct", amount: 980 }],
  },
  {
    id: "cl-005",
    code: "CL-005",
    name: "Clínica Vet. San Miguel",
    ruc: "20609876543",
    district: "San Miguel",
    city: "Lima",
    address: "Av. La Marina 2100, San Miguel, Lima",
    seller: "Ana Torres",
    zone: "Lima Oeste",
    condition: "Al día",
    since: "22 feb. 2024",
    lastPurchaseDate: "15 oct. 2026",
    monthlyPurchases: 1330,
    availableCredit: 4200,
    expiredDebt: 0,
    creditLimit: 6000,
    currentDebt: 1800,
    purchaseHistory: [{ month: "May", amount: 3000 }, { month: "Jun", amount: 3400 }, { month: "Jul", amount: 3900 }, { month: "Ago", amount: 3600 }, { month: "Sep", amount: 4100 }, { month: "Oct", amount: 1330 }],
  },
  {
    id: "cl-006",
    code: "CL-006",
    name: "Agrovet San Miguel",
    ruc: "20551234567",
    district: "San Miguel",
    city: "Lima",
    address: "Av. Universitaria 1450, San Miguel, Lima",
    seller: "Luis Ramos",
    zone: "Lima Oeste",
    condition: "Con atraso",
    since: "14 sep. 2022",
    lastPurchaseDate: "12 oct. 2026",
    monthlyPurchases: 1100,
    availableCredit: 300,
    expiredDebt: 950,
    creditLimit: 2500,
    currentDebt: 2200,
    purchaseHistory: [{ month: "May", amount: 1800 }, { month: "Jun", amount: 1200 }, { month: "Jul", amount: 1600 }, { month: "Ago", amount: 900 }, { month: "Sep", amount: 1500 }, { month: "Oct", amount: 1100 }],
  },
];
