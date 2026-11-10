"use client";

import React, { useState } from "react";
import { Header } from "@/shared/patterns/Header";
import { Sidebar } from "@/shared/patterns/Sidebar";
import { useDemo } from "@/shared/state/demo-store";

interface DashboardShellProps {
  children: React.ReactNode;
  connected?: boolean;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children, connected = false }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { reiniciarDemo } = useDemo();
  const sidebarWidth = "w-52"; // Exactly matching the left logo header block on desktop

  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfcfd] flex flex-col text-zinc-900">
      <Header
        connected={connected}
        onToggleSidebar={handleToggleSidebar}
        isCollapsed={collapsed}
        sidebarWidth={sidebarWidth}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          collapsed={collapsed}
          width={sidebarWidth}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <main className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-6 flex flex-col justify-between">
          <div className="max-w-content w-full mx-auto">{children}</div>

          {/* Discreet watermark */}
          {!connected && <div className="mt-8 pt-4 text-right">
            <span className="text-2xs text-zinc-400 select-none">Datos ficticios</span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Reiniciar la demo? Se descartan los cambios hechos en este navegador.")) {
                  reiniciarDemo();
                }
              }}
              className="ml-3 text-2xs text-zinc-500 underline underline-offset-2 hover:text-zinc-900"
            >
              Reiniciar demo
            </button>
          </div>}
        </main>
      </div>
    </div>
  );
};
