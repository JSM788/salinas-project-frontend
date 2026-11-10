"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import type { Cliente } from "@/modules/comercial/clientes/models/cliente.model";
import type { Gasto } from "@/modules/comercial/gastos/models/gasto.model";
import type {
  MaterialPOP,
  VisitaExtraordinaria,
} from "@/modules/comercial/solicitudes/models/solicitud.model";
import type { Cotizacion, Pedido, TimelineEvent } from "@/modules/comercial/ventas/models/venta.model";
import type {
  ExtractoImport,
  LineaCredito,
  PagoReportado,
} from "@/modules/finanzas/models/finanzas.model";
import { CLIENTES_MOCK } from "@/mocks/clientes.mock";
import { COTIZACIONES_MOCK, PEDIDOS_MOCK } from "@/mocks/ventas.mock";
import {
  ARCHIVO_FINANZAS_ULTIMA_ACTUALIZACION,
  LINEAS_CREDITO_MOCK,
  PAGOS_REPORTADOS_MOCK,
} from "@/mocks/finanzas.mock";
import { GASTOS_MOCK } from "@/mocks/gastos.mock";
import { MATERIAL_POP_MOCK, VISITAS_EXTRAORDINARIAS_MOCK } from "@/mocks/solicitudes.mock";
import { AGENDA_MOCK, JORNADAS_MOCK } from "@/mocks/visitas.mock";
import type { AgendaSlot, JornadaSummary } from "@/modules/comercial/visitas-jornadas/models/visita.model";
import { withProgress } from "@/modules/comercial/visitas-jornadas/lib/progress";
import { addMinutes } from "@/shared/lib/date";

/*
 * Demo store: the "database" of the clickable mock. It is seeded from the
 * coherent masters in src/mocks and persisted in localStorage, so edits made on
 * one screen are visible on every other screen and survive a reload. When the
 * real backend exists, this is the layer that gets replaced by API calls.
 */

const STORAGE_KEY = "aquamundo-demo-store";
// Bump when the seed changes so stale browser data is discarded.
const STORAGE_VERSION = 3;
export const SCENARIO_DAY = "16 oct. 2026";
const SCENARIO_START_TIME = "12:15";

export interface DemoState {
  version: number;
  /** Simulated wall clock ("HH:MM") on the scenario day; advances with every action. */
  clock: string;
  clientes: Cliente[];
  cotizaciones: Cotizacion[];
  pedidos: Pedido[];
  pagos: PagoReportado[];
  lineas: LineaCredito[];
  gastos: Gasto[];
  agenda: AgendaSlot[];
  jornadas: JornadaSummary[];
  visitasExtra: VisitaExtraordinaria[];
  pops: MaterialPOP[];
  extracto: ExtractoImport | null;
  archivoActualizacion: string;
}

function buildSeed(): DemoState {
  return {
    version: STORAGE_VERSION,
    clock: SCENARIO_START_TIME,
    clientes: CLIENTES_MOCK.map((c) => ({ ...c })),
    cotizaciones: COTIZACIONES_MOCK,
    pedidos: PEDIDOS_MOCK,
    pagos: PAGOS_REPORTADOS_MOCK,
    lineas: LINEAS_CREDITO_MOCK,
    gastos: GASTOS_MOCK,
    agenda: AGENDA_MOCK,
    jornadas: JORNADAS_MOCK,
    visitasExtra: VISITAS_EXTRAORDINARIAS_MOCK,
    pops: MATERIAL_POP_MOCK,
    extracto: null,
    archivoActualizacion: ARCHIVO_FINANZAS_ULTIMA_ACTUALIZACION,
  };
}

