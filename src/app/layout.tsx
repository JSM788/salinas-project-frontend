import type { Metadata } from "next";
import "@/styles/globals.css";
import { AuthProvider } from "@/shared/lib/auth-context";
import { QueryProvider } from "@/shared/lib/query-provider";
import { DemoStoreProvider } from "@/shared/state/demo-store";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Aquamundo — Plataforma B2B Comercial",
  description: "Gestión comercial B2B para clientes, pedidos, visitas y cobranzas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <Toaster position="top-right" richColors />
        <AuthProvider>
          <QueryProvider>
            <DemoStoreProvider>{children}</DemoStoreProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
