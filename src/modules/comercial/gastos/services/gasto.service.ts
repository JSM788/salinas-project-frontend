import { GASTOS_MOCK } from "@/mocks/gastos.mock";
import { Gasto } from "../models/gasto.model";

export function getGastos(): Gasto[] {
  return GASTOS_MOCK;
}

export function getGastoById(id: string): Gasto | undefined {
  return GASTOS_MOCK.find(
    (g) => g.id === id || g.code.toLowerCase() === id.toLowerCase()
  );
}