type Action =
  | { type: "hydrate"; state: DemoState }
  | { type: "reset" }
  | { type: "conciliar"; ids: string[] }
  | { type: "observar"; id: string; motivo: string }
  | { type: "confirmarReserva"; pedidoId: string }
  | { type: "importarExtracto"; extracto: ExtractoImport }
  | { type: "limpiarExtracto" }
  | { type: "asignarVendedor"; clienteIds: string[]; seller: string }
  | { type: "toggleBloqueoLinea"; id: string }
  | { type: "revisarGasto"; id: string }
  | { type: "reasignarPendientes"; jornadaId: string; toSeller: string }
  | { type: "programarVisita"; slot: Omit<AgendaSlot, "id" | "status"> }
  | { type: "resolverVisitaExtra"; id: string; status: "Aprobada" | "Rechazada"; notes?: string }
  | { type: "resolverPop"; id: string; status: "Aprobada" | "Rechazada"; notes?: string }
  | { type: "agregarCliente"; data: NuevoClienteInput };

/** Data captured by the "Nuevo cliente" form; the store fills in code, credit and history. */
export interface NuevoClienteInput {
  name: string;
  ruc: string;
  district: string;
  address: string;
  seller: string;
}

const MONTH_LABELS = ["May", "Jun", "Jul", "Ago", "Sep", "Oct"];

function nextClienteNumber(clientes: Cliente[]): number {
  const numbers = clientes.map((c) => Number(c.id.replace(/\D/g, "")) || 0);
  return Math.max(0, ...numbers) + 1;
}

function pedidoEvent(
  state: DemoState,
  title: string,
  source: string,
  detail: string
): TimelineEvent {
  return { date: SCENARIO_DAY, time: state.clock, type: "Pago", title, source, detail };
}

