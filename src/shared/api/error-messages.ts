import type { FieldIssue } from "./error-contract";

export const apiErrorMessages: Record<string, string> = {
  invalid_request: "Revisa los datos ingresados.",
  invalid_audit: "Revisa los datos de la auditoría.",
  internal_error: "No se pudo completar la operación. Intenta nuevamente más tarde.",
  backend_unavailable: "No se pudo conectar con el servicio. Intenta nuevamente.",
  invalid_api_response: "No se pudo procesar la respuesta del servicio.",
  payload_too_large: "Los datos enviados superan el tamaño permitido.",
  route_not_found: "Esta función no está disponible.",
  web_access_denied: "Tu cuenta no tiene acceso a la web. Ingresa desde la aplicación móvil.",
  platform_role_in_use:
    "No se puede cambiar el rol mientras el usuario tenga clientes asignados, visitas pendientes o una jornada activa. Resuelve esas asignaciones y actividades antes de cambiarlo.",
  platform_forbidden:
    "Esta sección está disponible solo para el propietario de la plataforma.",
  platform_scope_only:
    "La cuenta global administra empresas y usuarios; no accede a la operación de una empresa.",
  platform_company_not_found:
    "La empresa ya no está disponible. Actualiza el listado.",
  platform_member_not_found:
    "El usuario no pertenece a la empresa seleccionada.",
  platform_identity_exists:
    "Ya existe una cuenta con este correo. Usa otro correo.",
  platform_hostname_exists:
    "Ese dominio ya está asignado o reservado. Usa otro dominio.",
  platform_owner_protected:
    "La cuenta propietaria no puede desactivarse desde este listado.",
  team_forbidden: "Tu cuenta no tiene permiso para consultar el equipo.",
  team_shared_identity:
    "Este usuario pertenece a más de una empresa. Solicita el cambio al propietario de la plataforma.",
  field_role_required: "Este perfil utiliza la web para gestionar el equipo.",
  field_management_forbidden:
    "Tu cuenta no tiene permiso para gestionar la operación del equipo.",
  field_member_not_found:
    "El responsable no está activo o no pertenece a tu empresa. Actualiza el equipo.",
  audit_required:
    "Completa la auditoría de exhibición para cerrar esta visita.",
  audit_forbidden:
    "La auditoría de exhibición corresponde al rol Mercaderista.",
  audit_evidence_required:
    "Adjunta la fotografía de la exhibición para cerrar esta visita.",
  customer_management_forbidden:
    "Tu cuenta no tiene permiso para gestionar la cartera.",
  customer_assignee_not_found:
    "El responsable no está disponible. Selecciona un usuario activo de tu empresa.",
  customer_not_found:
    "Uno de los clientes seleccionados ya no está disponible en tu empresa. Actualiza la cartera.",
  transaction_conflict:
    "Otra operación modificó estos datos al mismo tiempo. Actualiza la cartera y vuelve a intentar.",
  customer_ruc_exists: "Ya existe un cliente registrado con ese RUC.",
  customer_assignment_invalid:
    "Revisa los clientes y el responsable seleccionados. Deben estar activos y pertenecer a tu empresa.",
  permission_denied: "Tu cuenta no tiene permiso para realizar esta acción.",
  planning_forbidden: "Tu rol no tiene permiso para programar visitas.",
  customer_not_assigned: "El cliente no pertenece a tu cartera asignada.",
  visit_slot_conflict: "Ya tienes una visita programada en ese horario.",
  visit_slot_taken: "Ya tienes una visita programada en ese horario.",
  workday_date_completed:
    "La jornada de esa fecha ya está cerrada. Selecciona otra fecha.",
  customer_already_scheduled_this_week:
    "Un cliente no puede programarse o visitarse más de una vez en la misma semana.",
  outside_geofence:
    "Debes estar a menos de 50 metros del local del cliente para registrar la llegada.",
  invalid_evidence:
    "La imagen no es válida. Usa JPG, PNG o WebP de hasta 1 MB.",
  invalid_credentials:
    "Correo o contraseña incorrectos, o cuenta temporalmente bloqueada.",
  company_selection_required:
    "Tu cuenta tiene acceso a varias empresas. Ingresa desde el dominio de la empresa correspondiente o contacta al responsable.",
  invitation_unavailable:
    "La empresa o la cuenta no está habilitada para este enlace.",
  tenant_host_unknown:
    "Este dominio no está habilitado para acceder. Contacta al responsable del sistema.",
  authentication_required: "La sesión terminó. Inicia sesión nuevamente.",
  visits_remaining:
    "Completa las visitas pendientes antes de cerrar la jornada.",
  workday_already_started:
    "La jornada de esta fecha ya comenzó. Su planificación no se puede modificar.",
  visit_version_conflict:
    "La visita cambió mientras la editabas. Vuelve a abrirla antes de guardar.",
  invitation_invalid:
    "La invitación no está disponible o ya fue utilizada. Solicita una nueva.",
  invitation_expired:
    "La invitación venció. Solicita una nueva al responsable.",
  invitation_disabled: "La empresa o la cuenta no está habilitada.",
  active_workday_required: "Primero inicia una jornada.",
  visit_not_pending: "Esta visita ya no está pendiente. Actualiza la agenda.",
  another_visit_active:
    "Finaliza la visita activa antes de registrar otra llegada.",
  visit_not_active: "Esta visita no está activa. Actualiza la agenda.",
  visit_scheduled_in_future: "La visita corresponde a una fecha futura.",
  visit_not_found: "No se encontró la visita dentro de tus asignaciones.",
  conflict:
    "La operación no es compatible con el estado actual. Actualiza la vista.",
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly requestId?: string,
    public readonly details?: FieldIssue[],
  ) {
    super(message);
  }
}

export function errorText(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return "Ocurrió un error inesperado. Actualiza la página antes de continuar.";
}

