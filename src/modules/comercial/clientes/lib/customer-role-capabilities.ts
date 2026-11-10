import type { Session } from "@/shared/api/contracts";

export type CustomerRole = "manager" | "commercial" | "merchandiser";

export type FichaTabId = "resumen" | "compras" | "credito" | "actividad";

export interface CustomerRoleCapabilities {
  role: CustomerRole;
  /** Ve toda la cartera de la empresa vs. solo sus clientes asignados */
  canViewAllCompanyCustomers: boolean;
  /** Puede registrar clientes en el padrón e importar Excel */
  canManageDirectory: boolean;
  /** Ve la pestaña de Asignaciones y reasigna Comercial / Mercaderista */
  canAssignResponsibles: boolean;
  /** Puede filtrar por vendedor/responsable */
  canFilterByAssignee: boolean;
  /** Puede ver condición financiera ("Al día" / "Con atraso"), deuda y línea de crédito */
  canSeeFinancials: boolean;
  /** Pestañas habilitadas en la Ficha del Cliente (/comercial/clientes/[id]) */
  fichaTabs: FichaTabId[];
  /** Acciones operativas habilitadas cuando operen desde Web (paridad Mobile) */
  operationalActions: {
    canCreateOrderOrQuote: boolean;
    canReportPayment: boolean;
    canRegisterShelfAudit: boolean;
    canRequestPopMaterial: boolean;
  };
}

export function resolveCustomerRole(session: Session | null | undefined): CustomerRole {
  if (!session) return "manager";
  if (session.scope === "platform") return "manager";
  if (session.permissions?.includes("manage_customers")) return "manager";
  return session.role;
}

export function getCustomerRoleCapabilities(
  session: Session | null | undefined,
): CustomerRoleCapabilities {
  const role = resolveCustomerRole(session);

  if (role === "manager") {
    return {
      role: "manager",
      canViewAllCompanyCustomers: true,
      canManageDirectory: true,
      canAssignResponsibles: true,
      canFilterByAssignee: true,
      canSeeFinancials: true,
      fichaTabs: ["resumen", "compras", "credito", "actividad"],
      operationalActions: {
        canCreateOrderOrQuote: false,
        canReportPayment: false,
        canRegisterShelfAudit: false,
        canRequestPopMaterial: false,
      },
    };
  }

  if (role === "commercial") {
    return {
      role: "commercial",
      canViewAllCompanyCustomers: false,
      canManageDirectory: false,
      canAssignResponsibles: false,
      canFilterByAssignee: false,
      canSeeFinancials: true,
      fichaTabs: ["compras", "credito", "actividad"],
      operationalActions: {
        canCreateOrderOrQuote: true,
        canReportPayment: true,
        canRegisterShelfAudit: false,
        canRequestPopMaterial: false,
      },
    };
  }

  return {
    role: "merchandiser",
    canViewAllCompanyCustomers: false,
    canManageDirectory: false,
    canAssignResponsibles: false,
    canFilterByAssignee: false,
    canSeeFinancials: false,
    fichaTabs: ["actividad"],
    operationalActions: {
      canCreateOrderOrQuote: false,
      canReportPayment: false,
      canRegisterShelfAudit: true,
      canRequestPopMaterial: true,
    },
  };
}

