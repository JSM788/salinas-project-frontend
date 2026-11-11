import React from "react";
import { AlertCircle, CheckCircle2, Clock, Truck } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  BrangoDeliveryStatus,
  DELIVERY_STATUS_META,
} from "../models/brango-order.model";

interface DeliveryStatusBadgeProps {
  status: BrangoDeliveryStatus;
  className?: string;
}

const STATUS_STYLE: Record<
  BrangoDeliveryStatus,
  { container: string; icon: React.ComponentType<{ className?: string }> }
> = {
  entregado: {
    container: "bg-zinc-900 text-white border-zinc-900",
    icon: CheckCircle2,
  },
  en_transito: {
    container: "bg-zinc-100 text-zinc-700 border-zinc-200",
    icon: Truck,
  },
  pendiente: {
    container: "bg-white text-zinc-700 border-zinc-200",
    icon: Clock,
  },
  observado: {
    container: "bg-white text-zinc-800 border-zinc-300",
    icon: AlertCircle,
  },
};

export const DeliveryStatusBadge: React.FC<DeliveryStatusBadgeProps> = ({
  status,
  className,
}) => {
  const { container, icon: Icon } = STATUS_STYLE[status];
  const { label } = DELIVERY_STATUS_META[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-2xs font-medium whitespace-nowrap",
        container,
        className
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{label}</span>
    </span>
  );
};

