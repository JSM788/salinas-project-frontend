"use client";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { apiRequest } from "@/shared/api/client";
import { invitationSchema, acceptInvitationInput, acceptedInvitationSchema } from "@/shared/api/invitations";
import { useFormErrors } from "@/shared/lib/use-form-errors";
import { FieldError } from "@/shared/components/ui/field-error";
import { roleLabels } from "@/shared/api/contracts";

export default function InvitationPage({params}:{params:{token:string}}) {
  const [invitation,setInvitation]=useState<z.infer<typeof invitationSchema>>();
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const errors=useFormErrors({fields:["password","confirm"]});
  const [busy,setBusy]=useState(false);
  const [accepted,setAccepted]=useState<z.infer<typeof acceptedInvitationSchema>>();
  const validToken=/^[A-Za-z0-9_-]{43}$/.test(params.token);
  useEffect(()=>{
    setInvitation(undefined);setAccepted(undefined);setPassword("");setConfirm("");errors.reset();
    if (!validToken) {errors.setError("El enlace de invitación no es válido.");return;}
    let active=true;
    apiRequest(`/invitations/${params.token}`,invitationSchema).then(value=>{if(active)setInvitation(value);}).catch(cause=>{if(active)errors.handle(cause);});
    return ()=>{active=false;};
  },[params.token,validToken]);
  const submit=async(event:React.FormEvent)=>{
    event.preventDefault();
    if(busy || !invitation)return;
    const input=errors.validate(acceptInvitationInput,{password});
    if(!input)return;
    if(password!==confirm){errors.setFieldError("confirm","Las contraseñas deben coincidir.");return;}
    setBusy(true);errors.reset();
    try {const result=await apiRequest(`/invitations/${params.token}/accept`,acceptedInvitationSchema,{body:input});setAccepted(result);setPassword("");setConfirm("");}
    catch(cause){errors.handle(cause);}finally{setBusy(false);}
  };
  const loginUrl=accepted && typeof window!=="undefined" ? companyLoginUrl(accepted.tenantHost,window.location.origin) : undefined;
  const recovering=invitation?.purpose==="password_reset";
  return <main className="min-h-screen flex items-center justify-center bg-zinc-50 p-4"><section className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-sm">
    <h1 className="text-xl font-semibold">{accepted?(accepted.purpose==="password_reset"?"Contraseña restablecida":"Cuenta activada"):(recovering?"Restablece tu contraseña":"Activa tu cuenta")}</h1>
    {invitation && <div className="text-sm space-y-1"><p className="font-medium">{invitation.companyName}</p><p>{invitation.email} · {roleLabels[invitation.role]}</p></div>}
    {accepted ? <><p className="text-sm text-zinc-600">Tu contraseña quedó guardada. Ingresa con {accepted.email} y la contraseña que acabas de establecer.</p><a href={loginUrl} className="inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm text-white">Ir al acceso de mi empresa</a><p className="text-xs text-zinc-500">Si tu perfil utiliza la aplicación móvil, ingresa allí con el mismo correo y contraseña. No necesitas volver a abrir este enlace.</p></> : invitation ? <form noValidate onSubmit={submit} className="space-y-4"><label className="block text-sm space-y-1">Contraseña<Input required type="password" autoComplete="new-password" minLength={1} maxLength={128} disabled={busy} value={password} aria-invalid={Boolean(errors.fields.password)} aria-describedby={errors.fields.password?"invitation-password-error":undefined} onChange={event=>{errors.clear("password");setPassword(event.target.value);}} /><FieldError id="invitation-password-error" message={errors.fields.password}/></label><label className="block text-sm space-y-1">Confirmar contraseña<Input required type="password" autoComplete="new-password" minLength={1} maxLength={128} disabled={busy} value={confirm} aria-invalid={Boolean(errors.fields.confirm)} aria-describedby={errors.fields.confirm?"invitation-confirm-error":undefined} onChange={event=>{errors.clear("confirm");setConfirm(event.target.value);}} /><FieldError id="invitation-confirm-error" message={errors.fields.confirm}/></label><p className="text-xs text-zinc-500">El enlace solo se puede utilizar una vez.</p><Button type="submit" disabled={busy}>{busy?"Guardando…":recovering?"Restablecer contraseña":"Establecer contraseña"}</Button></form> : !errors.error && <p role="status" className="text-sm text-zinc-500">Verificando enlace…</p>}
    {errors.error && <p role="alert" className="text-sm text-rose-700">{errors.error}</p>}
  </section></main>;
}

function companyLoginUrl(hostname:string,origin:string) {
  const url=new URL("/login/",origin);
  if(url.hostname!=="localhost" && url.hostname!=="127.0.0.1") url.hostname=hostname;
  return url.toString();
}