function withPedido(
  state: DemoState,
  pedidoId: string,
  update: (pedido: Pedido) => Pedido
): Pedido[] {
  return state.pedidos.map((p) => (p.id === pedidoId ? update(p) : p));
}

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case "hydrate":
      return action.state;

    case "reset":
      return buildSeed();

    case "conciliar": {
      let next = state;
      for (const id of action.ids) {
        const pago = next.pagos.find((p) => p.id === id);
        if (!pago || pago.status === "Conciliado") continue;
        const detail = next.extracto
          ? "Conciliado con el extracto importado."
          : "Conciliado manualmente por Finanzas.";
        const event = pedidoEvent(next, "Pago conciliado", "Finanzas", detail);
        next = {
          ...next,
          clock: addMinutes(next.clock, 1),
          pagos: next.pagos.map((p) => (p.id === id ? { ...p, status: "Conciliado" } : p)),
          pedidos: withPedido(next, pago.orderId, (pedido) => ({
            ...pedido,
            paymentStatus: "Conciliado",
            timeline: [...pedido.timeline, event],
          })),
        };
      }
      return next;
    }

    case "observar": {
      const pago = state.pagos.find((p) => p.id === action.id);
      if (!pago) return state;
      const event = pedidoEvent(state, "Pago observado", "Finanzas", action.motivo);
      return {
        ...state,
        clock: addMinutes(state.clock, 1),
        pagos: state.pagos.map((p) =>
          p.id === action.id ? { ...p, status: "Observado", notes: action.motivo } : p
        ),
        pedidos: withPedido(state, pago.orderId, (pedido) => ({
          ...pedido,
          paymentStatus: "Observado",
          timeline: [...pedido.timeline, event],
        })),
      };
    }

    case "confirmarReserva": {
      const pedido = state.pedidos.find((p) => p.id === action.pedidoId);
      // SAP only confirms stock once the payment is reconciled.
      if (!pedido || pedido.paymentStatus !== "Conciliado") return state;
      const event = pedidoEvent(
        state,
        "Reserva confirmada en SAP",
        "Integración SAP",
        "SAP validó el pedido y confirmó la reserva de stock."
      );
      return {
        ...state,
        clock: addMinutes(state.clock, 2),
        pedidos: withPedido(state, action.pedidoId, (p) => ({
          ...p,
          reservationStatus: "Confirmada",
          orderStatus: "Validado",
          timeline: [...p.timeline, event],
        })),
      };
    }

    case "importarExtracto":
      return { ...state, extracto: action.extracto, archivoActualizacion: action.extracto.importedAt };

    case "limpiarExtracto":
      return { ...state, extracto: null };

    case "asignarVendedor":
      return {
        ...state,
        clientes: state.clientes.map((c) =>
          action.clienteIds.includes(c.id) ? { ...c, seller: action.seller } : c
        ),
      };

    case "toggleBloqueoLinea":
      return {
        ...state,
        lineas: state.lineas.map((l) =>
          l.id === action.id
            ? { ...l, status: l.status === "Bloqueada" ? "Activa" : "Bloqueada" }
            : l
        ),
      };

    case "revisarGasto":
      return {
        ...state,
        gastos: state.gastos.map((g) => (g.id === action.id ? { ...g, status: "Revisado" } : g)),
      };

    case "reasignarPendientes": {
      const origen = state.jornadas.find((j) => j.id === action.jornadaId);
      if (!origen || origen.seller === action.toSeller) return state;
      const agenda = state.agenda.map((slot) =>
        slot.seller === origen.seller && slot.status === "programada"
          ? { ...slot, seller: action.toSeller }
          : slot
      );
      return { ...state, agenda, jornadas: withProgress(state.jornadas, agenda) };
    }

    case "programarVisita": {
      const nextNumber = state.agenda.length + 1;
      const agenda: AgendaSlot[] = [
        ...state.agenda,
        { ...action.slot, id: `ag-${String(nextNumber).padStart(2, "0")}`, status: "programada" },
      ];
      return { ...state, agenda, jornadas: withProgress(state.jornadas, agenda) };
    }

    case "resolverVisitaExtra":
      return {
        ...state,
        visitasExtra: state.visitasExtra.map((v) =>
          v.id === action.id
            ? { ...v, status: action.status, decisionNotes: action.notes || v.decisionNotes }
            : v
        ),
      };

    case "resolverPop":
      return {
        ...state,
        pops: state.pops.map((p) =>
          p.id === action.id
            ? { ...p, status: action.status, decisionNotes: action.notes || p.decisionNotes }
            : p
        ),
      };

    case "agregarCliente": {
      const number = nextClienteNumber(state.clientes);
      const padded = String(number).padStart(3, "0");
      const { data } = action;
      // Reuse the zone and city of an existing client in the same district.
      const sameDistrict = state.clientes.find((c) => c.district === data.district);
      const cliente: Cliente = {
        id: `cl-${padded}`,
        code: `CL-${padded}`,
        name: data.name.trim(),
        ruc: data.ruc.trim(),
        district: data.district,
        city: sameDistrict?.city ?? "Lima",
        address: data.address.trim() || "Sin dirección registrada",
        seller: data.seller,
        zone: sameDistrict?.zone ?? "Sin zona",
        condition: "Al día",
        since: SCENARIO_DAY,
        lastPurchaseDate: "Sin compras",
        monthlyPurchases: 0,
        availableCredit: 0,
        expiredDebt: 0,
        creditLimit: 0,
        currentDebt: 0,
        purchaseHistory: MONTH_LABELS.map((month) => ({ month, amount: 0 })),
      };
      return { ...state, clientes: [...state.clientes, cliente] };
    }

    default:
      return state;
  }
}

function readStored(): DemoState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoState;
    return parsed.version === STORAGE_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

function writeStored(state: DemoState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be blocked (private mode); the demo keeps working in memory.
  }
}

