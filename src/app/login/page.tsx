"use client";
import React,{useState} from "react";
import {Droplets,Lock,Mail} from "lucide-react";
import {useAuth} from "@/shared/lib/auth-context";
import {Button} from "@/shared/components/ui/button";
import {Input} from "@/shared/components/ui/input";
import { loginInput } from "@/shared/api/contracts";
import { useFormErrors } from "@/shared/lib/use-form-errors";
import { FieldError } from "@/shared/components/ui/field-error";

export default function LoginPage() {
  const {login}=useAuth();
  const [email,setEmail]=useState(""),[password,setPassword]=useState("");
  const [busy,setBusy]=useState(false);
  const errors=useFormErrors({fields:["email","password"]});
  const submit=async(event:React.FormEvent)=>{
    event.preventDefault();if(busy) return;
    const input=errors.validate(loginInput,{email:email.trim().toLowerCase(),password});
    if(!input)return;
    setBusy(true);
    try {await login(input.email,input.password);}
    catch(cause) {errors.handle(cause);}
    finally {setBusy(false);}
  };
  return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="w-full max-w-sm bg-white border border-zinc-200 rounded-xl shadow-lg p-6 sm:p-7 space-y-4">
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#27272a] text-white mb-1"><Droplets className="h-6 w-6"/></div>
        <h1 className="text-xl font-bold text-zinc-950">Sistema</h1>
        <p className="text-xs text-zinc-500">Acceso a la operación de campo</p>
      </div>
      <form noValidate onSubmit={submit} className="space-y-3.5">
        <div><label htmlFor="email" className="block text-xs font-medium mb-1">Correo electrónico</label><Input id="email" type="email" autoComplete="username" value={email} aria-invalid={Boolean(errors.fields.email)} aria-describedby={errors.fields.email?"login-email-error":undefined} onChange={e=>{errors.clear("email");setEmail(e.target.value);}} icon={<Mail className="h-4 w-4"/>} required maxLength={254}/><FieldError id="login-email-error" message={errors.fields.email}/></div>
        <div><label htmlFor="password" className="block text-xs font-medium mb-1">Contraseña</label><Input id="password" type="password" autoComplete="current-password" value={password} aria-invalid={Boolean(errors.fields.password)} aria-describedby={errors.fields.password?"login-password-error":undefined} onChange={e=>{errors.clear("password");setPassword(e.target.value);}} icon={<Lock className="h-4 w-4"/>} required minLength={4} maxLength={128}/><FieldError id="login-password-error" message={errors.fields.password}/></div>
        {errors.error && <p role="alert" className="p-2.5 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700">{errors.error}</p>}
        <Button type="submit" disabled={busy} className="w-full">{busy?"Verificando…":"Ingresar al sistema"}</Button>
      </form>
    </div>
  </div>;
}
