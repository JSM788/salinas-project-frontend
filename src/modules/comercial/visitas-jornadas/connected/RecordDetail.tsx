"use client";
import { useEffect, useState } from "react";
import { z } from "zod";
import { apiRequest, errorText } from "@/shared/api/client";
import { evidenceSchema, exhibitionAuditSchema } from "@/shared/api/contracts";
import { teamRoutes } from "@/shared/api/field-management";
import { Button } from "@/shared/components/ui/button";
import { RegistroVisita } from "../models/visita.model";
import { RegistroVisitaDrawer } from "../components/RegistroVisitaDrawer";

export function RecordDetail({
  record,
  address,
  close,
  team = false,
  audit,
}: {
  record: RegistroVisita;
  address: string;
  close: () => void;
  team?: boolean;
  audit?: z.infer<typeof exhibitionAuditSchema> | null;
}) {
  const [photo, setPhoto] = useState<z.infer<typeof evidenceSchema>>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setPhoto(null);
    apiRequest(
      team
        ? teamRoutes.evidence(record.id)
        : `/me/visits/${record.id}/evidence`,
      evidenceSchema,
    )
      .then((value) => {
        if (active) setPhoto(value);
      })
      .catch((cause) => {
        if (active) setError(errorText(cause));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [record.id, retry, team]);
  const evidence = loading ? (
    <p role="status">Cargando evidencia…</p>
  ) : error ? (
    <div role="alert">
      <p>{error}</p>
      <Button variant="outline" onClick={() => setRetry((value) => value + 1)}>
        Reintentar
      </Button>
    </div>
  ) : photo ? (
    <div className="space-y-2">
      <div className="relative group overflow-hidden rounded-lg border border-zinc-200 bg-zinc-900 flex justify-center items-center">
        <img
          src={photo.base64.startsWith("http") ? photo.base64 : `data:${photo.mimeType};base64,${photo.base64}`}
          alt={`Evidencia de la visita a ${record.clientName}`}
          className="max-h-80 w-full object-contain cursor-zoom-in"
          onClick={() => {
            const url = photo.base64.startsWith("http") ? photo.base64 : `data:${photo.mimeType};base64,${photo.base64}`;
            window.open(url, "_blank");
          }}
        />
        <a
          href={photo.base64.startsWith("http") ? photo.base64 : `data:${photo.mimeType};base64,${photo.base64}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2 right-2 bg-black/80 hover:bg-black text-white text-xs px-2.5 py-1 rounded-md opacity-85 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow"
        >
          🔍 Ver en alta resolución
        </a>
      </div>
      <p className="text-xs text-zinc-500 italic">
        📸 Evidencia certificada con estampa de auditoría y geolocalización. Haz clic para ampliar.
      </p>
    </div>
  ) : (
    <p>Esta visita no tiene evidencia fotográfica.</p>
  );
  return (
    <RegistroVisitaDrawer
      isOpen
      onClose={close}
      registro={record}
      connected={{
        address,
        evidence: (
          <div className="space-y-4">
            {evidence}
            {audit && (
              <section
                aria-label="Auditoría de exhibición"
                className="rounded-md border border-zinc-200 p-3"
              >
                <h3 className="font-semibold mb-2">Auditoría de exhibición</h3>
                <dl className="grid grid-cols-2 gap-2">
                  <dt>Stock en góndola</dt>
                  <dd>{audit.hasShelfStock ? "Sí" : "No"}</dd>
                  {!audit.hasShelfStock && (
                    <>
                      <dt>Motivo</dt>
                      <dd>{audit.noStockReason}</dd>
                    </>
                  )}
                  <dt>Exhibición de marca</dt>
                  <dd>
                    {audit.brandDisplay === "adequate"
                      ? "Adecuada"
                      : "Inadecuada"}
                  </dd>
                  <dt>Precios visibles</dt>
                  <dd>{audit.pricesVisible ? "Sí" : "No"}</dd>
                </dl>
              </section>
            )}
          </div>
        ),
      }}
    />
  );
}
