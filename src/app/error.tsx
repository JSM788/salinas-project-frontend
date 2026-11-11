"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { APP_ROUTES } from "@/config/routes";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Logueo estructurado del error
    console.error("Next.js Error Boundary capturó una excepción:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#fbfcfd] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-5 shadow-2xs">
        <AlertOctagon className="h-8 w-8 stroke-[1.5]" />
      </div>

      <span className="text-2xs font-bold uppercase tracking-widest text-red-500 mb-1">
        Excepción de Aplicación
      </span>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
        Ocurrió un error inesperado
      </h1>
      <p className="text-xs text-zinc-500 max-w-sm mt-2 leading-relaxed">
        Se produjo un problema al procesar esta vista. Tus datos locales se mantienen seguros.
      </p>

      {error.digest && (
        <div className="mt-3 px-3 py-1 bg-zinc-100 rounded-md text-3xs font-mono text-zinc-500">
          Código de referencia: {error.digest}
        </div>
      )}

      <div className="flex items-center gap-3 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => reset()}
          className="gap-1.5 text-xs text-zinc-700"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reintentar operación</span>
        </Button>

        <Link href={APP_ROUTES.ROOT}>
          <Button size="sm" className="gap-1.5 text-xs bg-zinc-900 text-white hover:bg-zinc-800">
            <Home className="h-3.5 w-3.5" />
            <span>Volver al inicio</span>
          </Button>
        </Link>
      </div>

      <div className="mt-12 text-2xs text-zinc-400">
        Aquamundo B2B · Soporte Operativo
      </div>
    </div>
  );
}

