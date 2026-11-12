"use client";

import React, { useState } from "react";
import { DashboardShell } from "@/shared/layout/DashboardShell";
import { PageHeader } from "@/shared/patterns/PageHeader";
import { useBranding, DEFAULT_BRANDING } from "@/shared/lib/branding";
import {
  Building2,
  Clock,
  ShieldCheck,
  HardDrive,
  Share2,
  Upload,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Info,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { ConfirmModal } from "@/shared/components/ui/confirm-modal";
import { Input } from "@/shared/components/ui/input";

export default function SettingsPage() {
  const { branding, saveBranding } = useBranding();
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const [companyName, setCompanyName] = useState(branding.companyName);
  const [subtitle, setSubtitle] = useState(branding.subtitle);
  const [logoUrl, setLogoUrl] = useState(branding.logoUrl || "");
  const [disconnectionHour, setDisconnectionHour] = useState(branding.digitalDisconnectionHour);
  const [autoClose, setAutoClose] = useState(branding.autoCloseRemainingVisits);
  const [antiMock, setAntiMock] = useState(branding.antiMockGpsRequired);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  // Sync state when branding loads from storage
  React.useEffect(() => {
    setCompanyName(branding.companyName);
    setSubtitle(branding.subtitle);
    setLogoUrl(branding.logoUrl || "");
    setDisconnectionHour(branding.digitalDisconnectionHour);
    setAutoClose(branding.autoCloseRemainingVisits);
    setAntiMock(branding.antiMockGpsRequired);
  }, [branding]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveBranding({
      companyName: companyName.trim() || DEFAULT_BRANDING.companyName,
      subtitle: subtitle.trim() || DEFAULT_BRANDING.subtitle,
      logoUrl: logoUrl.trim() ? logoUrl.trim() : null,
      digitalDisconnectionHour: disconnectionHour,
      autoCloseRemainingVisits: autoClose,
      antiMockGpsRequired: antiMock,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    setConfirmResetOpen(true);
  };

  const confirmReset = () => {
    saveBranding(DEFAULT_BRANDING);
    setCompanyName(DEFAULT_BRANDING.companyName);
    setSubtitle(DEFAULT_BRANDING.subtitle);
    setLogoUrl("");
    setDisconnectionHour(DEFAULT_BRANDING.digitalDisconnectionHour);
    setAutoClose(DEFAULT_BRANDING.autoCloseRemainingVisits);
    setAntiMock(DEFAULT_BRANDING.antiMockGpsRequired);
    setPreviewError(false);
    setConfirmResetOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setLogoUrl(dataUrl);
      setPreviewError(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <PageHeader
          title="Configuración del Sistema"
          subtitle="Identidad corporativa, políticas de campo, almacenamiento y parámetros operativos"
        />

        {savedSuccess && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium shadow-sm transition-all animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold">Configuración guardada exitosamente</p>
              <p className="text-xs text-emerald-700">
                Los cambios de identidad y logotipo se reflejan inmediatamente en la cabecera y en la pantalla de inicio de sesión (/login).
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* SECCIÓN 1: IDENTIDAD Y LOGOTIPO */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-zinc-900">Identidad Corporativa y Logotipo</h2>
                  <p className="text-xs text-zinc-500">Personaliza la marca visible en la aplicación web, pantalla de login y reportes</p>
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleReset} className="gap-1.5 text-xs text-zinc-600">
                <RotateCcw className="h-3.5 w-3.5" />
                Valores por defecto
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Formulario de Logo */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Nombre Comercial de la Empresa</label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ej: Salinas / Aquamundo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Subtítulo / Eslogan en Pantalla de Login</label>
                  <Input
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Ej: Operaciones de Campo y Distribución"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    URL del Logotipo (Cloudflare R2 o CDN externo)
                  </label>
                  <Input
                    value={logoUrl}
                    onChange={(e) => {
                      setLogoUrl(e.target.value);
                      setPreviewError(false);
                    }}
                    placeholder="https://pub-3550cce562a14a619169a17a72097574.r2.dev/logos/mi-empresa.png"
                  />
                  <p className="text-2xs text-zinc-400 mt-1">
                    Formatos recomendados: PNG o WebP con fondo transparente. Altura óptima: 60px a 120px.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">O cargar imagen desde tu equipo:</label>
                  <label className="inline-flex items-center gap-2 px-3 py-2 border border-zinc-300 rounded-lg text-xs font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 cursor-pointer transition-colors">
                    <Upload className="h-4 w-4 text-zinc-500" />
                    Seleccionar imagen local...
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Vista Previa en Vivo de la Tarjeta de Login */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-2xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Vista Previa Login</span>
                <div className="w-full max-w-56 bg-white border border-zinc-200 rounded-lg p-4 shadow-sm space-y-2">
                  <div className="h-12 flex items-center justify-center">
                    {logoUrl && !previewError ? (
                      <img
                        src={logoUrl}
                        alt="Logo Preview"
                        onError={() => setPreviewError(true)}
                        className="max-h-12 max-w-full object-contain"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#27272a] text-white flex items-center justify-center font-bold text-xs">
                        <Sparkles className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-bold text-zinc-900 truncate">{companyName || "Empresa"}</p>
                  <p className="text-3xs text-zinc-500 line-clamp-1">{subtitle || "Acceso"}</p>
                  <div className="w-full h-5 bg-zinc-100 rounded text-3xs text-zinc-400 flex items-center justify-center">
                    formulario de acceso…
                  </div>
                </div>
                {previewError && (
                  <p className="text-2xs text-rose-500 mt-2">No se pudo cargar la imagen desde la URL provista.</p>
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: DESCONEXIÓN DIGITAL Y HORARIO DE CAMPO */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-900">Desconexión Digital y Jornada Laboral</h2>
                <p className="text-xs text-zinc-500">
                  Límite legal de jornada y política de cierre para personal comercial y mercaderistas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 border border-zinc-200 rounded-lg bg-zinc-50 space-y-2">
                <label className="block text-xs font-semibold text-zinc-800">
                  Hora Límite de Operación en Campo
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="time"
                    value={disconnectionHour}
                    onChange={(e) => setDisconnectionHour(e.target.value)}
                    className="w-32 bg-white"
                  />
                  <span className="text-xs text-zinc-600 font-medium">(19:00 hrs por defecto)</span>
                </div>
                <p className="text-2xs text-zinc-500 leading-relaxed">
                  Al alcanzar esta hora, el rastreo GPS de fondo y los check-ins de visitas quedan bloqueados por respeto a la desconexión digital legal.
                </p>
              </div>

              <div className="p-4 border border-zinc-200 rounded-lg bg-zinc-50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-800">
                    Autocierre de Visitas Pendientes a las 19:00 hrs
                  </label>
                  <input
                    type="checkbox"
                    checked={autoClose}
                    onChange={(e) => setAutoClose(e.target.checked)}
                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-zinc-300"
                  />
                </div>
                <p className="text-2xs text-zinc-500 leading-relaxed">
                  Si un vendedor no cierra su jornada antes de las 19:00 hrs, el sistema automáticamente finaliza su jornada con su última ubicación GPS registrada y marca las visitas restantes como: <code className="bg-zinc-200 px-1 py-0.5 rounded text-zinc-800 font-mono text-3xs">Autocierre por Desconexión Digital (Límite 19:00 hrs)</code>.
                </p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: CONTROL ANTI-FRAUDE Y GPS */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-900">Seguridad de Operaciones y Anti-Fraude</h2>
                <p className="text-xs text-zinc-500">Validaciones de integridad y geolocalización en la aplicación móvil</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-zinc-200 rounded-lg bg-zinc-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-800">Bloqueo Anti-Mock GPS (Fake GPS)</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-bold bg-emerald-100 text-emerald-800">
                    BLINDADO
                  </span>
                </div>
                <p className="text-2xs text-zinc-500 leading-relaxed">
                  La app móvil rechaza inicios de jornada y llegadas a clientes si detecta apps de ubicación falsa (Android Mock Location / iOS simulated location).
                </p>
              </div>

              <div className="p-4 border border-zinc-200 rounded-lg bg-zinc-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-800">Justificación Obligatoria de Cierre</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-bold bg-blue-100 text-blue-800">
                    ACTIVO
                  </span>
                </div>
                <p className="text-2xs text-zinc-500 leading-relaxed">
                  Exige seleccionar un motivo estandarizado o escribir un motivo libre cuando el colaborador finaliza su jornada dejando visitas pendientes en su agenda.
                </p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: INFRAESTRUCTURA DE ALMACENAMIENTO E INTEGRACIONES */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
              <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                <HardDrive className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-900">Almacenamiento Cloud e Integraciones</h2>
                <p className="text-xs text-zinc-500">Configuración de almacenamiento de fotos de visita y mensajería</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-zinc-200 rounded-lg bg-zinc-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-800">Cloudflare R2 Bucket</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-bold bg-emerald-100 text-emerald-800">
                    100% OPERATIVO
                  </span>
                </div>
                <div className="space-y-1 text-2xs text-zinc-600 font-mono">
                  <p>Bucket: <span className="font-semibold text-zinc-800">ventaspro</span></p>
                  <p>CDN: <span className="font-semibold text-zinc-800">pub-3550cce562a14a619169a17a72097574.r2.dev</span></p>
                  <p>Base64 en PostgreSQL: <span className="text-emerald-700 font-semibold">0 bytes (Eliminado)</span></p>
                </div>
              </div>

              <div className="p-4 border border-zinc-200 rounded-lg bg-zinc-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-800">Compartir Resumen por WhatsApp</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-bold bg-emerald-100 text-emerald-800">
                    DIRECTO
                  </span>
                </div>
                <p className="text-2xs text-zinc-500 leading-relaxed">
                  Enlace nativo universal <code className="bg-zinc-200 px-1 py-0.5 rounded text-zinc-800 font-mono text-3xs">https://wa.me/?text=...</code> sin cadenas de fallbacks para apertura inmediata en WhatsApp móvil y Web.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 bg-blue-50/60 border border-blue-200/80 rounded-lg text-2xs text-blue-900">
              <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Subdominios Multi-Empresa en preparación:</p>
                <p className="text-blue-800">
                  La estructura de subdominios y dominios dinámicos está vinculada en base de datos (<code className="font-mono">company_domains</code>). Al asignar subdominios propios (ej. <code className="font-mono">aquamundo.salinas.com</code>), el logotipo y las reglas corporativas se descargarán automáticamente según el dominio que cargue el navegador.
                </p>
              </div>
            </div>
          </div>

          {/* BOTÓN DE ACCIÓN */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleReset}>
              Restablecer
            </Button>
            <Button type="submit" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Guardar Configuración
            </Button>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={confirmReset}
        title="Restablecer configuración"
        description="¿Restablecer los valores de configuración y logotipo por defecto?"
        confirmLabel="Restablecer"
        variant="danger"
      />
    </DashboardShell>
  );
}