interface DemoContextValue extends DemoState {
  /** False until the saved browser state has been applied. */
  ready: boolean;
  conciliarPagos: (ids: string[]) => void;
  observarPago: (id: string, motivo: string) => void;
  confirmarReservaSap: (pedidoId: string) => void;
  importarExtracto: (extracto: ExtractoImport) => void;
  limpiarExtracto: () => void;
  asignarVendedor: (clienteIds: string[], seller: string) => void;
  toggleBloqueoLinea: (id: string) => void;
  revisarGasto: (id: string) => void;
  reasignarPendientes: (jornadaId: string, toSeller: string) => void;
  programarVisita: (slot: Omit<AgendaSlot, "id" | "status">) => void;
  resolverVisitaExtra: (id: string, status: "Aprobada" | "Rechazada", notes?: string) => void;
  resolverPop: (id: string, status: "Aprobada" | "Rechazada", notes?: string) => void;
  agregarCliente: (data: NuevoClienteInput) => void;
  reiniciarDemo: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export const DemoStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, undefined, buildSeed);
  const [ready, setReady] = useState(false);

  // Apply saved state after mount so server and first client render match.
  useEffect(() => {
    const stored = readStored();
    if (stored) dispatch({ type: "hydrate", state: stored });
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) writeStored(state);
  }, [state, ready]);

  const value = useMemo<DemoContextValue>(
    () => ({
      ...state,
      ready,
      conciliarPagos: (ids) => dispatch({ type: "conciliar", ids }),
      observarPago: (id, motivo) => dispatch({ type: "observar", id, motivo }),
      confirmarReservaSap: (pedidoId) => dispatch({ type: "confirmarReserva", pedidoId }),
      importarExtracto: (extracto) => dispatch({ type: "importarExtracto", extracto }),
      limpiarExtracto: () => dispatch({ type: "limpiarExtracto" }),
      asignarVendedor: (clienteIds, seller) =>
        dispatch({ type: "asignarVendedor", clienteIds, seller }),
      toggleBloqueoLinea: (id) => dispatch({ type: "toggleBloqueoLinea", id }),
      revisarGasto: (id) => dispatch({ type: "revisarGasto", id }),
      reasignarPendientes: (jornadaId, toSeller) =>
        dispatch({ type: "reasignarPendientes", jornadaId, toSeller }),
      programarVisita: (slot) => dispatch({ type: "programarVisita", slot }),
      resolverVisitaExtra: (id, status, notes) =>
        dispatch({ type: "resolverVisitaExtra", id, status, notes }),
      resolverPop: (id, status, notes) => dispatch({ type: "resolverPop", id, status, notes }),
      agregarCliente: (data) => dispatch({ type: "agregarCliente", data }),
      reiniciarDemo: () => dispatch({ type: "reset" }),
    }),
    [state, ready]
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
};

export function useDemo(): DemoContextValue {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo debe usarse dentro de DemoStoreProvider");
  return context;
}

/**
 * True when the client has a statically generated ficha page. The app is a static
 * export, so only the seeded clients have a `/comercial/clientes/[id]/` route; clients
 * created at runtime exist in the store but not as a page.
 */
export function clienteTieneFicha(id: string): boolean {
  return CLIENTES_MOCK.some((c) => c.id === id);
}

/** Seller names present in the master data (clients, agenda and workdays), sorted. */
export function useSellerNames(): string[] {
  const { clientes, agenda, jornadas } = useDemo();
  return useMemo(() => {
    const names = new Set<string>();
    for (const c of clientes) names.add(c.seller);
    for (const a of agenda) names.add(a.seller);
    for (const j of jornadas) names.add(j.seller);
    names.delete("Sin asignar");
    return Array.from(names).sort((a, b) => a.localeCompare(b, "es"));
  }, [clientes, agenda, jornadas]);
}

/** Live order from the store, falling back to the static seed passed by the page. */
export function useLivePedido(seed: Pedido): Pedido {
  const { pedidos } = useDemo();
  return useMemo(() => pedidos.find((p) => p.id === seed.id) ?? seed, [pedidos, seed]);
}

export function useLiveCotizacion(seed: Cotizacion): Cotizacion {
  const { cotizaciones } = useDemo();
  return useMemo(() => cotizaciones.find((c) => c.id === seed.id) ?? seed, [cotizaciones, seed]);
}

export function useLiveCliente(seed: Cliente): Cliente {
  const { clientes } = useDemo();
  return useMemo(() => clientes.find((c) => c.id === seed.id) ?? seed, [clientes, seed]);
}
