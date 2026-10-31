import { createHash, timingSafeEqual } from "crypto";

/**
 * Server-only credential resolution for the Sunny State APIs.
 *
 * L-008 / Laws 18, 21, 22: no hardcoded or NEXT_PUBLIC_* fallbacks. Tokens come ONLY from
 * server environment variables; an unset or low-entropy token can never authenticate (fail closed).
 *
 *   SUNNY_ADMIN_TOKEN (alias: SUNNY_API_TOKEN)  -> role "admin"
 *   SUNNY_PARTNER_TOKEN                          -> role "partner"
 *   SUNNY_CONSULTANT_TOKEN                       -> role "consultant"
 */
export type Role = "admin" | "partner" | "consultant";

export const MIN_TOKEN_LENGTH = 24;
const MIN_UNIQUE_CHARS = 6;
const MIN_CHAR_CLASSES = 2;

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

/**
 * Rejects short, repeated-character, or single-class tokens so weak env values fail closed.
 */
export function isStrongToken(token: string | undefined): token is string {
  if (!token || typeof token !== "string") return false;
  if (token.length < MIN_TOKEN_LENGTH) return false;
  if (new Set(token).size < MIN_UNIQUE_CHARS) return false;

  let classes = 0;
  if (/[a-z]/.test(token)) classes += 1;
  if (/[A-Z]/.test(token)) classes += 1;
  if (/[0-9]/.test(token)) classes += 1;
  if (/[^a-zA-Z0-9]/.test(token)) classes += 1;
  return classes >= MIN_CHAR_CLASSES;
}

function matches(presented: string, expected: string | undefined): boolean {
  if (!isStrongToken(expected)) return false;
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

/**
 * Reports whether core authentication tokens are configured with valid entropy.
 */
export function getAuthConfigStatus(): {
  configured: { admin: boolean; partner: boolean; consultant: boolean };
  ready: boolean;
} {
  const admin = isStrongToken(process.env.SUNNY_ADMIN_TOKEN || process.env.SUNNY_API_TOKEN);
  const partner = isStrongToken(process.env.SUNNY_PARTNER_TOKEN);
  const consultant = isStrongToken(process.env.SUNNY_CONSULTANT_TOKEN);
  return {
    configured: { admin, partner, consultant },
    ready: admin && partner,
  };
}

/**
 * Bounded per-instance failed-auth throttle with a global circuit-breaker and lock-preserving eviction.
 * - Platform IP headers (`x-vercel-forwarded-for`, `cf-connecting-ip`) are trusted ONLY when the corresponding
 *   platform environment flag (`VERCEL=1` or `CF_PAGES=1`) is set; otherwise falls back to the last hop of
 *   `x-forwarded-for`, or a single shared `"ip:missing"` bucket when no IP header is present.
 * - Locked-out entries (`count > MAX_ATTEMPTS`) cannot be evicted before `WINDOW_MS` expires, and a global
 *   failure counter caps total failed guesses per window across all IPs (`MAX_GLOBAL_FAILURES`).
 */
const attempts = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 10;
export const MAX_THROTTLE_KEYS = 2000;
export const MAX_GLOBAL_FAILURES = 80;
let globalWindowStart = 0;
let globalFailedCount = 0;

function enforceMapCap(now: number): void {
  if (attempts.size < MAX_THROTTLE_KEYS) return;
  for (const [k, v] of attempts) {
    if (now - v.windowStart > WINDOW_MS) attempts.delete(k);
  }
  if (attempts.size < MAX_THROTTLE_KEYS) return;
  // Evict only non-locked keys first so an attacker cannot push locked-out IPs out of the Map.
  for (const [k, v] of attempts) {
    if (v.count <= MAX_ATTEMPTS) {
      attempts.delete(k);
      if (attempts.size < MAX_THROTTLE_KEYS) return;
    }
  }
  if (attempts.size >= MAX_THROTTLE_KEYS) {
    const oldest = attempts.keys().next().value;
    if (oldest !== undefined) attempts.delete(oldest);
  }
}

export function extractClientKey(req: Request): string {
  if (process.env.VERCEL === "1") {
    const vercelIp = req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
    if (vercelIp) return `ip:${vercelIp}`;
  }
  if (process.env.CF_PAGES === "1" || process.env.CLOUDFLARE === "1") {
    const cfIp = req.headers.get("cf-connecting-ip")?.trim();
    if (cfIp) return `ip:${cfIp}`;
  }
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const hops = xff
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (hops.length > 0) return `ip:${hops[hops.length - 1]}`;
  }
  return "ip:missing";
}

export function isKeyThrottled(key: string, now: number = Date.now()): boolean {
  if (now - globalWindowStart <= WINDOW_MS && globalFailedCount >= MAX_GLOBAL_FAILURES) {
    return true;
  }
  const entry = attempts.get(key);
  if (!entry) return false;
  if (now - entry.windowStart > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

export function recordFailedAttempt(key: string, now: number = Date.now()): boolean {
  if (now - globalWindowStart > WINDOW_MS) {
    globalWindowStart = now;
    globalFailedCount = 0;
  }
  globalFailedCount += 1;

  const entry = attempts.get(key);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    enforceMapCap(now);
    attempts.set(key, { count: 1, windowStart: now });
    return globalFailedCount > MAX_GLOBAL_FAILURES;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS || globalFailedCount > MAX_GLOBAL_FAILURES;
}

export function isThrottled(key: string, now: number = Date.now()): boolean {
  return recordFailedAttempt(key, now);
}

export function getThrottleMapSize(): number {
  return attempts.size;
}

export function resetThrottleForTests(): void {
  attempts.clear();
  globalWindowStart = 0;
  globalFailedCount = 0;
}

/**
 * Resolves the caller's role from `x-sunny-auth`, enforcing the failed-attempt throttle on every route.
 * Uses a unified key namespace with `/api/auth/verify` so an IP shares one failure budget across all endpoints.
 */
export function resolveRole(req: Request, now: number = Date.now()): Role | null {
  const rawCode = (req.headers.get("x-sunny-auth") || "").trim();
  if (!rawCode) return null;
  const key = extractClientKey(req);
  if (isKeyThrottled(key, now)) return null;
  const role = resolveRoleFromCode(rawCode);
  if (!role) {
    recordFailedAttempt(key, now);
    return null;
  }
  return role;
}
