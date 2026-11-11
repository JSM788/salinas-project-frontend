"use client";

import { useEffect, useState } from "react";

export interface CompanyBranding {
  companyName: string;
  subtitle: string;
  logoUrl: string | null;
  digitalDisconnectionHour: string;
  autoCloseRemainingVisits: boolean;
  antiMockGpsRequired: boolean;
  storageProvider: string;
}

const STORAGE_KEY = "salinas_company_branding_v1";

export const DEFAULT_BRANDING: CompanyBranding = {
  companyName: "Salinas / Aquamundo",
  subtitle: "Operaciones de Campo y Gestión Comercial",
  logoUrl: null,
  digitalDisconnectionHour: "19:00",
  autoCloseRemainingVisits: true,
  antiMockGpsRequired: true,
  storageProvider: "Cloudflare R2",
};

export function getStoredBranding(): CompanyBranding {
  if (typeof window === "undefined") return DEFAULT_BRANDING;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_BRANDING;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_BRANDING, ...parsed };
  } catch {
    return DEFAULT_BRANDING;
  }
}

export function saveStoredBranding(branding: Partial<CompanyBranding>): CompanyBranding {
  if (typeof window === "undefined") return DEFAULT_BRANDING;
  const current = getStoredBranding();
  const updated = { ...current, ...branding };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("salinas-branding-updated"));
  } catch (err) {
    console.error("Error saving branding:", err);
  }
  return updated;
}

export function useBranding() {
  const [branding, setBranding] = useState<CompanyBranding>(DEFAULT_BRANDING);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setBranding(getStoredBranding());

    const handler = () => {
      setBranding(getStoredBranding());
    };

    window.addEventListener("salinas-branding-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("salinas-branding-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return { branding, mounted, saveBranding: saveStoredBranding };
}

