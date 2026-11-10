import { test } from "node:test";
import assert from "node:assert/strict";
import { planningForDate } from "../src/modules/comercial/visitas-jornadas/connected/planning";
import type { Visit, Workday } from "../src/shared/api/contracts";

test("an overdue visit executed today appears in today workday counts and records, while agenda retains its planned date", () => {
  const id = "ce08cf53-561c-44c5-9c24-466f72612c42";
  const day: Workday = {
    id,
    company_id: id,
    membership_id: id,
    business_date: "2026-10-24",
    role: "commercial",
    completed_visits: 1,
    total_visits: 2,
    status: "active",
    started_at: "2026-10-24T14:00:00Z",
    ended_at: null,
  };
  const visit: Visit = {
    id,
    company_id: id,
    membership_id: id,
    customer_id: id,
    customer_name: "Assigned customer",
    customer_address: "Address",
    has_evidence: true,
    version: 0,
    planned_role: "commercial",
    execution_role: "commercial",
    cancelled_at: null,
    cancellation_reason: null,
    scheduled_at: "2026-10-23T14:00:00Z",
    workday_id: id,
    status: "completed",
    arrived_at: "2026-10-24T14:01:00Z",
    ended_at: "2026-10-24T14:05:00Z",
    result: "attended",
    observations: "Recorded today",
  };
  const pending: Visit = {
    ...visit,
    id: "1",
    workday_id: null,
    status: "pending",
    arrived_at: null,
    ended_at: null,
    result: null,
    observations: null,
    has_evidence: false,
  };
  const future: Visit = {
    ...pending,
    id: "2",
    scheduled_at: "2026-10-25T14:00:00Z",
  };
  const selected = planningForDate(
    [visit, pending, future],
    [day],
    "2026-10-24",
    "America/Lima",
  );
  assert.equal(selected.agenda.length, 0);
  assert.equal(selected.records[0].id, visit.id);
  assert.equal(selected.summaries[0].completed, 1);
  assert.equal(selected.summaries[0].total, 2);
  assert.equal(selected.pendingDue.length, 1);
  assert.equal(
    planningForDate(
      [visit],
      [{ ...day, status: "completed", total_visits: 1 }],
      "2026-10-24",
      "America/Lima",
    ).summaries[0].total,
    1,
  );
});
