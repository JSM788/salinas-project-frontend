export interface MockProducto {
  id: string;
  sku: string;
  name: string;
  brand: string;
  stock: number;
  price: number;
  image?: string;
}

export const PRODUCTOS_MOCK: MockProducto[] = [
  {
    id: "prod-001",
    sku: "BRA-AD-7",
    name: "Bravery Adulto 7 kg",
    brand: "Bravery",
    stock: 8,
    price: 180.0,
  },
  {
    id: "prod-002",
    sku: "BRA-GA-2",
    name: "Bravery Gato 2 kg",
    brand: "Bravery",
    stock: 0,
    price: 140.0,
  },
  {
    id: "prod-003",
    sku: "BRA-PU-7",
    name: "Bravery Puppy 7 kg",
    brand: "Bravery",
    stock: 6,
    price: 130.0,
  },
  {
    id: "prod-004",
    sku: "RC-MAX15",
    name: "Royal Canin Maxi Adult 15 kg",
    brand: "Royal Canin",
    stock: 25,
    price: 340.0,
  },
  {
    id: "prod-005",
    sku: "PP-AD15",
    name: "Pro Plan Adulto 15 kg",
    brand: "Pro Plan",
    stock: 18,
    price: 310.0,
  },
  {
    id: "prod-006",
    sku: "HIL-SCI12",
    name: "Hill's Science Diet 12 kg",
    brand: "Hill's",
    stock: 14,
    price: 325.0,
  },
];
