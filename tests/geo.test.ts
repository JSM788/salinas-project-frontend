import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateRouteDistanceKm,
  haversineDistanceMeters,
} from "../src/shared/lib/geo";

test("calculateRouteDistanceKm sums real Haversine distances across ordered stops", () => {
  const miraflores = { latitude: -12.1191, longitude: -77.0282 };
  const sanIsidro = { latitude: -12.0975, longitude: -77.0365 };
  const limaCentro = { latitude: -12.0464, longitude: -77.0428 };

  assert.equal(calculateRouteDistanceKm([]), 0);
  assert.equal(calculateRouteDistanceKm([miraflores]), 0);

  const leg1 = haversineDistanceMeters(miraflores, sanIsidro);
  const leg2 = haversineDistanceMeters(sanIsidro, limaCentro);
  assert.ok(leg1 > 2000 && leg1 < 3000);
  assert.ok(leg2 > 5000 && leg2 < 6500);

  const expectedKm = Math.round(((leg1 + leg2) / 1000) * 100) / 100;
  assert.equal(
    calculateRouteDistanceKm([miraflores, sanIsidro, limaCentro]),
    expectedKm,
  );
});

