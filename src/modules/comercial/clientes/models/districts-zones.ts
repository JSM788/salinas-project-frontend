export interface DistrictInfo {
  district: string;
  zone: "Lima Centro" | "Lima Norte" | "Lima Sur" | "Lima Este" | "Lima Oeste" | "Callao";
}

export const LIMA_CALLAO_DISTRICTS: DistrictInfo[] = [
  // Lima Centro
  { district: "Cercado de Lima", zone: "Lima Centro" },
  { district: "Breña", zone: "Lima Centro" },
  { district: "Jesús María", zone: "Lima Centro" },
  { district: "Lince", zone: "Lima Centro" },
  { district: "Magdalena del Mar", zone: "Lima Centro" },
  { district: "Miraflores", zone: "Lima Centro" },
  { district: "Pueblo Libre", zone: "Lima Centro" },
  { district: "San Borja", zone: "Lima Centro" },
  { district: "San Isidro", zone: "Lima Centro" },
  { district: "Surquillo", zone: "Lima Centro" },
  { district: "La Victoria", zone: "Lima Centro" },
  { district: "Rímac", zone: "Lima Centro" },
  { district: "Barranco", zone: "Lima Centro" },

  // Lima Sur
  { district: "Santiago de Surco", zone: "Lima Sur" },
  { district: "Chorrillos", zone: "Lima Sur" },
  { district: "San Juan de Miraflores", zone: "Lima Sur" },
  { district: "Villa María del Triunfo", zone: "Lima Sur" },
  { district: "Villa El Salvador", zone: "Lima Sur" },
  { district: "Lurín", zone: "Lima Sur" },
  { district: "Pachacámac", zone: "Lima Sur" },
  { district: "Pucusana", zone: "Lima Sur" },
  { district: "Punta Hermosa", zone: "Lima Sur" },
  { district: "Punta Negra", zone: "Lima Sur" },
  { district: "San Bartolo", zone: "Lima Sur" },
  { district: "Santa María del Mar", zone: "Lima Sur" },

  // Lima Oeste
  { district: "San Miguel", zone: "Lima Oeste" },

  // Callao
  { district: "Callao", zone: "Callao" },
  { district: "Bellavista", zone: "Callao" },
  { district: "Carmen de la Legua", zone: "Callao" },
  { district: "La Perla", zone: "Callao" },
  { district: "La Punta", zone: "Callao" },
  { district: "Ventanilla", zone: "Callao" },
  { district: "Mi Perú", zone: "Callao" },

  // Lima Norte
  { district: "Los Olivos", zone: "Lima Norte" },
  { district: "Independencia", zone: "Lima Norte" },
  { district: "Comas", zone: "Lima Norte" },
  { district: "San Martín de Porres", zone: "Lima Norte" },
  { district: "Carabayllo", zone: "Lima Norte" },
  { district: "Puente Piedra", zone: "Lima Norte" },
  { district: "Ancón", zone: "Lima Norte" },
  { district: "Santa Rosa", zone: "Lima Norte" },

  // Lima Este
  { district: "Ate", zone: "Lima Este" },
  { district: "San Juan de Lurigancho", zone: "Lima Este" },
  { district: "Santa Anita", zone: "Lima Este" },
  { district: "El Agustino", zone: "Lima Este" },
  { district: "La Molina", zone: "Lima Este" },
  { district: "Lurigancho-Chosica", zone: "Lima Este" },
  { district: "Chaclacayo", zone: "Lima Este" },
  { district: "Cieneguilla", zone: "Lima Este" },
];

export const SORTED_DISTRICTS = [...LIMA_CALLAO_DISTRICTS].sort((a, b) =>
  a.district.localeCompare(b.district, "es", { sensitivity: "base" })
);

export const COMMERCIAL_ZONES = [
  "Lima Centro",
  "Lima Norte",
  "Lima Sur",
  "Lima Este",
  "Lima Oeste",
  "Callao",
] as const;

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function findDistrict(text: string): DistrictInfo | undefined {
  if (!text) return undefined;
  const normalized = normalizeText(text);

  const exact = LIMA_CALLAO_DISTRICTS.find(
    (d) => normalizeText(d.district) === normalized
  );
  if (exact) return exact;

  const aliasMap: Record<string, string> = {
    surco: "Santiago de Surco",
    chosica: "Lurigancho-Chosica",
    lurigancho: "Lurigancho-Chosica",
    sjl: "San Juan de Lurigancho",
    sjm: "San Juan de Miraflores",
    smp: "San Martín de Porres",
    vmt: "Villa María del Triunfo",
    ves: "Villa El Salvador",
    magdalena: "Magdalena del Mar",
    cercado: "Cercado de Lima",
    lima: "Cercado de Lima",
    "carmen de la legua reynoso": "Carmen de la Legua",
  };

  if (aliasMap[normalized]) {
    const dName = aliasMap[normalized];
    return LIMA_CALLAO_DISTRICTS.find((d) => d.district === dName);
  }

  const partial = LIMA_CALLAO_DISTRICTS.find((d) => {
    const dNorm = normalizeText(d.district);
    return normalized.includes(dNorm) || (dNorm.length > 5 && dNorm.includes(normalized));
  });
  if (partial) return partial;

  return undefined;
}

export function detectZoneByDistrict(district: string): string {
  if (!district) return "";
  const match = findDistrict(district);
  return match?.zone || "";
}

// Backward-compatibility aliases for smooth transition
export type DistritoInfo = DistrictInfo;
export const DISTRITOS_LIMA_CALLAO = LIMA_CALLAO_DISTRICTS;
export const DISTRITOS_SORTED = SORTED_DISTRICTS.map((d) => ({
  distrito: d.district,
  zona: d.zone,
}));
export const ZONAS_COMERCIALES = COMMERCIAL_ZONES;
export const normalizarTexto = normalizeText;
export const encontrarDistrito = (text: string) => {
  const match = findDistrict(text);
  return match ? { distrito: match.district, zona: match.zone } : undefined;
};
export const detectarZonaPorDistrito = detectZoneByDistrict;

