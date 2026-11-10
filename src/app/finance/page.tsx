"use client";

import React from "react";
import { DashboardShell } from "@/shared/layout/DashboardShell";
import { FinanzasView } from "@/modules/finanzas";

export default function FinanzasPage() {
  return (
    <DashboardShell>
      <FinanzasView />
    </DashboardShell>
  );
}
