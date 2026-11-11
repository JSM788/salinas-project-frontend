"use client";

import React from "react";
import { DashboardShell } from "@/shared/layout/DashboardShell";
import { OrderTrackingView } from "@/modules/comercial/seguimiento-pedidos";

export default function OrdersTrackingPage() {
  return (
    <DashboardShell>
      <OrderTrackingView />
    </DashboardShell>
  );
}

