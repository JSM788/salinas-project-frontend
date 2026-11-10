"use client";

import React, { useState } from "react";
import { Modal } from "@/shared/components/ui/modal";
import { Button } from "@/shared/components/ui/button";
import { Select } from "@/shared/components/ui/select";
import { Search, AlertCircle, Package } from "lucide-react";
import { PRODUCTOS_MOCK, MockProducto } from "@/mocks/productos.mock";
import { formatCurrency } from "@/shared/lib/utils";

interface SeleccionarProductosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selected: { producto: MockProducto; qty: number }[]) => void;
}

export const SeleccionarProductosModal: React.FC<SeleccionarProductosModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("Todas");
  const [selectedMap, setSelectedMap] = useState<Record<string, { selected: boolean; qty: number }>>({
    "prod-001": { selected: true, qty: 10 },
    "prod-002": { selected: false, qty: 2 },
    "prod-003": { selected: false, qty: 0 },
  });

  const filtered = PRODUCTOS_MOCK.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = brand === "Todas" || p.brand === brand;
    return matchesSearch && matchesBrand;
  });

  const toggleSelect = (id: string) => {
    setSelectedMap((prev) => ({
      ...prev,
      [id]: {
        selected: !prev[id]?.selected,
        qty: prev[id]?.qty || 1,
      },
    }));
  };

  const updateQty = (id: string, qty: number) => {
    setSelectedMap((prev) => ({
      ...prev,
      [id]: {
        selected: true,
        qty: Math.max(0, qty),
      },
    }));
  };

  const selectedCount = Object.values(selectedMap).filter((item) => item.selected && item.qty > 0).length;

  const handleConfirm = () => {
    const result = PRODUCTOS_MOCK.filter((p) => selectedMap[p.id]?.selected && selectedMap[p.id]?.qty > 0).map(
      (p) => ({
        producto: p,
        qty: selectedMap[p.id].qty,
      })
    );
    onSelect(result);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Seleccionar productos"
      maxWidth="max-w-2xl"
      footer={
        <>
          <span className="text-xs text-zinc-500 font-medium">
            {selectedCount} {selectedCount === 1 ? "producto seleccionado" : "productos seleccionados"}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose} size="sm">
              Cancelar
            </Button>
            <Button onClick={handleConfirm} size="sm">
              Agregar selección
            </Button>
          </div>
        </>
      }
    >
      <div className="space-y-4">
        {/* Filter row */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o SKU..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-zinc-200 rounded-md placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
            />
          </div>

          <div className="w-40">
            <Select
              label="Marca"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              options={[
                { label: "Todas", value: "Todas" },
                { label: "Bravery", value: "Bravery" },
                { label: "Royal Canin", value: "Royal Canin" },
                { label: "Pro Plan", value: "Pro Plan" },
              ]}
            />
          </div>
        </div>

        {/* Product Table */}
        <div className="border border-zinc-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-medium">
              <tr>
                <th className="w-8 px-3 py-2 text-center" />
                <th className="px-3 py-2">Producto</th>
                <th className="px-3 py-2 text-center">Stock</th>
                <th className="px-3 py-2 text-right">Precio</th>
                <th className="px-3 py-2 text-center w-28">Cant. solicitada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((prod) => {
                const isSelected = selectedMap[prod.id]?.selected || false;
                const qty = selectedMap[prod.id]?.qty || 0;

                return (
                  <tr
                    key={prod.id}
                    className={`hover:bg-zinc-50/60 ${isSelected ? "bg-zinc-50/80" : ""}`}
                  >
                    <td className="px-3 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(prod.id)}
                        className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 h-3.5 w-3.5 cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 shrink-0">
                          <Package className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900">{prod.name}</p>
                          <p className="text-2xs text-zinc-400">SKU: {prod.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {prod.stock === 0 ? (
                        <span className="text-2xs px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 font-medium">
                          Sin stock
                        </span>
                      ) : (
                        <span className="font-medium text-zinc-800">{prod.stock}</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium text-zinc-900">
                      {formatCurrency(prod.price)}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <input
                        type="number"
                        min="0"
                        value={qty}
                        onChange={(e) => updateQty(prod.id, parseInt(e.target.value) || 0)}
                        className="w-16 h-7 px-2 text-center text-xs border border-zinc-200 rounded-md focus:border-zinc-900 focus:outline-none"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Info notice */}
        <div className="flex items-center gap-2 p-2.5 bg-zinc-50 border border-zinc-200 rounded-md text-2xs text-zinc-600">
          <AlertCircle className="h-4 w-4 text-zinc-400 shrink-0" />
          <span>
            La demanda puede superar la disponibilidad; se revisa antes de confirmar.
          </span>
        </div>
      </div>
    </Modal>
  );
};
