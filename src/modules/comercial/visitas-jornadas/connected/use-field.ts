"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { apiRequest, errorText } from "@/shared/api/client";
import { runIdempotentCommand } from "@/shared/api/idempotent-command";
import {
  FieldFilters,
  FieldMember,
  fieldMemberSchema,
  fieldQuery,
  teamAgendaSchema,
  teamRoutes,
  teamWorkdaysSchema,
} from "@/shared/api/field-management";
import {
  agendaSchema,
  customerSchema,
  fieldRoutes,
  workdaySchema,
  Customer,
  Visit,
  Workday,
} from "@/shared/api/contracts";

interface Snapshot {
  visits: (Visit & {
    member_email?: string;
    member_role?: FieldMember["role"] | null;
  })[];
  workdays: (Workday & {
    member_email?: string;
    member_role?: FieldMember["role"] | null;
  })[];
  customers: Customer[];
  members: FieldMember[];
}
export function useField(team = false, filters: FieldFilters = {}) {
  const [data, setData] = useState<Snapshot | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [stale, setStale] = useState(false);
  const lock = useRef(false),
    generation = useRef(0);
  const keys = useRef(new Map<string, string>());
  const query = fieldQuery(filters);
  const refresh = useCallback(async () => {
    const current = ++generation.current;
    const [visits, workdays, customers, members] = team
      ? await Promise.all([
          apiRequest(teamRoutes.agenda + query, teamAgendaSchema),
          apiRequest(teamRoutes.workdays + query, teamWorkdaysSchema),
          Promise.resolve([] as Customer[]),
          apiRequest(teamRoutes.members, z.array(fieldMemberSchema)),
        ])
      : await Promise.all([
          apiRequest(fieldRoutes.agenda, agendaSchema),
          apiRequest(fieldRoutes.workdays, z.array(workdaySchema)),
          apiRequest(fieldRoutes.customers, z.array(customerSchema)),
          Promise.resolve([] as FieldMember[]),
        ]);
    if (current === generation.current) {
      setData({ visits, workdays, customers, members });
      setStale(false);
    }
  }, [team, query]);
  const reload = useCallback(async () => {
    if (lock.current) return;
    const revision = generation.current + 1;
    setBusy(true);
    setError("");
    try {
      await refresh();
    } catch (error) {
      if (revision === generation.current) {
        setStale(true);
        setError(errorText(error));
      }
    } finally {
      if (revision === generation.current) setBusy(false);
    }
  }, [refresh]);
  useEffect(() => {
    setData(null);
    generation.current++;
    void reload();
  }, [reload]);
  useEffect(() => {
    const update = () => {
      if (document.visibilityState === "visible") void reload();
    };
    window.addEventListener("focus", update);
    window.addEventListener("online", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.removeEventListener("focus", update);
      window.removeEventListener("online", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [reload]);
  const mutate = async (
    path: string,
    body: unknown,
    schema: z.ZodType<unknown>,
  ) => {
    if (lock.current || stale) return false;
    const fingerprint = JSON.stringify([path, body]);
    lock.current = true;
    generation.current++;
    setBusy(true);
    setError("");
    try {
      await runIdempotentCommand(keys.current, fingerprint, (key) =>
        apiRequest(path, schema, { body, key }),
      );
      try {
        await refresh();
      } catch {
        setStale(true);
        setError(
          "La operación fue aceptada, pero no se pudo actualizar la vista. Pulsa Actualizar antes de continuar.",
        );
      }
      return true;
    } catch (error) {
      setError(errorText(error));
      return false;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return { data, error, busy, stale, reload, mutate };
}
