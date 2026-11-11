"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  BookOpen,
  Package,
  CircleDollarSign,
  BarChart3,
  Settings,
  ChevronDown,
  X,
  Droplets,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useAuth } from "@/shared/lib/auth-context";
import { canReadTeam, canAccessWeb, isPlatformOwner } from "@/shared/api/platform";
import { APP_ROUTES } from "@/config/routes";

interface SidebarProps {
  collapsed?: boolean;
  width?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  width = "w-52",
  mobileOpen = false,
  onMobileClose,
}) => {
  const pathname = usePathname();
  const { user, session } = useAuth();
  const [comercialOpen, setComercialOpen] = useState(true);

  // Auto-close mobile drawer on route change
  useEffect(() => {
    if (onMobileClose) {
      onMobileClose();
    }
  }, [pathname]);

  const isComercialActive =
    pathname?.startsWith(APP_ROUTES.CUSTOMERS) ||
    pathname?.startsWith(APP_ROUTES.ROUTES) ||
    pathname?.startsWith(APP_ROUTES.VISITS) ||
    pathname?.startsWith(APP_ROUTES.SALES) ||
    pathname?.startsWith(APP_ROUTES.REQUESTS) ||
    pathname?.startsWith(APP_ROUTES.EXPENSES);

  const comercialSubItems = [
    { label: "Clientes", href: `${APP_ROUTES.CUSTOMERS}/` },
    { label: "Rutas y visitas", href: `${APP_ROUTES.ROUTES}/` },
    // Temporarily hidden for the basic field-visit presentation; modules remain intact.
    // { label: "Ventas", href: `${APP_ROUTES.SALES}/` },
    // { label: "Solicitudes", href: `${APP_ROUTES.REQUESTS}/` },
    // { label: "Gastos", href: `${APP_ROUTES.EXPENSES}/` },
  ];

  const allMainItems = [
    ...(session && isPlatformOwner(session)
      ? [
          {
            label: "Panel Global",
            href: `${APP_ROUTES.ADMIN.ROOT}/`,
            icon: BarChart3,
            hasChildren: false,
          },
          {
            label: "Empresas",
            href: `${APP_ROUTES.ADMIN.COMPANIES}/`,
            icon: Package,
            hasChildren: false,
          },
          {
            label: "Usuarios",
            href: `${APP_ROUTES.ADMIN.USERS}/`,
            icon: Users,
            hasChildren: false,
          },
        ]
      : []),
    ...(!session || !isPlatformOwner(session)
      ? [
          {
            label: "Dashboard",
            href: `${APP_ROUTES.DASHBOARD}/`,
            icon: Home,
            hasChildren: false,
          },
        ]
      : []),
    ...(session && canReadTeam(session)
      ? [{ label: "Equipo", href: `${APP_ROUTES.TEAM}/`, icon: Users, hasChildren: false }]
      : []),
    ...(!session || !canAccessWeb(session) || isPlatformOwner(session) ? [] : [{
      label: "Operación de campo",
      href: `${APP_ROUTES.CUSTOMERS}/`,
      icon: Users,
      hasChildren: true,
    }]),
    // Ocultados temporalmente hasta integración de ERP (SAP / Defontana) y módulos correspondientes
    // { label: "Catálogo", href: "/catalogo/", icon: BookOpen },
    // { label: "Inventario", href: "/inventario/", icon: Package },
    // { label: "Finanzas", href: "/finanzas/", icon: CircleDollarSign },
    // { label: "Reportes", href: "/reportes/", icon: BarChart3 },
    // { label: "Configuración", href: "/configuracion/", icon: Settings },
  ];

  // Rol Finanzas solo visualiza su módulo correspondiente
  const mainItems =
    user?.role === "Finanzas"
      ? allMainItems.filter((item) => item.label === "Finanzas")
      : allMainItems;

  const renderNavItems = (isMobileDrawer: boolean) => (
    <div className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
      {mainItems.map((item) => {
        const Icon = item.icon;

        if (item.hasChildren) {
          return (
            <div key={item.label} className="space-y-0.5">
              <button
                type="button"
                onClick={() => setComercialOpen(!comercialOpen)}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-md transition-colors",
                  isComercialActive
                    ? "text-zinc-950 font-semibold"
                    : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-zinc-500 shrink-0" />
                  {(!collapsed || isMobileDrawer) && <span>{item.label}</span>}
                </div>
                {(!collapsed || isMobileDrawer) && (
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-zinc-400 transition-transform duration-200",
                      comercialOpen && "transform rotate-180",
                    )}
                  />
                )}
              </button>

              {(!collapsed || isMobileDrawer) && comercialOpen && (
                <div className="pl-6 pr-1 space-y-0.5 mt-0.5">
                  {comercialSubItems.map((sub) => {
                    const isSubActive =
                      pathname === sub.href ||
                      (sub.href !== "/commercial/customers/" &&
                        pathname?.startsWith(sub.href)) ||
                      (sub.href === "/commercial/customers/" &&
                        (pathname === "/commercial/customers/" ||
                          pathname?.startsWith("/commercial/customers")));

                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => {
                          if (isMobileDrawer && onMobileClose) onMobileClose();
                        }}
                        className={cn(
                          "block px-2.5 py-1.5 text-xs rounded-md transition-colors",
                          isSubActive
                            ? "bg-zinc-100 text-zinc-950 font-semibold"
                            : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50",
                        )}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        const isActive =
          pathname === item.href ||
          (item.href !== "/" &&
            pathname?.replace(/\/$/, "") === item.href.replace(/\/$/, ""));

        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={() => {
              if (isMobileDrawer && onMobileClose) onMobileClose();
            }}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium rounded-md transition-colors",
              isActive
                ? "bg-zinc-100 text-zinc-950 font-semibold"
                : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50",
            )}
          >
            <Icon className="h-4 w-4 text-zinc-500 shrink-0" />
            {(!collapsed || isMobileDrawer) && <span>{item.label}</span>}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* 1. Desktop Static / Collapsible Sidebar */}
      <aside
        className={cn(
          "hidden md:flex h-[calc(100vh-3.5rem)] bg-white border-r border-zinc-200 transition-all duration-200 flex-col shrink-0 select-none",
          collapsed ? "w-16" : width,
        )}
      >
        {renderNavItems(false)}
      </aside>

      {/* 2. Mobile Floating Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/50 backdrop-blur-2xs md:hidden transition-opacity"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* 3. Mobile Floating Off-Canvas Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex flex-col md:hidden transition-transform duration-300 ease-out select-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Mobile Header with Logo & Close button */}
        <div className="h-14 px-4 border-b border-zinc-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[#27272a] text-white flex items-center justify-center shrink-0">
              <Droplets className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-sm tracking-tight text-zinc-900">
              Aquamundo
            </span>
          </div>
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            title="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Navigation List */}
        {renderNavItems(true)}

        {/* Footer info in Mobile drawer */}
        <div className="p-3 border-t border-zinc-100 bg-zinc-50/50 text-center">
          <p className="text-2xs text-zinc-400">Aquamundo B2B · v1.0</p>
        </div>
      </aside>
    </>
  );
};
