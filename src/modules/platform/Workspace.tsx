"use client";
import { ReactNode } from "react";
import { DashboardShell } from "@/shared/layout/DashboardShell";
import { PageHeader } from "@/shared/patterns/PageHeader";

export function Workspace({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <DashboardShell connected>
      <div className="space-y-5 pb-12">
        <PageHeader
          breadcrumbs={[{ label: "Administración" }, { label: title }]}
          title={title}
          subtitle={subtitle}
          actions={actions}
        />
        {children}
      </div>
    </DashboardShell>
  );
}
export function ResourceStatus({
  loading,
  error,
}: {
  loading: boolean;
  error: string;
}) {
  return (
    <>
      {loading && (
        <p role="status" className="text-sm text-zinc-500">
          Cargando información…
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
        >
          {error}
        </p>
      )}
    </>
  );
}
export const tableClass = "w-full text-left text-sm";
export const cellClass = "px-4 py-3 border-b border-zinc-100";
