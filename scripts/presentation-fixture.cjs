// Explicit local presentation tooling. Never loaded by the application or run on startup.
const { readFile, writeFile } = require("node:fs/promises");
const { randomUUID, randomBytes } = require("node:crypto");
const {
  PostgresDatabase,
} = require("../../backend/dist/src/platform/database");
const {
  ScryptPasswordHasher,
} = require("../../backend/dist/src/modules/identity/infrastructure/node-credentials");

async function main() {
  const url = new URL(process.env.DATABASE_URL);
  if (
    url.hostname !== "localhost" ||
    url.port !== "5433" ||
    url.pathname !== "/salinas"
  )
    throw new Error(
      "Only the dedicated local presentation database is allowed",
    );
  const fixture = JSON.parse(
    await readFile(".integration/fixture.json", "utf8"),
  );
  const db = new PostgresDatabase(url.toString());
  try {
    const [company] = await db.query(
      "SELECT id,slug,time_zone,(now() AT TIME ZONE time_zone)::date::text AS business_date FROM companies WHERE id=$1 AND slug=$2",
      [fixture.companyId, fixture.company],
    );
    if (!company) throw new Error("The local fixture company does not match");
    if (process.argv[2] === "test-user") {
      const tag = randomUUID().slice(0, 8),
        userId = randomUUID(),
        membershipId = randomUUID();
      const email = "circuit-" + tag + "@example.invalid",
        password = randomBytes(24).toString("base64url");
      const hash = await new ScryptPasswordHasher().hash(password);
      const customerIds = [randomUUID(), randomUUID()];
      await db.transaction(async (tx) => {
        await tx.query(
          "INSERT INTO users(id,email,password_hash) VALUES($1,$2,$3)",
          [userId, email, hash],
        );
        await tx.query(
          "INSERT INTO memberships(id,company_id,user_id,role) VALUES($1,$2,$3,'commercial')",
          [membershipId, company.id, userId],
        );
        for (const [index, id] of customerIds.entries()) {
          await tx.query(
            "INSERT INTO customers(id,company_id,name,address) VALUES($1,$2,$3,$4)",
            [
              id,
              company.id,
              "Cliente circuito " + (index + 1) + " " + tag,
              "Dirección de prueba " + (index + 1),
            ],
          );
          await tx.query(
            "INSERT INTO customer_assignments(company_id,customer_id,membership_id) VALUES($1,$2,$3)",
            [company.id, id, membershipId],
          );
        }
      });
      await writeFile(
        ".integration/circuit-user.json",
        JSON.stringify(
          {
            companyId: company.id,
            userId,
            membershipId,
            email,
            password,
            customerIds,
            date: company.business_date,
          },
          null,
          2,
        ),
      );
      console.log(
        "Separate local verification member and two assigned customers created; original account/history untouched.",
      );
      return;
    }
    if (process.argv[2] !== "prepare")
      throw new Error("Use test-user or prepare");
    const date = process.env.PRESENTATION_DATE;
    if (
      !date ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      new Date(date + "T00:00:00Z").toISOString().slice(0, 10) !== date
    )
      throw new Error("PRESENTATION_DATE must be an explicit valid YYYY-MM-DD");
    const api = new URL(process.env.API_URL);
    if (
      !["localhost", "127.0.0.1"].includes(api.hostname) ||
      api.protocol !== "http:" ||
      api.pathname !== "/" ||
      api.port !== "3002"
    )
      throw new Error(
        "Only the explicit local API origin on port3002 is allowed",
      );
    const customers = [];
    for (let index = 1; index <= 2; index++) {
      customers.push(
        await db.transaction(async (tx) => {
          await tx.query(
            "SELECT id FROM memberships WHERE company_id=$1 AND id=$2 FOR UPDATE",
            [company.id, fixture.membershipId],
          );
          const name = "Cliente presentación " + index,
            address = "Dirección de demostración " + index;
          const existing = await tx.query(
            "SELECT c.id FROM customers c JOIN customer_assignments a ON a.company_id=c.company_id AND a.customer_id=c.id WHERE c.company_id=$1 AND a.membership_id=$2 AND c.name=$3 AND c.address=$4",
            [company.id, fixture.membershipId, name, address],
          );
          if (existing.length > 1)
            throw new Error("Ambiguous presentation customer");
          if (existing.length === 1) return existing[0].id;
          const id = randomUUID();
          await tx.query(
            "INSERT INTO customers(id,company_id,name,address) VALUES($1,$2,$3,$4)",
            [id, company.id, name, address],
          );
          await tx.query(
            "INSERT INTO customer_assignments(company_id,customer_id,membership_id) VALUES($1,$2,$3)",
            [company.id, id, fixture.membershipId],
          );
          return id;
        }),
      );
    }
    let token;
    const request = async (path, body, key) => {
      const response = await fetch(api.origin + "/v1" + path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Host": "localhost",
          ...(token ? { Authorization: "Bearer " + token } : {}),
          ...(key ? { "Idempotency-Key": key } : {}),
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error("Presentation API rejected: " + data.code);
      return data;
    };
    token = (
      await request("/auth/login", {
        email: fixture.email,
        password: fixture.password,
      })
    ).token;
    try {
      const visits = [];
      for (const [index, customerId] of customers.entries()) {
        const [time] = await db.query(
          "SELECT ($1::timestamp AT TIME ZONE time_zone) AS instant FROM companies WHERE id=$2",
          [date + " " + String(9 + index).padStart(2, "0") + ":00", company.id],
        );
        visits.push(
          await request(
            "/me/visits",
            { customerId, scheduledAt: new Date(time.instant).toISOString() },
            "presentation:" + date + ":" + customerId,
          ),
        );
      }
      await writeFile(
        ".integration/presentation.json",
        JSON.stringify(
          { date, customers, visits: visits.map((visit) => visit.id) },
          null,
          2,
        ),
      );
      console.log(
        "Two presentation visits scheduled through the real API for " +
          date +
          "; existing history preserved.",
      );
    } finally {
      if (token) await request("/auth/logout", {});
    }
  } finally {
    await db.close();
  }
}
main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Local presentation setup failed",
  );
  process.exitCode = 1;
});
