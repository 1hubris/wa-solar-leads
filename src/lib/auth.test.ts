import { test } from "node:test";
import assert from "node:assert/strict";
import {
  extractClientKey,
  getAuthConfigStatus,
  getThrottleMapSize,
  isStrongToken,
  isThrottled,
  MAX_THROTTLE_KEYS,
  resetThrottleForTests,
  resolveRole,
  resolveRoleFromCode,
} from "./auth.ts";
import {
  handleTenderGet,
  handleTenderPost,
  type TenderDb,
  type TenderJobRecord,
  type VariationRecord,
} from "./tenderLogic.ts";

const STRONG_ADMIN = "adm-9f3k2-strong-token-2026-x9";
const STRONG_PARTNER = "ptn-7h1q8-strong-token-2026-y8";
const STRONG_CONSULTANT = "cns-4m2p9-strong-token-2026-z7";

function withEnv(env: Record<string, string | undefined>, fn: () => void | Promise<void>) {
  const keys = ["SUNNY_ADMIN_TOKEN", "SUNNY_API_TOKEN", "SUNNY_PARTNER_TOKEN", "SUNNY_CONSULTANT_TOKEN"];
  const saved = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
  for (const k of keys) delete process.env[k];
  for (const [k, v] of Object.entries(env)) if (v !== undefined) process.env[k] = v;
  resetThrottleForTests();
  return Promise.resolve(fn()).finally(() => {
    for (const k of keys) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
    resetThrottleForTests();
  });
}

function createFakeTenderDb(initialJobs: TenderJobRecord[] = []): {
  db: TenderDb;
  jobs: Map<string, TenderJobRecord>;
  variations: Map<string, VariationRecord>;
} {
  const jobs = new Map<string, TenderJobRecord>();
  const variations = new Map<string, VariationRecord>();

  for (const j of initialJobs) {
    jobs.set(j.id, { ...j, variations: [...(j.variations || [])] });
    for (const v of j.variations || []) {
      variations.set(v.id, { ...v });
    }
  }

  function hydrateJob(id: string): TenderJobRecord | null {
    const j = jobs.get(id);
    if (!j) return null;
    const jobVars = Array.from(variations.values()).filter((v) => v.jobId === id);
    return { ...j, variations: jobVars.map((v) => ({ ...v })) };
  }

  const db: TenderDb = {
    tenderJob: {
      async findMany({ take, skip }) {
        const all = Array.from(jobs.keys())
          .map((id) => hydrateJob(id)!)
          .filter(Boolean);
        return all.slice(skip, skip + take);
      },
      async findUnique({ where }) {
        return hydrateJob(where.id);
      },
      async findUniqueOrThrow({ where }) {
        const found = hydrateJob(where.id);
        if (!found) throw new Error("NotFound");
        return found;
      },
      async update({ where, data }) {
        const current = jobs.get(where.id);
        if (!current || (where.status !== undefined && current.status !== where.status)) {
          const err = new Error("Record to update not found.") as Error & { code?: string };
          err.code = "P2025";
          throw err;
        }
        const updated: TenderJobRecord = {
          ...current,
          ...(data as Partial<TenderJobRecord>),
        };
        jobs.set(where.id, updated);
        return hydrateJob(where.id)!;
      },
      async updateMany({ where, data }) {
        const current = jobs.get(where.id);
        if (!current) return { count: 0 };
        if (typeof where.status === "string" && current.status !== where.status) {
          return { count: 0 };
        }
        if (
          where.status &&
          typeof where.status === "object" &&
          "not" in where.status &&
          current.status === where.status.not
        ) {
          return { count: 0 };
        }
        if (where.payout !== undefined && Number(current.payout) !== where.payout) {
          return { count: 0 };
        }
        const next = { ...current };
        if (data.status !== undefined) next.status = data.status;
        if (data.payout !== undefined) {
          if (typeof data.payout === "object" && "increment" in data.payout) {
            next.payout = Number(next.payout) + data.payout.increment;
          } else if (typeof data.payout === "number") {
            next.payout = data.payout;
          }
        }
        jobs.set(where.id, next);
        return { count: 1 };
      },
      async create({ data }) {
        const customerCreate = (data.customer as { create?: TenderJobRecord["customer"] })?.create ?? null;
        const record: TenderJobRecord = {
          ...(data as unknown as TenderJobRecord),
          customer: customerCreate,
          variations: [],
        };
        jobs.set(record.id, record);
        return hydrateJob(record.id)!;
      },
    },
    variation: {
      async findUnique({ where }) {
        const v = variations.get(where.id);
        return v ? { ...v } : null;
      },
      async findUniqueOrThrow({ where }) {
        const v = variations.get(where.id);
        if (!v) throw new Error("VariationNotFound");
        return { ...v };
      },
      async findMany({ where }) {
        return Array.from(variations.values())
          .filter((v) => v.jobId === where.jobId && (!where.status || v.status === where.status))
          .map((v) => ({ ...v }));
      },
      async create({ data }) {
        if (variations.has(data.id)) {
          const err = new Error("Unique constraint failed") as Error & { code?: string };
          err.code = "P2002";
          throw err;
        }
        variations.set(data.id, { ...data });
        return { ...data };
      },
      async updateMany({ where, data }) {
        const v = variations.get(where.id);
        if (!v || v.status !== where.status) return { count: 0 };
        variations.set(where.id, { ...v, status: data.status });
        return { count: 1 };
      },
    },
    async $transaction(fn) {
      return fn(db);
    },
  };

  return { db, jobs, variations };
}

