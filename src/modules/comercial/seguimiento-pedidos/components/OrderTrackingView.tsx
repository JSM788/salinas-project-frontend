"use client";

import React, { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Search,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { APP_ROUTES } from "@/config/routes";
import { Tabs } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";
import { PageHeader } from "@/shared/patterns/PageHeader";
import {
  AVAILABLE_COMMERCIALS,
  AVAILABLE_DATE_FILTERS,
  INITIAL_BRANGO_ORDERS,
  INITIAL_PENDING_LINKS,
} from "../data/brango-orders";
import {
  BrangoDeliveryStatus,
  BrangoPendingLink,
  BrangoTrackedOrder,
  DELIVERY_STATUS_META,
} from "../models/brango-order.model";
import { DeliveryStatusBadge } from "./DeliveryStatusBadge";
import { OrderDetailDrawer } from "./OrderDetailDrawer";
import { PendingLinksTab } from "./PendingLinksTab";

const PAGE_SIZE = 5;

export const OrderTrackingView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"pedidos" | "vinculaciones">("pedidos");
  const [orders, setOrders] = useState<BrangoTrackedOrder[]>(INITIAL_BRANGO_ORDERS);
  const [pendingLinks, setPendingLinks] = useState<BrangoPendingLink[]>(
    INITIAL_PENDING_LINKS
  );

  const [search, setSearch] = useState("");
  const [commercialFilter, setCommercialFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | BrangoDeliveryStatus>("all");
  const [dateFilter, setDateFilter] = useState<string>("2026-11-01");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<BrangoTrackedOrder | null>(null);

  // Pedidos filtrados por fecha, búsqueda y comercial (base para conteos KPI)
  const scopedByContext = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (dateFilter !== "all" && order.dateKey !== dateFilter) return false;
      if (commercialFilter !== "all" && order.commercialName !== commercialFilter) {
        return false;
      }
      if (
        query &&
        !order.code.toLowerCase().includes(query) &&
        !order.customerName.toLowerCase().includes(query) &&
        !order.commercialName.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [orders, dateFilter, commercialFilter, search]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return scopedByContext;
    return scopedByContext.filter((order) => order.status === statusFilter);
  }, [scopedByContext, statusFilter]);

  const kpis = useMemo(() => {
    const total = scopedByContext.length;
    const delivered = scopedByContext.filter((o) => o.status === "entregado").length;
    const inTransit = scopedByContext.filter((o) => o.status === "en_transito").length;
    const pendingOrObserved = scopedByContext.filter(
      (o) => o.status === "pendiente" || o.status === "observado"
    ).length;

    return { total, delivered, inTransit, pendingOrObserved };
  }, [scopedByContext]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedOrders = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, safePage]);

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages]
  );

  const handleFilterChange = (updater: () => void) => {
    updater();
    setCurrentPage(1);
  };

  const handleLinkOrder = (linkId: string, selectedCustomer: string) => {
    const target = pendingLinks.find((item) => item.id === linkId);
    if (!target || !selectedCustomer) return;

    const meta = DELIVERY_STATUS_META[target.status];
    const newOrder: BrangoTrackedOrder = {
      id: `linked-${target.id}`,
      code: target.code,
      customerName: selectedCustomer,
      commercialName:
        target.reportedCommercial === "Sin asignar"
          ? "Ana Torres"
          : target.reportedCommercial,
      status: target.status,
      originCode: meta.originCode,
      updatedAt: target.receivedAt,
      dateKey: target.dateKey,
      dateLabel: target.dateLabel,
      deliveryDateLabel: `${target.dateLabel} · ${target.receivedAt}`,
      origin: "Brango",
      timeline: [
        {
          time: target.receivedAt,
          status: target.status,
          label: meta.label,
          description: `Pedido vinculado manualmente a ${selectedCustomer}.`,
          completed: true,
          isCurrent: true,
        },
      ],
      history: [
        {
          id: `${target.code}-linked`,
          timestamp: `${target.dateLabel} · ${target.receivedAt}`,
          originCode: meta.originCode,
          status: target.status,
          actor: "Gerencia Aquamundo",
          note: `Vinculado desde pendientes a ${selectedCustomer}.`,
        },
      ],
      evidence:
        target.status === "entregado"
          ? {
              caption: "Fotografía de ejemplo",
              receivedBy: "Recepción en tienda",
              capturedAt: `${target.dateLabel} · ${target.receivedAt}`,
              cargoTag: `${target.code} · Cargo firmado`,
              notes: "Entrega confirmada y vinculada en plataforma.",
            }
          : undefined,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setPendingLinks((prev) => prev.filter((item) => item.id !== linkId));
    toast.success(`Pedido ${target.code} vinculado a ${selectedCustomer}`);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[
          { label: "Gerencia", href: `${APP_ROUTES.DASHBOARD}/` },
          { label: "Seguimiento de pedidos" },
        ]}
        title="Seguimiento de pedidos"
        subtitle="Consulta los estados de entrega recibidos de Brango"
        actions={
          <span className="text-2xs text-zinc-500 whitespace-nowrap">
            Última sincronización: 01 nov 2026 · 10:25
          </span>
        }
        className="pb-1"
      />

      <Tabs
        tabs={[
          { id: "pedidos", label: "Pedidos" },
          {
            id: "vinculaciones",
            label: "Vinculaciones pendientes",
            badge: pendingLinks.length > 0 ? pendingLinks.length : undefined,
          },
        ]}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as "pedidos" | "vinculaciones")}
      />

      {activeTab === "pedidos" ? (
        <div className="bg-white border border-zinc-200/90 rounded-xl p-4 shadow-2xs space-y-4">
          {/* Barra de filtros */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) =>
                  handleFilterChange(() => setSearch(e.target.value))
                }
                placeholder="Buscar pedido o cliente"
                className="w-full h-9 pl-8 pr-3 text-xs bg-white border border-zinc-200 rounded-lg placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-zinc-200 bg-white text-xs">
              <span className="text-zinc-500">Comercial:</span>
              <select
                aria-label="Filtrar por comercial"
                value={commercialFilter}
                onChange={(e) =>
                  handleFilterChange(() => setCommercialFilter(e.target.value))
                }
                className="bg-transparent font-medium text-zinc-900 focus:outline-none cursor-pointer pr-1"
              >
                <option value="all">Todos</option>
                {AVAILABLE_COMMERCIALS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-zinc-200 bg-white text-xs">
              <span className="text-zinc-500">Estado:</span>
              <select
                aria-label="Filtrar por estado"
                value={statusFilter}
                onChange={(e) =>
                  handleFilterChange(() =>
                    setStatusFilter(e.target.value as "all" | BrangoDeliveryStatus)
                  )
                }
                className="bg-transparent font-medium text-zinc-900 focus:outline-none cursor-pointer pr-1"
              >
                <option value="all">Todos</option>
                <option value="entregado">Entregado</option>
                <option value="en_transito">En tránsito</option>
                <option value="pendiente">Pendiente</option>
                <option value="observado">Observado</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-zinc-200 bg-white text-xs">
              <Calendar className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
              <select
                aria-label="Filtrar por fecha"
                value={dateFilter}
                onChange={(e) =>
                  handleFilterChange(() => setDateFilter(e.target.value))
                }
                className="bg-transparent font-medium text-zinc-900 focus:outline-none cursor-pointer pr-1"
              >
                {AVAILABLE_DATE_FILTERS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4 Tarjetas KPI monocromáticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white border border-zinc-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-700 shrink-0">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Pedidos</p>
                <p className="text-2xl font-bold tracking-tight text-zinc-950 leading-tight">
                  {kpis.total}
                </p>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-700 shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Entregados</p>
                <p className="text-2xl font-bold tracking-tight text-zinc-950 leading-tight">
                  {kpis.delivered}
                </p>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-700 shrink-0">
                <Truck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">En tránsito</p>
                <p className="text-2xl font-bold tracking-tight text-zinc-950 leading-tight">
                  {kpis.inTransit}
                </p>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-700 shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Pendientes / Observados</p>
                <p className="text-2xl font-bold tracking-tight text-zinc-950 leading-tight">
                  {kpis.pendingOrObserved}
                </p>
              </div>
            </div>
          </div>

          {/* Tabla de pedidos Brango */}
          <div className="overflow-x-auto rounded-lg border border-zinc-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-zinc-50/90 border-b border-zinc-200 text-zinc-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Pedido Brango</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Comercial</th>
                  <th className="px-4 py-3 font-medium">Estado de entrega</th>
                  <th className="px-4 py-3 font-medium text-center">Actualización</th>
                  <th className="px-4 py-3 font-medium text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                {pagedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-zinc-500">
                      No se encontraron pedidos con los filtros actuales.
                    </td>
                  </tr>
                ) : (
                  pagedOrders.map((order) => {
                    const isSelected = selectedOrder?.id === order.id;
                    return (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={cn(
                          "cursor-pointer transition-colors",
                          isSelected ? "bg-zinc-50" : "hover:bg-zinc-50/70"
                        )}
                      >
                        <td className="px-4 py-3.5 font-semibold text-zinc-950 whitespace-nowrap">
                          {order.code}
                        </td>
                        <td className="px-4 py-3.5 text-zinc-700">
                          {order.customerName}
                        </td>
                        <td className="px-4 py-3.5 text-zinc-600 whitespace-nowrap">
                          {order.commercialName}
                        </td>
                        <td className="px-4 py-3.5">
                          <DeliveryStatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3.5 text-zinc-600 text-center tabular-nums">
                          {order.updatedAt}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            type="button"
                            aria-label={`Ver seguimiento del pedido ${order.code}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                            className="inline-flex items-center justify-center rounded-md p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 text-xs">
            <span className="text-zinc-500">
              Mostrando {pagedOrders.length} de {filteredOrders.length} pedidos
            </span>

            <nav aria-label="Paginación de pedidos" className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Página anterior"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="w-7 h-7 rounded-md border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-900 flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  aria-current={page === safePage ? "page" : undefined}
                  className={cn(
                    "w-7 h-7 rounded-md text-xs font-medium flex items-center justify-center transition-colors",
                    page === safePage
                      ? "bg-zinc-800 text-white font-semibold"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  )}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                aria-label="Página siguiente"
                disabled={safePage >= totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                className="w-7 h-7 rounded-md border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-900 flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </nav>
          </div>
        </div>
      ) : (
        <PendingLinksTab
          pendingLinks={pendingLinks}
          onLinkOrder={handleLinkOrder}
        />
      )}

      <OrderDetailDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};

