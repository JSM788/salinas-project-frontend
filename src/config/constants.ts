/**
 * Application-wide Business & Runtime Constants
 * Single source of truth for business rules, limits, locales and timezones.
 */

export const APP_CONSTANTS = {
  TIMEZONE: "America/Lima",
  LOCALE: "es-PE",
  CURRENCY_SYMBOL: "S/",

  FIELD_OPERATIONS: {
    MAX_STOPS_PER_DAY: 6,
    GEOFENCE_RADIUS_METERS: 50,
    DIGITAL_DISCONNECT_HOUR: 19, // 19:00 hrs
  },

  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 25,
    MAX_PAGE_SIZE: 100,
  },

  HTTP: {
    TIMEOUT_MS: 15_000,
    SESSION_EXPIRED_EVENT: "field-session-expired",
  },
} as const;