function makeBaseJob(overrides: Partial<TenderJobRecord> = {}): TenderJobRecord {
  return {
    id: "JOB-TEST-01",
    suburb: "Perth Metro, WA",
    size: 6.6,
    tier: 2,
    tierName: "Advanced",
    battery: 10,
    roof: "Colorbond / Single Story",
    extras: "[]",
    payout: 9500,
    hardwareCost: 6000,
    laborCost: 1900,
    warrantyFund: 650,
    leadGenCut: 4200,
    consultantCut: 750,
    timeRemaining: "45:00",
    isHot: true,
    status: "Claimed",
    claimedBy: "Installer_094",
    claimedAt: "2026-10-31T00:00:00.000Z",
    customer: {
      name: "Alice Homeowner",
      phone: "0411 222 333",
      email: "alice@example.com",
      address: "10 St Georges Tce, Perth WA",
    },
    variations: [],
    ...overrides,
  };
}

test("fails closed: with no env tokens, previously-hardcoded codes authenticate nobody", async () => {
  await withEnv({}, () => {
    for (const legacy of ["2026", "SUNNYEX", "CONSULTANT", "EC-094", "sunnyex", ""]) {
      assert.equal(resolveRoleFromCode(legacy), null, `legacy code ${JSON.stringify(legacy)} must be rejected`);
    }
  });
});

test("negative control: short (<24 char) or low-diversity tokens set in env cannot authenticate", async () => {
  await withEnv({ SUNNY_ADMIN_TOKEN: "2026" }, () => {
    assert.equal(resolveRoleFromCode("2026"), null);
  });
  await withEnv({ SUNNY_ADMIN_TOKEN: "aaaaaaaaaaaaaaaaaaaaaaaaaaaa" }, () => {
    assert.equal(isStrongToken("aaaaaaaaaaaaaaaaaaaaaaaaaaaa"), false);
    assert.equal(resolveRoleFromCode("aaaaaaaaaaaaaaaaaaaaaaaaaaaa"), null);
  });
  await withEnv({ SUNNY_ADMIN_TOKEN: "onlylowercaselettersandlongenough" }, () => {
    assert.equal(isStrongToken("onlylowercaselettersandlongenough"), false);
    assert.equal(resolveRoleFromCode("onlylowercaselettersandlongenough"), null);
  });
});

test("strong tokens resolve to the right role; comparison is case-sensitive", async () => {
  await withEnv(
    {
      SUNNY_ADMIN_TOKEN: STRONG_ADMIN,
      SUNNY_PARTNER_TOKEN: STRONG_PARTNER,
      SUNNY_CONSULTANT_TOKEN: STRONG_CONSULTANT,
    },
    () => {
      assert.equal(resolveRoleFromCode(STRONG_ADMIN), "admin");
      assert.equal(resolveRoleFromCode(STRONG_PARTNER), "partner");
      assert.equal(resolveRoleFromCode(STRONG_CONSULTANT), "consultant");
      assert.equal(resolveRoleFromCode(STRONG_ADMIN.toUpperCase()), null);
      assert.equal(resolveRoleFromCode(STRONG_ADMIN + "x"), null);
      const status = getAuthConfigStatus();
      assert.deepEqual(status, {
        configured: { admin: true, partner: true, consultant: true },
        ready: true,
      });
    }
  );
});

