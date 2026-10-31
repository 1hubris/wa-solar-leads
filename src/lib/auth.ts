import { createHash, timingSafeEqual } from "crypto";

/**
 * Server-only credential resolution for the Sunny State APIs.
 *
 * L-008 / Laws 18, 21, 22: no hardcoded or NEXT_PUBLIC_* fallbacks. Tokens come ONLY from
 * server environment variables; an unset or weak token can never authenticate (fail closed).
 *
 *   SUNNY_ADMIN_TOKEN (alias: SUNNY_API_TOKEN)  -> role "admin"
 *   SUNNY_PARTNER_TOKEN                          -> role "partner"
 *   SUNNY_CONSULTANT_TOKEN                       -> role "consultant"
 */
export type Role = "admin" | "partner" | "consultant";

const MIN_TOKEN_LENGTH = 12;

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

function matches(presented: string, expected: string | undefined): boolean {
  if (!expected || expected.length < MIN_TOKEN_LENGTH) return false;
  return timingSafeEqual(digest(presented), digest(expected));
}

export function resolveRoleFromCode(code: string): Role | null {
  const presented = (code || "").trim();
  if (!presented) return null;

  const candidates: Array<[Role, string | undefined]> = [
    ["admin", process.env.SUNNY_ADMIN_TOKEN || process.env.SUNNY_API_TOKEN],
    ["partner", process.env.SUNNY_PARTNER_TOKEN],
    ["consultant", process.env.SUNNY_CONSULTANT_TOKEN],
  ];

  // Evaluate every candidate (no early exit) so timing does not reveal which role matched.
  let resolved: Role | null = null;
  for (const [role, token] of candidates) {
    if (matches(presented, token) && resolved === null) resolved = role;
  }
  return resolved;
}

export function resolveRole(req: Request): Role | null {
  return resolveRoleFromCode(req.headers.get("x-sunny-auth") || "");
}

/** Best-effort per-instance throttle for credential guessing (serverless instances do not share memory). */
const attempts = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 10;

export function isThrottled(key: string, now: number = Date.now()): boolean {
  const entry = attempts.get(key);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    attempts.set(key, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}
