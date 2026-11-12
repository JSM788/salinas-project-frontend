"use client";

import { ChangeEvent, useRef, useState } from "react";
import { CheckCircle2, FileSpreadsheet, Upload } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Button } from "@/shared/components/ui/button";
import { apiRequest } from "@/shared/api/client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import {
  ImportCustomerItemInput,
  importCustomersResponse,
} from "@/shared/api/customer-management";
import {
  detectarZonaPorDistrito,
  encontrarDistrito,
  normalizarTexto,
} from "../../../models/distritos-zonas";

interface ImportCustomersModalProps {
  onClose: () => void;
  onImported: () => void;
}

const SAMPLE_IMPORT_ITEMS: ImportCustomerItemInput[] = [
  {
    name: "Pet Market San Borja",
    ruc: "20123456789",
    address: "Av. San Borja Norte 1234, San Borja, Lima",
    district: "San Borja",
    zone: "Lima Centro",
  },
  {
    name: "Veterinaria Huellitas",
    ruc: "20456789012",
    address: "Av. Larco 890, Miraflores, Lima",
    district: "Miraflores",
    zone: "Lima Centro",
  },
  {
    name: "Mundo Animal Surco",
    ruc: "20567890123",
    address: "Av. Primavera 1420, Surco, Lima",
    district: "Santiago de Surco",
    zone: "Lima Sur",
  },
  {
    name: "Mascotas y Más",
    ruc: "20601234567",
    address: "Av. Benavides 3890, Santiago de Surco, Lima",
    district: "Santiago de Surco",
    zone: "Lima Sur",
  },
  {
    name: "Clínica Vet. San Miguel",
    ruc: "20609876543",
    address: "Av. La Marina 2100, San Miguel, Lima",
    district: "San Miguel",
    zone: "Lima Oeste",
  },
  {
    name: "Agrovet Callao",
    ruc: "20551234567",
    address: "Av. Sáenz Peña 450, Callao",
    district: "Callao",
    zone: "Callao",
  },
];

function parseExcelRows(rows: Record<string, unknown>[]): ImportCustomerItemInput[] {
  const items: ImportCustomerItemInput[] = [];

  for (const row of rows) {
    const entries = Object.entries(row);
    const getCol = (keywords: string[]): string => {
      for (const [k, v] of entries) {
        const keyNorm = normalizarTexto(k);
        if (keywords.some((kw) => keyNorm.includes(kw))) {
          return String(v ?? "").trim();
        }
      }
      return "";
    };

    const rawRuc = getCol(["ruc", "documento", "nit"]).replace(/\D/g, "");
    const rawName = getCol(["razon social", "nombre", "cliente", "tienda", "comercial"]);
    const rawAddress = getCol(["direccion", "domicilio", "ubicacion"]);
    const rawDistrict = getCol(["distrito", "localidad"]);
    const rawZone = getCol(["zona", "sector"]);

    if (rawRuc.length !== 11 || !rawName) continue;

    const matchedDistrict = rawDistrict ? encontrarDistrito(rawDistrict) : undefined;
    const district = matchedDistrict?.distrito || rawDistrict || "Lima";
    const zone =
      rawZone ||
      matchedDistrict?.zona ||
      detectarZonaPorDistrito(district) ||
      "Lima Centro";

    items.push({
      name: rawName.slice(0, 150),
      ruc: rawRuc,
      address: (rawAddress || `${district}, Lima`).slice(0, 300),
      district: district.slice(0, 100),
      zone: zone.slice(0, 100),
    });
  }

  return items;
}

export function ImportCustomersModal({
  onClose,
  onImported,
}: ImportCustomersModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [parsedItems, setParsedItems] = useState<ImportCustomerItemInput[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        setError("El archivo Excel no contiene hojas válidas.");
        setParsedItems([]);
        return;
      }
      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
        defval: "",
      });
      const items = parseExcelRows(rows);
      if (items.length === 0) {
        setError(
          "No se encontraron filas válidas (RUC de 11 dígitos y Razón Social/Nombre).",
        );
        setParsedItems([]);
        return;
      }
      setParsedItems(items.slice(0, 500));
    } catch {
      setError("No se pudo leer el archivo Excel (.xlsx).");
      setParsedItems([]);
    }
  };

  const handleImport = async () => {
    if (busy) return;
    const itemsToImport = parsedItems.length > 0 ? parsedItems : SAMPLE_IMPORT_ITEMS;
    setBusy(true);
    setError("");
    try {
      const result = await apiRequest(
        API_ENDPOINTS.CUSTOMERS.IMPORT,
        importCustomersResponse,
        {
          body: { items: itemsToImport },
        },
      );
      onImported();
      onClose();
      toast.success(
        `¡Importación completada! ${result.imported} clientes registrados${
          result.skipped > 0 ? ` (${result.skipped} omitidos por RUC existente)` : ""
        }.`,
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo completar la importación de clientes.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-lg max-w-lg w-full p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
          <h3 className="font-semibold text-xs text-zinc-900">
            Importar Directorio de Clientes (.xlsx)
          </h3>
          <button
            onClick={() => !busy && onClose()}
            disabled={busy}
            className="text-zinc-400 hover:text-zinc-600 text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div
          onClick={() => !busy && fileInputRef.current?.click()}
          className="border border-dashed border-zinc-300 hover:border-zinc-400 transition-colors cursor-pointer rounded-md p-5 text-center space-y-1.5 bg-zinc-50/50"
        >
          {parsedItems.length > 0 ? (
            <>
              <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600" />
              <p className="text-xs font-semibold text-zinc-900">{fileName}</p>
              <p className="text-2xs text-emerald-700 font-medium">
                {parsedItems.length} clientes listos para importar (con autodetección de
                distrito y zona)
              </p>
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-6 h-6 mx-auto text-zinc-600" />
              <p className="text-xs font-medium text-zinc-800">
                Haz clic para seleccionar tu{" "}
                <span className="font-mono text-zinc-900 font-semibold underline">
                  archivo de clientes.xlsx
                </span>
              </p>
              <p className="text-2xs text-zinc-500">
                Columnas soportadas: RUC, Razón Social / Nombre, Dirección, Distrito y Zona.
              </p>
            </>
          )}
        </div>

        <div className="bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-2xs text-zinc-600 space-y-1">
          <p>
            <b>Protección contra duplicados:</b> Si el RUC ya existe en la empresa, se
            omitirá automáticamente para no duplicar registros.
          </p>
          <p className="text-zinc-400">
            Si no seleccionas un archivo, se importará el lote demostrativo de clientes
            para pruebas en base de datos real.
          </p>
        </div>

        {error && (
          <p role="alert" className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md p-2">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={busy}
            className="text-xs"
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleImport}
            disabled={busy}
            className="text-xs font-semibold gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            {busy
              ? "Importando…"
              : parsedItems.length > 0
                ? `Importar ${parsedItems.length} clientes`
                : "Confirmar e Importar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
