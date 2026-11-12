export interface GeoPoint {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_METERS = 6371000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Haversine great-circle distance in meters between two WGS84 points. */
export function haversineDistanceMeters(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Cumulative route distance in kilometers across ordered GPS coordinates. */
export function calculateRouteDistanceKm(points: GeoPoint[]): number {
  if (points.length < 2) return 0;
  let totalMeters = 0;
  for (let i = 1; i < points.length; i++) {
    totalMeters += haversineDistanceMeters(points[i - 1], points[i]);
  }
  return Math.round((totalMeters / 1000) * 100) / 100;
}

/** Checks whether a string is an HTTP/HTTPS URL. */
export function isHttpUrl(value?: string | null): boolean {
  return Boolean(value && /^https?:\/\//i.test(value.trim()));
}

export interface GoogleMapsUrlOptions {
  lat?: number | null;
  lng?: number | null;
  address?: string | null;
  name?: string | null;
  district?: string | null;
}

/**
 * Builds a valid Google Maps URL.
 * Never uses fake coordinate fallbacks: if coordinates are absent, falls back to real address or query.
 */
export function getGoogleMapsUrl(options: GoogleMapsUrlOptions): string {
  const { lat, lng, address, name, district } = options;

  if (typeof lat === "number" && typeof lng === "number" && !isNaN(lat) && !isNaN(lng)) {
    return `https://maps.google.com/?q=${lat},${lng}`;
  }

  if (isHttpUrl(address)) {
    return address!.trim();
  }

  const queryParts = [name, address, district].filter(
    (p): p is string => Boolean(p && p.trim() && !isHttpUrl(p)),
  );

  if (queryParts.length > 0) {
    return `https://maps.google.com/?q=${encodeURIComponent(queryParts.join(", "))}`;
  }

  return "https://maps.google.com";
}
