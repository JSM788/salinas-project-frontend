"use client";

import React, { useState } from "react";
import { Bell, Menu, Droplets, LogOut } from "lucide-react";
import { useAuth } from "@/shared/lib/auth-context";
import { useBranding } from "@/shared/lib/branding";
import { cn } from "@/shared/lib/utils";

interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarWidth?: string;
  isCollapsed?: boolean;
  connected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  sidebarWidth = "w-52",
  isCollapsed = false,
  connected = false,
}) => {
  const { user, logout } = useAuth();
  const { branding } = useBranding();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-zinc-200 flex items-stretch sticky top-0 z-30 select-none">
      {/* 1. Desktop Top-Left Logo Box: Exactly aligned with sidebar below */}
      <div
        className={cn(
          "hidden md:flex items-center gap-2.5 px-4 border-r border-zinc-200 shrink-0 transition-all duration-200",
          isCollapsed ? "w-16 justify-center px-0" : sidebarWidth
        )}
      >
        {branding.logoUrl && !imgError ? (
          <img
            src={branding.logoUrl}
            alt={branding.companyName}
            onError={() => setImgError(true)}
            className="w-7 h-7 object-contain rounded shrink-0"
          />
        ) : (
          <div className="w-6 h-6 rounded-md bg-[#27272a] text-white flex items-center justify-center shrink-0">
            <Droplets className="h-3.5 w-3.5" />
          </div>
        )}
        {!isCollapsed && (
          <span className="font-bold text-sm tracking-tight text-zinc-900 truncate">
            {branding.companyName || "Aquamundo"}
          </span>
        )}
      </div>

      {/* 2. Main Top Header area */}
      <div className="flex-1 px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Hamburger button + (mobile logo) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors shrink-0"
            title="Alternar menú lateral"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Mini logo visible ONLY on mobile */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0 pr-1">
            {branding.logoUrl && !imgError ? (
              <img
                src={branding.logoUrl}
                alt={branding.companyName}
                onError={() => setImgError(true)}
                className="w-6 h-6 object-contain rounded shrink-0"
              />
            ) : (
              <div className="w-6 h-6 rounded-md bg-[#27272a] text-white flex items-center justify-center shrink-0">
                <Droplets className="h-3.5 w-3.5" />
              </div>
            )}
            <span className="font-bold text-xs tracking-tight text-zinc-900 hidden sm:inline truncate max-w-32">
              {branding.companyName || "Aquamundo"}
            </span>
          </div>
        </div>

        {/* Right: Notifications & User profile */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {!connected && <button
            type="button"
            className="relative p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-md transition-colors"
            title="Notificaciones"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
          </button>}

          {/* User profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-md hover:bg-zinc-50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center text-xs font-bold shrink-0">
                {user?.initials}
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-xs font-semibold text-zinc-900">
                  {user?.name}
                </p>
                <p className="text-2xs text-zinc-400 font-normal">
                  {user?.role}
                </p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 z-50 text-xs">
                <div className="px-3 py-2 border-b border-zinc-100">
                  <p className="font-semibold text-zinc-900">{user?.name}</p>
                  <p className="text-zinc-400 text-2xs">{user?.username.slice(0,8)}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    void logout();
                  }}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
