"use client";
import { useEffect, useState } from "react";
import { Input } from "@/shared/components/ui/input";
import { scheduledInstant } from "./planning";

export function CompanyDateFilter({
  value,
  timeZone,
  onApply,
}: {
  value: string;
  timeZone: string;
  onApply: (date: string) => void;
}) {
  const [draft, setDraft] = useState(value),
    [error, setError] = useState("");
  useEffect(() => {
    setDraft(value);
    setError("");
  }, [value]);
  const changeDate = (value: string) => {
    setDraft(value);
    setError("");
    try {
      scheduledInstant(value, "12:00", timeZone);
      onApply(value);
    } catch {
      setError("Selecciona una fecha válida.");
    }
  };
  return (
    <div className="space-y-1">
      <div className="space-y-1 text-xs">
        <label htmlFor="planning-day" className="font-medium">
          Fecha
        </label>
        <div className="w-44">
          <Input
            id="planning-day"
            type="date"
            value={draft}
            onChange={(event) => changeDate(event.target.value)}
            aria-invalid={Boolean(error)}
            required
          />
        </div>
      </div>
      {error && (
        <p role="alert" className="text-xs text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}
