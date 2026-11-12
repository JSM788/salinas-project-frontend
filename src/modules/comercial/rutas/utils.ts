import { DAYS_OF_WEEK } from "@/shared/lib/date";
import { getGoogleMapsUrl, isHttpUrl } from "@/shared/lib/geo";
import type { Stop, WeekRoutesMap } from "./types";

export function formatStopSubtitle(district?: string | null, address?: string | null): string {
  const cleanDistrict = (district ?? "").trim();
  const cleanAddress = isHttpUrl(address) ? "" : (address ?? "").trim();
  return [cleanDistrict, cleanAddress].filter(Boolean).join(" • ") || "Sin dirección registrada";
}

export function getStopMapsUrl(
  stop: Pick<Stop, "lat" | "lng" | "hasCoords" | "address" | "name" | "district">,
): string {
  return getGoogleMapsUrl({
    lat: stop.hasCoords ? stop.lat : null,
    lng: stop.hasCoords ? stop.lng : null,
    address: stop.address,
    name: stop.name,
    district: stop.district,
  });
}

/**
 * Builds a multi-stop Google Maps directions URL for an ordered list of stops.
 * Never uses fake coordinate fallbacks.
 */
export function getGoogleMapsDirUrl(stops: Stop[]): string {
  if (stops.length === 0) return "https://www.google.com/maps";
  if (stops.length === 1) return getStopMapsUrl(stops[0]);

  const coordinatesPath = stops
    .map((s) => {
      if (s.hasCoords && s.lat != null && s.lng != null) {
        return `${s.lat},${s.lng}`;
      }
      const textQuery = [s.name, isHttpUrl(s.address) ? "" : s.address, s.district, "Peru"]
        .filter(Boolean)
        .join(", ");
      return encodeURIComponent(textQuery);
    })
    .filter(Boolean)
    .join("/");

  return `https://www.google.com/maps/dir/${coordinatesPath}`;
}

export function isLockedStop(stop: Pick<Stop, "visitStatus">): boolean {
  return stop.visitStatus === "active" || stop.visitStatus === "completed";
}

export function createEmptyRoutesMap(): WeekRoutesMap {
  const map: WeekRoutesMap = {};
  for (const day of DAYS_OF_WEEK) {
    map[day.key] = [];
  }
  return map;
}