test("throttle blocks after 10 failed attempts on resolveRole, caps Map memory at MAX_THROTTLE_KEYS, and uses last XFF hop", async () => {
  await withEnv({ SUNNY_ADMIN_TOKEN: STRONG_ADMIN }, () => {
    const now = 1_000_000;
    // Verify last-hop extraction on x-forwarded-for
    const spoofedReq = new Request("https://example.com/api/tender", {
      headers: {
        "x-forwarded-for": "1.2.3.4, 198.51.100.77",
        "x-sunny-auth": "wrong-attempt",
      },
    });
    assert.equal(extractClientKey(spoofedReq), "ip:198.51.100.77");

    // Off-Vercel, a spoofed x-vercel-forwarded-for header is ignored in favor of last XFF hop (N1 fix)
    const spoofedVercelHeaderReq = new Request("https://example.com/api/tender", {
      headers: {
        "x-vercel-forwarded-for": "8.8.8.8",
        "x-forwarded-for": "1.2.3.4, 198.51.100.77",
        "x-sunny-auth": "wrong-attempt",
      },
    });
    assert.equal(extractClientKey(spoofedVercelHeaderReq), "ip:198.51.100.77");

    // 10 failed attempts from 198.51.100.77 trigger throttle; 11th attempt even with valid token is blocked
    for (let i = 0; i < 10; i++) {
      assert.equal(resolveRole(spoofedReq, now), null);
    }
    const validReqSameIp = new Request("https://example.com/api/tender", {
      headers: {
        "x-forwarded-for": "9.9.9.9, 198.51.100.77",
        "x-sunny-auth": STRONG_ADMIN,
      },
    });
    assert.equal(resolveRole(validReqSameIp, now), null, "throttled IP must be blocked even with valid token");
    assert.equal(resolveRole(validReqSameIp, now + 61_000), "admin", "throttle resets after window");

    // Memory DoS test: 10,000 spoofed IPs never exceed MAX_THROTTLE_KEYS
    for (let i = 0; i < 10_000; i++) {
      isThrottled(`ip:10.0.${Math.floor(i / 256)}.${i % 256}`, now);
    }
    assert.ok(
      getThrottleMapSize() <= MAX_THROTTLE_KEYS,
      `throttle Map size ${getThrottleMapSize()} exceeded MAX_THROTTLE_KEYS ${MAX_THROTTLE_KEYS}`
    );
  });
});

test("consultant PII redaction and role scoping on /api/tender GET and POST", async () => {
  const { db } = createFakeTenderDb([makeBaseJob()]);

  // Consultant GET sees CONFIDENTIAL customer PII on claimed jobs
  const consultantGet = await handleTenderGet(db, "consultant", {});
  const claimedForConsultant = (consultantGet.body.data as { claimed: Array<{ customer: { name: string } }> }).claimed;
  assert.equal(claimedForConsultant[0].customer.name, "CONFIDENTIAL");

  // Partner GET sees real customer PII on claimed jobs
  const partnerGet = await handleTenderGet(db, "partner", {});
  const claimedForPartner = (partnerGet.body.data as { claimed: Array<{ customer: { name: string } }> }).claimed;
  assert.equal(claimedForPartner[0].customer.name, "Alice Homeowner");

  // Consultant POST cannot claim, add_variation, or update_status
  const cClaim = await handleTenderPost(db, "consultant", { action: "claim", jobId: "JOB-TEST-01" }, null);
  assert.equal(cClaim.status, 403);
  const cVar = await handleTenderPost(
    db,
    "consultant",
    { action: "add_variation", jobId: "JOB-TEST-01", reason: "Asbestos panel", amount: 500 },
    null
  );
  assert.equal(cVar.status, 403);
  const cStatus = await handleTenderPost(
    db,
    "consultant",
    { action: "update_status", jobId: "JOB-TEST-01", status: "Site Inspected" },
    null
  );
  assert.equal(cStatus.status, 403);
});

