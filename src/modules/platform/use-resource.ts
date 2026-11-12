"use client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest, errorText } from "@/shared/api/client";
import { loadDirectory } from "@/shared/api/pagination";

export function useResource<T>(path: string | undefined, schema: z.ZodType<T>) {
  const query = useQuery({
    queryKey: ["api", path],
    queryFn: () => apiRequest(path!, schema),
    enabled: Boolean(path),
    placeholderData: keepPreviousData,
  });
  return {
    data: query.data,
    loading: Boolean(path) && query.isPending,
    error: query.error ? errorText(query.error) : "",
    refresh: async () => {
      if (path) await query.refetch();
    },
  };
}

export function useDirectory<T>(path: string | undefined, schema: z.ZodType<T>) {
  const query = useQuery({
    queryKey: ["directory", path],
    queryFn: () => loadDirectory(path!, schema),
    enabled: Boolean(path),
    placeholderData: keepPreviousData,
  });
  return { data: query.data, loading: Boolean(path) && query.isPending, error: query.error ? errorText(query.error) : "", refresh: () => query.refetch() };
}
