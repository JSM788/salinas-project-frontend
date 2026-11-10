"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/config/routes";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`${APP_ROUTES.CUSTOMERS}/`);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-pulse text-xs text-zinc-400">Cargando Aquamundo...</div>
    </div>
  );
}
