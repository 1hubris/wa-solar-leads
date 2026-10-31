import { test } from "node:test";
import assert from "node:assert/strict";
import { isThrottled, resolveRoleFromCode } from "./auth.ts";

const STRONG_ADMIN = "adm-9f3k2-strong-token";
const STRONG_PARTNER = "ptn-7h1q8-strong-token";

function withEnv(env: Record<string, string | undefined>, fn: () => void) {
  const keys = ["SUNNY_ADMIN_TOKEN", "SUNNY_API_TOKEN", "SUNNY_PARTNER_TOKEN", "SUNNY_CONSULTANT_TOKEN"];
  const saved = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
  for (const k of keys) delete process.env[k];
  for (const [k, v] of Object.entries(env)) if (v !== undefined) process.env[k] = v;
  try {
    fn();
  } finally {
    for (const k of keys) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  }
}

test("fails closed: with no env tokens, previously-hardcoded codes authenticate nobody", () => {
  withEnv({}, () => {
    for (const legacy of ["2026", "SUNNYEX", "CONSULTANT", "EC-094", "sunnyex", ""]) {
      assert.equal(resolveRoleFromCode(legacy), null, `legacy code ${JSON.stringify(legacy)} must be rejected`);
    }
  });
});

test("negative control: a weak (<12 char) token set in env still cannot authenticate", () => {
  withEnv({ SUNNY_ADMIN_TOKEN: "2026" }, () => {
    assert.equal(resolveRoleFromCode("2026"), null);
  });
});

test("strong tokens resolve to the right role; comparison is case-sensitive", () => {
  withEnv({ SUNNY_ADMIN_TOKEN: STRONG_ADMIN, SUNNY_PARTNER_TOKEN: STRONG_PARTNER }, () => {
    assert.equal(resolveRoleFromCode(STRONG_ADMIN), "admin");
    assert.equal(resolveRoleFromCode(STRONG_PARTNER), "partner");
    assert.equal(resolveRoleFromCode(STRONG_ADMIN.toUpperCase()), null);
    assert.equal(resolveRoleFromCode(STRONG_ADMIN + "x"), null);
  });
});

test("SUNNY_API_TOKEN remains accepted as an alias for the admin token", () => {
  withEnv({ SUNNY_API_TOKEN: STRONG_ADMIN }, () => {
    assert.equal(resolveRoleFromCode(STRONG_ADMIN), "admin");
  });
});

test("throttle blocks after 10 attempts within a minute and resets after the window", () => {
  const now = 1_000_000;
  for (let i = 0; i < 10; i++) assert.equal(isThrottled("t:ip", now), false);
  assert.equal(isThrottled("t:ip", now), true);
  assert.equal(isThrottled("t:ip", now + 61_000), false);
});
