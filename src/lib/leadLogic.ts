import { z } from "zod";
import { extractClientKey, isThrottled, resolveRole, type Role } from "./auth.ts";

/**
 * WA Residential Battery Scheme (Synergy & Horizon Power) per-kWh rebate calculation:
 * - Synergy: $130 per usable kWh up to 10 kWh maximum ($1,300 cap).
 * - Horizon Power: $380 per usable kWh up to 10 kWh maximum ($3,800 cap).
 * Prevents ACL s 18 / s 29 misleading-representation risk from quoting full 10 kWh rebates on smaller batteries (S5).
 */
export function calculateWaStateBatteryRebate(usableKwh: number, waRetailer: string): number {
  if (!Number.isFinite(usableKwh) || usableKwh <= 0) return 0;
  const eligibleKwh = Math.min(10, Math.max(0, usableKwh));
  if (waRetailer === "Synergy") return Math.round(eligibleKwh * 130);
  if (waRetailer === "Horizon") return Math.round(eligibleKwh * 380);
  return 0;
}

export interface StoredLeadRecord {
  leadRef: string;
  createdAt: string;
  homeowner: boolean;
  existingSystem: string;
  billSize: number;
  address: string;
  name: string;
  mobile: string;
  email: string;
  roofType: string;
  phasing: string;
  notes: string;
}

export interface LeadDb {
  lead: {
    findMany(args: { take: number; orderBy?: { createdAt: "desc" | "asc" } }): Promise<StoredLeadRecord[]>;
    create(args: { data: StoredLeadRecord }): Promise<StoredLeadRecord>;
  };
}

export const LeadSchema = z.object({
  homeowner: z.boolean().optional().default(true),
  existingSystem: z.string().max(150).optional().default("None"),
  billSize: z.number().min(0).max(10000).optional().default(400),
  address: z.string().min(3).max(255),
  name: z.string().min(2).max(100),
  mobile: z.string().min(8).max(20).regex(/^[0-9+\s()-]+$/, "Invalid phone format"),
  email: z.string().email().max(150),
  roofType: z.string().max(100).optional().default("Not specified"),
  phasing: z.string().max(100).optional().default("Not specified"),
  notes: z.string().max(1000).optional().default("Web Assessment Form"),
});

export function isAuthorizedConsultantOrAdmin(req: Request, role: Role | null = resolveRole(req)): boolean {
  return role === "admin" || role === "consultant";
}

export async function handleLeadGet(
  db: LeadDb | null,
  fallbackStore: StoredLeadRecord[],
  req: Request
): Promise<{ status: number; body: Record<string, unknown> }> {
  if (!isAuthorizedConsultantOrAdmin(req)) {
    return {
      status: 401,
      body: { success: false, error: "Unauthorized: valid consultant or admin credentials required." },
    };
  }

  let dbLeads: StoredLeadRecord[] = [];
  if (db) {
    try {
      dbLeads = await db.lead.findMany({ take: 50, orderBy: { createdAt: "desc" } });
    } catch {
      dbLeads = [];
    }
  }

  // Merge DB leads with in-memory fallback (deduplicating by leadRef) so cold starts or transient DB issues never hide leads
  const seen = new Set<string>();
  const merged: StoredLeadRecord[] = [];
  for (const row of [...dbLeads, ...fallbackStore]) {
    if (!seen.has(row.leadRef)) {
      seen.add(row.leadRef);
      merged.push(row);
    }
    if (merged.length >= 50) break;
  }

  return {
    status: 200,
    body: {
      success: true,
      leads: merged,
    },
  };
}

export async function persistLeadRecord(
  db: LeadDb | null,
  fallbackStore: StoredLeadRecord[],
  req: Request,
  rawBody: unknown
): Promise<
  | { ok: true; record: StoredLeadRecord; dbPersisted: boolean }
  | { ok: false; status: number; body: Record<string, unknown> }
> {
  if (isThrottled(`lead-post:${extractClientKey(req)}`)) {
    return {
      ok: false,
      status: 429,
      body: { success: false, error: "Too many submissions. Please wait a minute before trying again." },
    };
  }

  const parsed = LeadSchema.safeParse(rawBody);
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      body: { success: false, error: "Invalid form input." },
    };
  }

  const validatedData = parsed.data;
  const leadRef = `LEAD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const createdAt = new Date().toISOString();

  const record: StoredLeadRecord = {
    leadRef,
    createdAt,
    homeowner: validatedData.homeowner,
    existingSystem: validatedData.existingSystem,
    billSize: validatedData.billSize,
    address: validatedData.address.trim(),
    name: validatedData.name.trim(),
    mobile: validatedData.mobile.trim(),
    email: validatedData.email.trim(),
    roofType: validatedData.roofType,
    phasing: validatedData.phasing,
    notes: validatedData.notes,
  };

  fallbackStore.unshift(record);
  if (fallbackStore.length > 200) {
    fallbackStore.length = 200;
  }

  let dbPersisted = false;
  if (db) {
    try {
      await db.lead.create({ data: record });
      dbPersisted = true;
    } catch {
      dbPersisted = false;
    }
  }

  return { ok: true, record, dbPersisted };
}
