"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Download, ExternalLink, FileSpreadsheet, X } from "lucide-react";
import { DataTable, Column } from "@/shared/patterns/DataTable";
import { FilterBar } from "@/shared/patterns/FilterBar";
import { Select } from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { PAYMENT_STATUS_LABEL } from "@/modules/comercial/ventas/models/venta.model";
import { formatCurrency } from "@/shared/lib/utils";
import { useDemo } from "@/shared/state/demo-store";
import {
  EXTRACTO_MATCH_LABEL,
  ExtractoMatchStatus,
  PagoReportado,
} from "../models/finanzas.model";
import {
  ExtractoFormatError,
  downloadExtractoDemo,
  matchExtracto,
  parseExtractoFile,
} from "../services/extracto.service";
import { RevisarPagoDrawer } from "./RevisarPagoDrawer";

const MATCH_BADGE: Record<ExtractoMatchStatus, "success" | "warning" | "danger" | "neutral"> = {
  coincide: "success",
  monto_distinto: "warning",
  no_figura: "danger",
  ya_conciliado: "neutral",
};

const SCENARIO_DAY = "16 oct. 2026";

export const ConciliacionPagosTable: React.FC = () => {
  const {
    pagos,
    extracto,
    archivoActualizacion,
    clock,
    conciliarPagos,
    observarPago,
    importarExtracto,
    limpiarExtracto,
  } = useDemo();

  const fileInput = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [bankFilter, setBankFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [selectedPagoId, setSelectedPagoId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [showUnmatched, setShowUnmatched] = useState(false);

  const selectedPago = pagos.find((p) => p.id === selectedPagoId) ?? null;

  const filteredData = pagos.filter((p) => {
    const matchesSearch =
      !search ||
      p.orderCode.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase()) ||
      p.operationNumber.toLowerCase().includes(search.toLowerCase());
    const matchesBank = bankFilter === "Todos" || p.paymentMethod.includes(bankFilter);
    const matchesStatus = statusFilter === "Todos" || p.status === statusFilter;

    return matchesSearch && matchesBank && matchesStatus;
  });

  const summary = useMemo(() => {
    const counts: Record<ExtractoMatchStatus, number> = {
      coincide: 0,
      monto_distinto: 0,
      no_figura: 0,
      ya_conciliado: 0,
    };
    if (!extracto) return counts;
    for (const pago of pagos) {
      const match = extracto.matches[pago.id];
      if (match) counts[match.status] += 1;
    }
    return counts;
  }, [extracto, pagos]);

  const pendingMatches = useMemo(
    () =>
      extracto
        ? pagos.filter(
            (p) => p.status !== "Conciliado" && extracto.matches[p.id]?.status === "coincide"
          )
        : [],
    [extracto, pagos]
  );

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImportError(null);
    try {
      const rows = await parseExtractoFile(file);
      if (rows.length === 0) {
        setImportError("El archivo no contiene movimientos con número de operación.");
        return;
      }
      importarExtracto(matchExtracto(pagos, rows, file.name, `${SCENARIO_DAY}, ${clock}`));
    } catch (error) {
      setImportError(
        error instanceof ExtractoFormatError
          ? error.message
          : "No se pudo leer el archivo. Usa un Excel (.xlsx o .xls) o un CSV."
      );
    }
  };

  const columns: Column<PagoReportado>[] = [
    {
      header: "Pedido",
      accessorKey: "orderCode",
      width: "11%",
      cell: (row) => (
        <Link
          href={`/comercial/ventas/pedidos/${row.orderId}/`}
          className="font-bold text-zinc-900 hover:underline flex items-center gap-1"
        >
          {row.orderCode}
          <ExternalLink className="h-3 w-3 text-zinc-400" />
        </Link>
      ),
    },
    {
      header: "Cliente",
      sortable: true,
      width: "22%",
      cell: (row) => (
        <div>
          <p className="font-semibold text-zinc-900">{row.clientName}</p>
          <span className="text-2xs text-zinc-400">RUC: {row.clientRuc}</span>
        </div>
      ),
    },
    {
      header: "Método / Operación",
      width: "18%",
      cell: (row) => (
        <div>
          <p className="font-medium text-zinc-800">{row.paymentMethod}</p>
          <span className="text-2xs font-mono text-zinc-500">Op: {row.operationNumber}</span>
        </div>
      ),
    },
    {
      header: "Fecha reporte",
      accessorKey: "dateReported",
      width: "13%",
      cell: (row) => <span className="text-zinc-600 text-xs">{row.dateReported}</span>,
    },
    {
      header: "Monto",
      accessorKey: "amount",
      sortable: true,
      width: "10%",
      cell: (row) => <span className="font-bold text-zinc-900">{formatCurrency(row.amount)}</span>,
    },
    ...(extracto
      ? [
          {
            header: "Extracto",
            width: "12%",
            cell: (row: PagoReportado) => {
              const match = extracto.matches[row.id];
              return match ? (
                <Badge variant={MATCH_BADGE[match.status]}>{EXTRACTO_MATCH_LABEL[match.status]}</Badge>
              ) : (
                <span className="text-2xs text-zinc-400">—</span>
              );
            },
          } satisfies Column<PagoReportado>,
        ]
      : []),
    {
      header: "Estado",
      accessorKey: "status",
      width: "12%",
      cell: (row) => (
        <Badge
          variant={
            row.status === "Conciliado" ? "success" : row.status === "Observado" ? "danger" : "warning"
          }
        >
          {PAYMENT_STATUS_LABEL[row.status]}
        </Badge>
      ),
    },
    {
      header: "Acción",
      width: "10%",
      className: "text-right",
      cell: (row) => (
        <Button
          size="sm"
          variant={row.status === "Conciliado" ? "secondary" : "primary"}
          onClick={() => setSelectedPagoId(row.id)}
          className="text-xs h-7 px-3"
        >
          {row.status === "Conciliado" ? "Ver detalle" : "Revisar"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Bank statement import */}
      <Card className="shadow-xs border-zinc-200">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-zinc-100 text-zinc-700 shrink-0">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900">Archivo de Finanzas (extracto bancario)</p>
                <p className="text-2xs text-zinc-500 mt-0.5">
                  Última actualización: {archivoActualizacion}
                  {extracto && ` · ${extracto.fileName} · ${extracto.totalRows} movimientos`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInput}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFile}
              />
              <Button size="sm" variant="primary" onClick={() => fileInput.current?.click()} className="gap-1.5">
                <FileSpreadsheet className="h-4 w-4" />
                Importar extracto
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => downloadExtractoDemo(pagos)}
                className="gap-1.5"
              >
                <Download className="h-4 w-4" />
                Descargar extracto de ejemplo
              </Button>
            </div>
          </div>

          {importError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-2xs text-rose-800">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {extracto && (
            <div className="space-y-3 pt-3 border-t border-zinc-100">
              <div className="flex flex-wrap items-center gap-2">
                {(Object.keys(EXTRACTO_MATCH_LABEL) as ExtractoMatchStatus[]).map((status) => (
                  <Badge key={status} variant={MATCH_BADGE[status]}>
                    {EXTRACTO_MATCH_LABEL[status]}: {summary[status]}
                  </Badge>
                ))}
                {extracto.unmatchedRows.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowUnmatched((open) => !open)}
                    className="text-2xs font-semibold text-zinc-700 underline underline-offset-2"
                  >
                    {extracto.unmatchedRows.length} movimientos sin pago reportado
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-2xs text-zinc-500">
                  Coincide = mismo N° de operación y mismo monto. Las excepciones se revisan una a una.
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={pendingMatches.length === 0}
                    onClick={() => conciliarPagos(pendingMatches.map((p) => p.id))}
                    className="gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Conciliar coincidencias ({pendingMatches.length})
                  </Button>
                  <Button size="sm" variant="ghost" onClick={limpiarExtracto} className="gap-1.5">
                    <X className="h-4 w-4" />
                    Quitar extracto
                  </Button>
                </div>
              </div>

              {showUnmatched && (
                <div className="overflow-x-auto border border-zinc-200 rounded-lg">
                  <table className="w-full text-left text-2xs">
                    <thead className="bg-zinc-50 text-zinc-600 font-semibold border-b border-zinc-200">
                      <tr>
                        <th className="py-2 px-3">Fila</th>
                        <th className="py-2 px-3">Fecha</th>
                        <th className="py-2 px-3">Banco</th>
                        <th className="py-2 px-3">N° de operación</th>
                        <th className="py-2 px-3">Descripción</th>
                        <th className="py-2 px-3 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 bg-white">
                      {extracto.unmatchedRows.map((row) => (
                        <tr key={row.rowNumber}>
                          <td className="py-2 px-3 text-zinc-500">{row.rowNumber}</td>
                          <td className="py-2 px-3">{row.date}</td>
                          <td className="py-2 px-3">{row.bank}</td>
                          <td className="py-2 px-3 font-mono">{row.operationNumber}</td>
                          <td className="py-2 px-3">{row.description}</td>
                          <td className="py-2 px-3 text-right font-semibold">{formatCurrency(row.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por pedido, cliente o N° operación..."
      >
        <div className="w-44">
          <Select
            label="Banco"
            value={bankFilter}
            onChange={(e) => setBankFilter(e.target.value)}
            options={[
              { label: "Todos los bancos", value: "Todos" },
              { label: "BCP", value: "BCP" },
              { label: "BBVA", value: "BBVA" },
              { label: "Interbank", value: "Interbank" },
            ]}
          />
        </div>

        <div className="w-44">
          <Select
            label="Estado"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: "Todos los estados", value: "Todos" },
              { label: PAYMENT_STATUS_LABEL.Pendiente, value: "Pendiente" },
              { label: PAYMENT_STATUS_LABEL.Conciliado, value: "Conciliado" },
              { label: PAYMENT_STATUS_LABEL.Observado, value: "Observado" },
            ]}
          />
        </div>
      </FilterBar>

      <DataTable
        columns={columns}
        data={filteredData}
        keyExtractor={(row) => row.id}
        entityName="pagos"
      />

      <RevisarPagoDrawer
        isOpen={!!selectedPago}
        onClose={() => setSelectedPagoId(null)}
        pago={selectedPago}
        match={selectedPago ? extracto?.matches[selectedPago.id] : undefined}
        onConciliar={(id) => conciliarPagos([id])}
        onObservar={observarPago}
      />
    </div>
  );
};
