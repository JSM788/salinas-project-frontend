"use client";

import React from "react";
import { DashboardShell } from "@/shared/layout/DashboardShell";
import { PlatformAuditView } from "@/modules/platform";

export default function PlatformAuditPage() {
  return (
    <DashboardShell>
      <PlatformAuditView />
    </DashboardShell>
  );
}
