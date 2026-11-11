import React from "react";
import { BrangoTrackedOrder } from "../models/brango-order.model";

interface DeliveryEvidencePreviewProps {
  order: BrangoTrackedOrder;
  large?: boolean;
}

/**
 * Representación visual monocromática de ejemplo de fotografía de cargo en tienda.
 * Se reemplazará por la URL real de evidencia enviada por el webhook de Brango.
 */
export const DeliveryEvidencePreview: React.FC<DeliveryEvidencePreviewProps> = ({
  order,
  large = false,
}) => {
  const shortLabel = order.customerName.slice(0, 22);

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 select-none ${
        large ? "h-80" : "h-36"
      }`}
    >
      <svg
        viewBox="0 0 420 220"
        className="h-full w-full object-cover"
        aria-label={`Evidencia de entrega para ${order.code}`}
      >
        <defs>
          <linearGradient id="bgWall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e4e4e7" />
            <stop offset="100%" stopColor="#d4d4d8" />
          </linearGradient>
          <linearGradient id="counterTop" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#52525b" />
            <stop offset="100%" stopColor="#3f3f46" />
          </linearGradient>
          <linearGradient id="boxFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f4f4f5" />
            <stop offset="100%" stopColor="#e4e4e7" />
          </linearGradient>
        </defs>

        {/* Fondo interior de mostrador en escala de grises */}
        <rect width="420" height="220" fill="url(#bgWall)" />

        {/* Estantería trasera difuminada */}
        <g opacity="0.45">
          <rect x="20" y="18" width="90" height="8" rx="2" fill="#a1a1aa" />
          <rect x="24" y="28" width="16" height="28" rx="2" fill="#71717a" />
          <rect x="44" y="26" width="18" height="30" rx="2" fill="#52525b" />
          <rect x="66" y="30" width="20" height="26" rx="2" fill="#71717a" />
          <rect x="90" y="25" width="15" height="31" rx="2" fill="#a1a1aa" />

          <rect x="20" y="64" width="90" height="8" rx="2" fill="#a1a1aa" />
          <rect x="26" y="74" width="20" height="28" rx="2" fill="#52525b" />
          <rect x="52" y="76" width="22" height="26" rx="2" fill="#71717a" />

          <rect x="305" y="18" width="95" height="8" rx="2" fill="#a1a1aa" />
          <rect x="312" y="28" width="18" height="30" rx="2" fill="#71717a" />
          <rect x="334" y="24" width="20" height="34" rx="2" fill="#52525b" />
          <rect x="358" y="29" width="18" height="29" rx="2" fill="#71717a" />
          <rect x="380" y="27" width="16" height="31" rx="2" fill="#a1a1aa" />

          <rect x="305" y="64" width="95" height="8" rx="2" fill="#a1a1aa" />
          <rect x="316" y="74" width="24" height="28" rx="2" fill="#52525b" />
          <rect x="346" y="76" width="22" height="26" rx="2" fill="#71717a" />
        </g>

        {/* Mostrador */}
        <rect x="0" y="138" width="420" height="82" fill="url(#counterTop)" />
        <rect x="0" y="138" width="420" height="4" fill="#71717a" />

        {/* Caja principal sellada */}
        <g>
          <polygon points="105,64 132,48 232,48 212,64" fill="#d4d4d8" stroke="#a1a1aa" strokeWidth="1" />
          <polygon points="212,64 232,48 232,148 212,166" fill="#d4d4d8" stroke="#a1a1aa" strokeWidth="1" />
          <rect x="105" y="64" width="107" height="102" fill="url(#boxFront)" stroke="#a1a1aa" strokeWidth="1" />
          {/* Cinta de sellado */}
          <rect x="152" y="48" width="16" height="16" fill="#a1a1aa" opacity="0.6" />
          <rect x="150" y="64" width="16" height="22" fill="#a1a1aa" opacity="0.45" />
          {/* Etiqueta impresa */}
          <rect x="120" y="96" width="76" height="44" rx="3" fill="#ffffff" stroke="#d4d4d8" />
          <text
            x="158"
            y="114"
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill="#18181b"
            fontFamily="system-ui, sans-serif"
          >
            {order.code}
          </text>
          <text
            x="158"
            y="129"
            textAnchor="middle"
            fontSize="7.5"
            fill="#52525b"
            fontFamily="system-ui, sans-serif"
          >
            {shortLabel}
          </text>
        </g>

        {/* Caja secundaria al costado */}
        <g>
          <polygon points="242,116 260,104 334,104 318,116" fill="#d4d4d8" stroke="#a1a1aa" strokeWidth="1" />
          <polygon points="318,116 334,104 334,158 318,170" fill="#d4d4d8" stroke="#a1a1aa" strokeWidth="1" />
          <rect x="242" y="116" width="76" height="54" fill="url(#boxFront)" stroke="#a1a1aa" strokeWidth="1" />
          <rect x="254" y="132" width="52" height="20" rx="2" fill="#ffffff" stroke="#d4d4d8" />
          <text
            x="280"
            y="145"
            textAnchor="middle"
            fontSize="7"
            fontWeight="600"
            fill="#27272a"
            fontFamily="system-ui, sans-serif"
          >
            CARGO OK
          </text>
        </g>
      </svg>

      {/* Sello de captura */}
      <div className="absolute bottom-2 right-2 rounded bg-zinc-900/80 px-2 py-0.5 text-3xs font-mono text-zinc-100">
        {order.evidence?.capturedAt ?? order.deliveryDateLabel}
      </div>
    </div>
  );
};

