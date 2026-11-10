export interface Gasto {
  id: string;
  code: string;
  seller: string;
  category: "Peaje" | "Combustible" | "Alimentación" | "Estacionamiento" | "Movilidad";
  date: string;
  hour?: string;
  total: number;
  status: "Por revisar" | "Revisado";
  rucProvider: string;
  observations: string;
  receiptImage?: string;
}
