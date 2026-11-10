import { z } from "zod";
import { pageSchema } from "./pagination";

export const accessEventSchema = z.object({
  id: z.uuid(),
  occurredAt: z.iso.datetime({offset:true}),
  event: z.string(),
  outcome: z.string().nullable(),
  actorUserId: z.uuid().nullable(),
  details: z.record(z.string(),z.unknown()).nullable(),
});
export const accessHistorySchema = pageSchema(accessEventSchema);
export type AccessEvent = z.infer<typeof accessEventSchema>;

const eventLabels:Record<string,string> = {
  invitation_issued:"Invitación creada",
  invitation_reissued:"Invitación reenviada",
  invitation_inspected:"Enlace consultado",
  invitation_opened:"Enlace consultado",
  invitation_rejected:"Enlace rechazado",
  activation_completed:"Cuenta activada",
  account_activated:"Cuenta activada",
  password_reset_requested:"Recuperación solicitada",
  password_reset_completed:"Contraseña restablecida",
  password_changed:"Contraseña cambiada por administración",
  account_updated:"Datos de cuenta modificados",
  mail_attempt:"Intento de envío",
  mail_attempted:"Intento de envío",
  mail_cancelled:"Envío cancelado",
  mail_accepted:"Correo enviado",
  mail_failed:"No se pudo enviar el correo",
  login_success:"Inicio de sesión correcto",
  login_succeeded:"Inicio de sesión correcto",
  login_failed:"Inicio de sesión rechazado",
};
const outcomeLabels:Record<string,string> = {
  success:"Correcto",pending:"Pendiente",sent:"Enviado",failed:"Fallido",accepted:"Aceptado",
  expired:"Vencido",revoked:"Revocado",consumed:"Ya utilizado",invalid:"No válido",inactive:"Cuenta o empresa inhabilitada",
  queued:"En cola de envío",started:"Iniciado",completed:"Completado",rejected:"Rechazado",
  administrative:"Cambio administrativo",
  smtp_accepted:"Enviado",delivery_failed:"Falló el envío",unavailable:"No disponible",
  invitation_invalid:"Enlace no válido, revocado o ya utilizado",invitation_expired:"Enlace vencido",invitation_unavailable:"Cuenta o empresa inhabilitada",
  invalid_credentials:"Credenciales rechazadas",
};
export const accessEventLabel = (event:string,purpose?:unknown) => {
  if(event === "mail_accepted") return purpose === "password_reset" ? "Correo de recuperación enviado" : purpose === "activation" ? "Invitación enviada" : "Correo enviado";
  if(purpose === "password_reset" && event === "invitation_issued") return "Recuperación de contraseña solicitada";
  if(purpose === "password_reset" && event === "invitation_reissued") return "Enlace de recuperación reenviado";
  return eventLabels[event] ?? event;
};
export const accessOutcomeLabel = (outcome:string|null) => outcome ? outcomeLabels[outcome] ?? outcome : "—";
export const accessActionLabel = (status:"pending"|"accepted"|"expired") => status === "accepted" ? "Enviar enlace de recuperación" : "Reenviar invitación";
