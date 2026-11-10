import { test } from "node:test";
import assert from "node:assert/strict";
import {
  companyDate,
  scheduledInstant,
} from "../src/modules/comercial/visitas-jornadas/connected/planning";

test("web scheduling uses company calendar across UTC date boundaries and rejects nonexistent local times", () => {
  const instant = scheduledInstant("2026-10-25", "23:30", "America/Lima");
  assert.equal(instant, "2026-10-26T04:30:00.000Z");
  assert.equal(companyDate(instant, "America/Lima"), "2026-10-25");
  assert.throws(() => scheduledInstant("2026-02-30", "09:00", "America/Lima"));
  assert.throws(() =>
    scheduledInstant("2026-03-08", "02:30", "America/New_York"),
  );
  assert.throws(() => scheduledInstant("2026-10-25", "24:01", "America/Lima"));
});
