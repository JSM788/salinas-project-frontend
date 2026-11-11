"use client";

import React from "react";
import { DashboardShell } from "@/shared/layout/DashboardShell";
import { PlatformDashboardView } from "@/modules/platform";

export default function AdminDashboardPage() {
  return (
    <DashboardShell>
      <PlatformDashboardView />
    </DashboardShell>
  );
}

