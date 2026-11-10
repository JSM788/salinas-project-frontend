"use client";

import React from "react";
import { AlertCircle, Calendar, CheckCircle2, Clock, FileText } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  ORDER_STATUS_HINT,
  PAYMENT_STATUS_HINT,
  PAYMENT_STATUS_LABEL,
  Pedido,
  RESERVATION_STATUS_HINT,
  RESERVATION_STATUS_LABEL,
} from "../models/venta.model";

interface PedidoStatusCardsProps {
  pedido: Pedido;
}

/** The Pago / Reserva / Pedido status row, shared by every tab of the order detail. */
export const PedidoStatusCards: React.FC<PedidoStatusCardsProps> = ({ pedido }) => {
  const cards = [
    {
      title: "Pago",
      icon: pedido.paymentStatus === "Conciliado" ? CheckCircle2 : pedido.paymentStatus === "Observado" ? AlertCircle : FileText,
      iconTone: pedido.paymentStatus === "Observado" ? "text-rose-600" : "text-zinc-700",
      value: PAYMENT_STATUS_LABEL[pedido.paymentStatus],
      hint: PAYMENT_STATUS_HINT[pedido.paymentStatus],
    },
    {
      title: "Reserva",
      icon: pedido.reservationStatus === "Confirmada" ? CheckCircle2 : Calendar,
      iconTone: "text-zinc-700",
      value: RESERVATION_STATUS_LABEL[pedido.reservationStatus],
      hint: RESERVATION_STATUS_HINT[pedido.reservationStatus],
    },
    {
      title: "Pedido",
      icon: pedido.orderStatus === "Pendiente de validación" ? Clock : CheckCircle2,
      iconTone: "text-zinc-700",
      value: pedido.orderStatus,
      hint: ORDER_STATUS_HINT[pedido.orderStatus],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map(({ title, icon: Icon, iconTone, value, hint }) => (
        <Card key={title} className="shadow-xs border-zinc-200">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className={`p-2.5 rounded-lg bg-zinc-100 shrink-0 ${iconTone}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xs text-zinc-400 font-medium">{title}</p>
              <p className="text-xs font-bold text-zinc-900">{value}</p>
              <p className="text-2xs text-zinc-500 mt-0.5">{hint}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
