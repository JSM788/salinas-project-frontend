"use client";

import React, { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { APP_CONSTANTS } from "@/config/constants";
import { isHttpUrl } from "@/shared/lib/geo";
import { formatStopSubtitle } from "../utils";
import type { Stop } from "../types";

interface AddStopsModalProps {
  dayKey: string;
  dayDate: string;
  catalog: Omit<Stop, "order">[];
  assignedWeekCustomerIds: Set<string>;
  currentStopsCount: number;
  onClose: () => void;
  onAdd: (selectedCustomerIds: string[]) => void;
}

export function AddStopsModal({
  dayKey,
  dayDate,
  catalog,
  assignedWeekCustomerIds,
  currentStopsCount,
  onClose,
  onAdd,
}: AddStopsModalProps) {
  const [modalSearch, setModalSearch] = useState("");
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  const maxAllowed = Math.max(
    0,
    APP_CONSTANTS.FIELD_OPERATIONS.MAX_STOPS_PER_DAY - currentStopsCount,
  );

  const availableCatalog = catalog.filter(
    (cat) => !assignedWeekCustomerIds.has(cat.id),
  );

  const q = modalSearch.toLowerCase().trim();
  const filteredCandidates = availableCatalog.filter((cat) => {
    if (!q) return true;
    const cleanAddr = isHttpUrl(cat.address) ? "" : cat.address.toLowerCase();
    return (
      cat.name.toLowerCase().includes(q) ||
      (cat.tradeName && cat.tradeName.toLowerCase().includes(q)) ||
      (cat.district && cat.district.toLowerCase().includes(q)) ||
      cat.ruc.includes(q) ||
      cleanAddr.includes(q)
    );
  });

  const handleToggle = (id: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedCandidates((prev) => prev.filter((item) => item !== id));
    } else if (selectedCandidates.length < maxAllowed) {
      setSelectedCandidates((prev) => [...prev, id]);
    }
  };

  const handleConfirm = () => {
    if (selectedCandidates.length === 0) return;
    onAdd(selectedCandidates);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-lg max-w-xl w-full p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
          <div>
            <h3 className="font-semibold text-xs text-zinc-900 uppercase">
              Seleccionar Clientes para {dayKey.toUpperCase()} ({dayDate})
            </h3>
            <p className="text-3xs text-zinc-500">
              Disponibles: {maxAllowed} paradas libres para este día
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        <div>
          <input
            type="text"
            placeholder="Buscar por cliente, RUC, distrito o dirección..."
            value={modalSearch}
            onChange={(e) => setModalSearch(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md outline-none focus:border-zinc-400 placeholder:text-zinc-400"
          />
        </div>

        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {filteredCandidates.length === 0 ? (
            <div className="py-8 px-4 text-center text-xs text-zinc-500 border border-dashed border-zinc-200 rounded-md">
              {catalog.length > 0 && availableCatalog.length === 0
                ? "Todos los clientes disponibles ya están asignados en esta semana (no se repiten visitas en la misma semana)."
                : "No se encontraron clientes disponibles con ese criterio."}
            </div>
          ) : (
            filteredCandidates.map((cat) => {
              const isChecked = selectedCandidates.includes(cat.id);
              const isLimitReached = !isChecked && selectedCandidates.length >= maxAllowed;
              const candidateSubtitle = [
                formatStopSubtitle(cat.district, cat.address),
                `RUC ${cat.ruc}`,
              ]
                .filter(Boolean)
                .join(" • ");

              return (
                <label
                  key={cat.id}
                  className={`p-2.5 border rounded-md transition flex items-center justify-between cursor-pointer ${
                    isChecked
                      ? "border-zinc-800 bg-zinc-50/80"
                      : isLimitReached
                      ? "border-zinc-100 opacity-40 cursor-not-allowed"
                      : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isLimitReached}
                      onChange={() => handleToggle(cat.id, isChecked)}
                      className="rounded border-zinc-300 text-zinc-900 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs text-zinc-900">
                          {cat.tradeName || cat.name}
                        </span>
                        <span className="text-3xs font-mono text-zinc-400">{cat.code}</span>
                      </div>
                      <p className="text-2xs text-zinc-500">
                        {candidateSubtitle}
                      </p>
                    </div>
                  </div>

                  <span className="text-3xs text-zinc-400 font-mono">
                    {isChecked ? "Seleccionado" : ""}
                  </span>
                </label>
              );
            })
          )}
        </div>

        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
          <span className="text-2xs text-zinc-500">
            {selectedCandidates.length} seleccionado(s)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              variant="primary"
              disabled={selectedCandidates.length === 0}
              onClick={handleConfirm}
              className="text-xs font-semibold"
            >
              Agregar paradas ({selectedCandidates.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

