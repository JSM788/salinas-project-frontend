"use client";

import React from "react";
import { DashboardShell } from "@/shared/layout/DashboardShell";
import { ManagerDashboardView } from "@/modules/inicio";

export default function InicioDashboardPage() {
  return (
    <DashboardShell>
      <ManagerDashboardView />
    </DashboardShell>
  );
}
