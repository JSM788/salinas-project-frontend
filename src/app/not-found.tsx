"use client";

import React from "react";
import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { APP_ROUTES } from "@/config/routes";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fbfcfd] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 mb-5 shadow-2xs">
        <FileQuestion className="h-8 w-8 stroke-[1.5]" />
      </div>

      <span className="text-2xs font-bold uppercase tracking-widest text-zinc-400 mb-1">
        Error 404
      </span>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
        Página no encontrada
      </h1>
      <p className="text-xs text-zinc-500 max-w-sm mt-2 leading-relaxed">
        La ruta que intentas consultar no existe o ha sido trasladada a otra sección del sistema.
      </p>

      <div className="flex items-center gap-3 mt-6">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg shadow-2xs hover:bg-zinc-50 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Volver atrás</span>
        </button>

        <Link href={APP_ROUTES.ROOT}>
          <Button size="sm" className="gap-1.5 text-xs bg-zinc-900 text-white hover:bg-zinc-800">
            <Home className="h-3.5 w-3.5" />
            <span>Ir al inicio</span>
          </Button>
        </Link>
      </div>

      <div className="mt-12 text-2xs text-zinc-400">
        Aquamundo B2B · Plataforma de Gestión Comercial
      </div>
    </div>
  );
}