test("variation lifecycle: pending leaves payout untouched; payload mismatch returns 409; approval enforces signed cap, non-negative floor, Settled lock, and concurrency guard", async () => {
  const { db, jobs } = createFakeTenderDb([makeBaseJob({ payout: 9500 })]);

  // 1. Partner raises variation with idempotency key -> payout stays 9500
  const v1 = await handleTenderPost(
    db,
    "partner",
    { action: "add_variation", jobId: "JOB-TEST-01", reason: "Switchboard upgrade", amount: 1000 },
    "idem-key-1"
  );
  assert.equal(v1.status, 200);
  assert.equal(jobs.get("JOB-TEST-01")!.payout, 9500);

  // 2. Retry with SAME idempotency key and SAME payload succeeds idempotently
  const v1Retry = await handleTenderPost(
    db,
    "partner",
    { action: "add_variation", jobId: "JOB-TEST-01", reason: "Switchboard upgrade", amount: 1000 },
    "idem-key-1"
  );
  assert.equal(v1Retry.status, 200);

  // 3. Retry with SAME idempotency key but DIFFERENT amount returns 409 Conflict (M3 fix)
  const v1Mismatch = await handleTenderPost(
    db,
    "partner",
    { action: "add_variation", jobId: "JOB-TEST-01", reason: "Switchboard upgrade", amount: 5000 },
    "idem-key-1"
  );
  assert.equal(v1Mismatch.status, 409);

  // 4. Partner cannot approve variation (403)
  const varId = (v1.body.data as { variations: VariationRecord[] }).variations[0].id;
  const partnerApprove = await handleTenderPost(
    db,
    "partner",
    { action: "approve_variation", variationId: varId, decision: "approve" },
    null
  );
  assert.equal(partnerApprove.status, 403);

  // 5. Admin approves variation -> payout becomes 10500; second approve returns 409
  const adminApprove = await handleTenderPost(
    db,
    "admin",
    { action: "approve_variation", variationId: varId, decision: "approve" },
    null
  );
  assert.equal(adminApprove.status, 200);
  assert.equal(jobs.get("JOB-TEST-01")!.payout, 10500);

  const duplicateApprove = await handleTenderPost(
    db,
    "admin",
    { action: "approve_variation", variationId: varId, decision: "approve" },
    null
  );
  assert.equal(duplicateApprove.status, 409);

  // 6. Cumulative cap: adding +14,500 when +1,000 is already approved exceeds +15,000 cap -> 422
  const vCap = await handleTenderPost(
    db,
    "partner",
    { action: "add_variation", jobId: "JOB-TEST-01", reason: "Major trenching work", amount: 14500 },
    "idem-cap"
  );
  const capVarId = (vCap.body.data as { variations: VariationRecord[] }).variations.find((v) => v.amount === 14500)!.id;
  const approveOverCap = await handleTenderPost(
    db,
    "admin",
    { action: "approve_variation", variationId: capVarId, decision: "approve" },
    null
  );
  assert.equal(approveOverCap.status, 422);
  assert.equal(jobs.get("JOB-TEST-01")!.payout, 10500);

  // 7. Payout floor: if job payout is 2000 and a -3000 deduction is approved -> 422 PAYOUT_FLOOR
  jobs.get("JOB-TEST-01")!.payout = 2000;
  const vNeg = await handleTenderPost(
    db,
    "partner",
    { action: "add_variation", jobId: "JOB-TEST-01", reason: "Deleted battery scope", amount: -3000 },
    "idem-neg"
  );
  const negVarId = (vNeg.body.data as { variations: VariationRecord[] }).variations.find((v) => v.amount === -3000)!.id;
  const approveBelowZero = await handleTenderPost(
    db,
    "admin",
    { action: "approve_variation", variationId: negVarId, decision: "approve" },
    null
  );
  assert.equal(approveBelowZero.status, 422);
  assert.equal(jobs.get("JOB-TEST-01")!.payout, 2000);

  // 8. Settled lock: once Settled, neither add_variation nor approve_variation is permitted (409)
  const settleRes = await handleTenderPost(
    db,
    "admin",
    { action: "update_status", jobId: "JOB-TEST-01", status: "Settled" },
    null
  );
  assert.equal(settleRes.status, 200);
  const addOnSettled = await handleTenderPost(
    db,
    "partner",
    { action: "add_variation", jobId: "JOB-TEST-01", reason: "Post-settlement claim", amount: 500 },
    null
  );
  assert.equal(addOnSettled.status, 409);
});

test("update_status enforces single-step partner progression and atomic status CAS", async () => {
  const { db, jobs } = createFakeTenderDb([makeBaseJob({ status: "Claimed" })]);

  // Partner cannot skip from Claimed to Installed (403)
  const skipStep = await handleTenderPost(
    db,
    "partner",
    { action: "update_status", jobId: "JOB-TEST-01", status: "Installed" },
    null
  );
  assert.equal(skipStep.status, 403);

  // Partner advances one step: Claimed -> Site Inspected (200)
  const step1 = await handleTenderPost(
    db,
    "partner",
    { action: "update_status", jobId: "JOB-TEST-01", status: "Site Inspected" },
    null
  );
  assert.equal(step1.status, 200);
  assert.equal(jobs.get("JOB-TEST-01")!.status, "Site Inspected");
});

test("concurrency guard: if job payout mutates between read and conditional updateMany inside approve_variation, returns 409", async () => {
  const { db, jobs } = createFakeTenderDb([makeBaseJob({ payout: 9500 })]);
  const v = await handleTenderPost(
    db,
    "partner",
    { action: "add_variation", jobId: "JOB-TEST-01", reason: "Concurrent variation A", amount: 800 },
    "idem-conc-a"
  );
  const varId = (v.body.data as { variations: VariationRecord[] }).variations[0].id;

  // Simulate another concurrent transaction mutating job.payout right before tenderJob.updateMany runs
  const origUpdateMany = db.tenderJob.updateMany.bind(db.tenderJob);
  db.tenderJob.updateMany = async (args) => {
    jobs.get("JOB-TEST-01")!.payout = 10300; // concurrent payout change
    return origUpdateMany(args);
  };

  const raced = await handleTenderPost(
    db,
    "admin",
    { action: "approve_variation", variationId: varId, decision: "approve" },
    null
  );
  assert.equal(raced.status, 409);
});
