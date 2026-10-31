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
 * Reports which role credentials are properly configured with sufficient entropy (booleans only, never values).
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
    ready: admin && partner && consultant,
  };
}

/**
 * Bounded per-instance failed-auth throttle.
 * - Evicts expired windows first, then oldest entry once MAX_THROTTLE_KEYS is reached (prevents memory DoS).
 * - Uses platform-verified IP headers before falling back to the last hop of x-forwarded-for.
 * - When no IP header exists, keys by a digest prefix of the presented credential so missing-header requests
 *   do not share a single global "unknown" lockout bucket.
 */
const attempts = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 10;
export const MAX_THROTTLE_KEYS = 2000;

function enforceMapCap(now: number): void {
  if (attempts.size < MAX_THROTTLE_KEYS) return;
  for (const [k, v] of attempts) {
    if (now - v.windowStart > WINDOW_MS) attempts.delete(k);
  }
  while (attempts.size >= MAX_THROTTLE_KEYS) {
    const oldest = attempts.keys().next().value;
    if (oldest === undefined) break;
    attempts.delete(oldest);
  }
}

export function extractClientKey(req: Request, presentedFallback: string = ""): string {
  const vercelIp = req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (vercelIp) return `ip:${vercelIp}`;
  const cfIp = req.headers.get("cf-connecting-ip")?.trim();
  if (cfIp) return `ip:${cfIp}`;
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return `ip:${realIp}`;
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const hops = xff
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (hops.length > 0) return `ip:${hops[hops.length - 1]}`;
  }
  const tokenFingerprint = digest(presentedFallback || "empty").toString("hex").slice(0, 16);
  return `anon:${tokenFingerprint}`;
}

export function isKeyThrottled(key: string, now: number = Date.now()): boolean {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (now - entry.windowStart > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

export function recordFailedAttempt(key: string, now: number = Date.now()): boolean {
  const entry = attempts.get(key);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    enforceMapCap(now);
    attempts.set(key, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export function isThrottled(key: string, now: number = Date.now()): boolean {
  return recordFailedAttempt(key, now);
}

export function getThrottleMapSize(): number {
  return attempts.size;
}

export function resetThrottleForTests(): void {
  attempts.clear();
}

/**
 * Resolves the caller's role from `x-sunny-auth`, enforcing the failed-attempt throttle on every route.
 * Successful authentications do NOT increment the failure counter; throttled keys return null even if valid.
 */
export function resolveRole(req: Request, now: number = Date.now()): Role | null {
  const rawCode = (req.headers.get("x-sunny-auth") || "").trim();
  if (!rawCode) return null;
  const key = extractClientKey(req, rawCode);
  if (isKeyThrottled(key, now)) return null;
  const role = resolveRoleFromCode(rawCode);
  if (!role) {
    recordFailedAttempt(key, now);
    return null;
  }
  return role;
}
