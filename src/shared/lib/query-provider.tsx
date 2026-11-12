"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "./auth-context";

function SessionQueryClient({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const identity = session ? `${session.userId}:${session.companyId}` : "anonymous";
  return <SessionQueryClient key={identity}>{children}</SessionQueryClient>;
}
