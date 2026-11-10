import { VISITAS_EXTRAORDINARIAS_MOCK, MATERIAL_POP_MOCK } from "@/mocks/solicitudes.mock";
import { VisitaExtraordinaria, MaterialPOP } from "../models/solicitud.model";

export function getVisitasExtraordinarias(): VisitaExtraordinaria[] {
  return VISITAS_EXTRAORDINARIAS_MOCK;
}

export function getMaterialPOP(): MaterialPOP[] {
  return MATERIAL_POP_MOCK;
}
