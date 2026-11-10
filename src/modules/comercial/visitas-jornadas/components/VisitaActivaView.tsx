"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Camera,
  FileText,
  PlusCircle,
  CreditCard,
  Package,
  Check,
  X,
  Upload,
} from "lucide-react";
import { PageHeader } from "@/shared/patterns/PageHeader";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Select } from "@/shared/components/ui/select";

export const VisitaActivaView: React.FC = () => {
  const [stockEnGondola, setStockEnGondola] = useState<"si" | "no">("no");
  const [motivo, setMotivo] = useState("Producto agotado");
  const [resultado, setResultado] = useState("Con pedido");
  const [observaciones, setObservaciones] = useState(
    "Cliente confirma pedido de alimento para perros. Solicita entrega mañana en la mañana."
  );
  const [isFinalizada, setIsFinalizada] = useState(false);

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumbs={[
          { label: "Comercial", href: "/comercial/clientes/" },
          { label: "Visitas y jornadas", href: "/comercial/visitas-jornadas/" },
        ]}
        title="Visita en curso"
        subtitle="Pet Market · RUC 20123456789"
        actions={
          <div className="flex items-center gap-3">
            <Badge variant="info">En visita</Badge>
            <span className="text-xs text-zinc-500 font-medium">
              Inicio: 09:10 | San Borja
            </span>
          </div>
        }
      />

      {/* Row 1: Credit Info & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <h3 className="text-xs font-semibold text-zinc-900">
                Información de crédito (SAP)
              </h3>
              <span className="text-2xs text-zinc-400">Última actualización: 09:00</span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-2.5 bg-zinc-50 rounded-lg">
                <span className="text-2xs text-zinc-400 block">Límite de crédito</span>
                <span className="font-bold text-sm text-zinc-900">S/ 5,000.00</span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-lg">
                <span className="text-2xs text-zinc-400 block">Saldo de deuda</span>
                <span className="font-bold text-sm text-amber-600">S/ 2,300.00</span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-lg">
                <span className="text-2xs text-zinc-400 block">Disponible</span>
                <span className="font-bold text-sm text-emerald-600">S/ 2,700.00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-2.5">
            <h3 className="text-xs font-semibold text-zinc-900 border-b border-zinc-100 pb-2">
              Acciones
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/comercial/ventas/cotizaciones/nueva/">
                <Button variant="secondary" size="sm" className="w-full text-xs h-12 flex-col gap-1">
                  <FileText className="h-4 w-4" /> Cotizar
                </Button>
              </Link>
              <Link href="/comercial/ventas/pedidos/nuevo/">
                <Button variant="secondary" size="sm" className="w-full text-xs h-12 flex-col gap-1">
                  <PlusCircle className="h-4 w-4" /> Crear pedido
                </Button>
              </Link>
              <Link href="/comercial/ventas/pedidos/ped-1042/">
                <Button variant="secondary" size="sm" className="w-full text-xs h-12 flex-col gap-1">
                  <CreditCard className="h-4 w-4" /> Reportar pago
                </Button>
              </Link>
              <Link href="/comercial/solicitudes/">
                <Button variant="secondary" size="sm" className="w-full text-xs h-12 flex-col gap-1">
                  <Package className="h-4 w-4" /> Solicitar POP
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Auditoría y Evidencias */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="text-xs font-semibold text-zinc-900 border-b border-zinc-100 pb-2">
            Auditoría y evidencias
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex gap-3">
              <div className="w-32 h-28 rounded-lg border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 cursor-pointer bg-zinc-50/50 transition-colors">
                <Camera className="h-6 w-6 mb-1" />
                <span className="text-2xs font-semibold">Tomar foto</span>
                <span className="text-2xs text-zinc-400">Capturar evidencia</span>
              </div>

              <div className="w-36 h-28 rounded-lg bg-zinc-800 text-white p-2 flex flex-col justify-between relative overflow-hidden">
                <span className="text-2xs bg-black/60 px-1 py-0.5 rounded self-start">Góndola 1</span>
                <span className="text-2xs text-emerald-400">09:24 Registrado</span>
              </div>
            </div>

            <div className="md:col-span-2 space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Preguntas de verificación: ¿Stock en góndola?
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStockEnGondola("si")}
                    className={`px-4 py-1.5 rounded-md text-xs font-medium border ${
                      stockEnGondola === "si"
                        ? "bg-zinc-900 text-white border-zinc-900"
                        : "bg-white text-zinc-700 border-zinc-200"
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockEnGondola("no")}
                    className={`px-4 py-1.5 rounded-md text-xs font-medium border ${
                      stockEnGondola === "no"
                        ? "bg-zinc-900 text-white border-zinc-900"
                        : "bg-white text-zinc-700 border-zinc-200"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Motivo
                </label>
                <div className="max-w-xs">
                  <Select
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    options={[
                      { label: "Producto agotado", value: "Producto agotado" },
                      { label: "Espacio ocupado por competidor", value: "Espacio competidor" },
                      { label: "Sin exhibición", value: "Sin exhibición" },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Row 3: Resultado de la Visita */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="text-xs font-semibold text-zinc-900 border-b border-zinc-100 pb-2">
            Resultado de la visita
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Resultado
              </label>
              <Select
                value={resultado}
                onChange={(e) => setResultado(e.target.value)}
                options={[
                  { label: "Con pedido", value: "Con pedido" },
                  { label: "Sin compra", value: "Sin compra" },
                  { label: "Local cerrado", value: "Local cerrado" },
                ]}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Observaciones
              </label>
              <input
                type="text"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-zinc-200 rounded-md text-zinc-900 focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <Button
                onClick={() => setIsFinalizada(true)}
                disabled={isFinalizada}
                className="w-full h-9"
              >
                {isFinalizada ? "Visita finalizada" : "Finalizar visita"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
