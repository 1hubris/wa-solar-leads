import { createHash } from "crypto";
import { z } from "zod";
import type { Role } from "./auth";

export const STATUS_ORDER = [
  "Available",
  "Claimed",
  "Site Inspected",
  "Installed",
  "STCs Lodged",
  "Settled",
] as const;

export const MAX_CUMULATIVE_APPROVED_VARIATION = 15000;
export const MAX_PENDING_VARIATIONS_PER_JOB = 10;

export const ClaimSchema = z.object({
  action: z.literal("claim"),
  jobId: z.string().min(1).max(64),
  installerId: z.string().regex(/^[a-zA-Z0-9_-]{3,40}$/).optional(),
});

export const VariationSchema = z.object({
  action: z.literal("add_variation"),
  jobId: z.string().min(1).max(64),
  reason: z.string().min(5).max(200),
  amount: z.number().min(-5000).max(15000),
});

export const UpdateStatusSchema = z.object({
  action: z.literal("update_status"),
  jobId: z.string().min(1).max(64),
  status: z.enum(["Claimed", "Site Inspected", "Installed", "STCs Lodged", "Settled"]),
});

export const ApproveVariationSchema = z.object({
  action: z.literal("approve_variation"),
  variationId: z.string().min(1).max(64),
  decision: z.enum(["approve", "reject"]),
});

export const PublishSchema = z.object({
  suburb: z.string().min(2).max(100).default("Perth Metro, WA"),
  pvSize: z.number().min(0).max(100),
  hardwareTier: z.number().int().min(1).max(3),
  batterySize: z.number().min(0).max(100),
  installerNetRevenue: z.number().min(0).max(100000),
  estHardwareCost: z.number().min(0).max(100000),
  estLaborCost: z.number().min(0).max(50000),
  totalExtrasCost: z.number().min(0).max(30000).optional().default(0),
  activeExtras: z.array(z.string().max(120)).max(25).default([]),
  roof: z.string().max(120).default("Colorbond / Single Story"),
  customerName: z.string().min(2).max(100).default("Verified WA Homeowner"),
  customerPhone: z.string().min(8).max(20).default("0400 000 000"),
  customerEmail: z.string().email().max(150).default("homeowner@sunnystate.com.au"),
  customerAddress: z.string().min(5).max(200).default("Perth Metropolitan Area, WA"),
  leadGenCut: z.number().min(0).max(50000).default(0),
  consultantCut: z.number().min(0).max(50000).default(0),
});

export interface VariationRecord {
  id: string;
  jobId: string;
  reason: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface TenderJobRecord {
  id: string;
  suburb: string;
  size: number;
  tier: number;
  tierName: string;
  battery: number;
  roof: string;
  extras: string;
  payout: number;
  hardwareCost: number;
  laborCost: number;
  warrantyFund: number;
  leadGenCut: number;
  consultantCut: number;
  timeRemaining: string;
  isHot: boolean;
  status: string;
  claimedBy?: string | null;
  claimedAt?: string | null;
  customer?: {
    name: string;
    phone: string;
    email: string;
    address: string;
  } | null;
  variations?: VariationRecord[];
  [key: string]: unknown;
}

export interface TenderTx {
  tenderJob: {
    findUnique(args: { where: { id: string }; include?: { customer?: boolean; variations?: boolean } }): Promise<TenderJobRecord | null>;
    findUniqueOrThrow(args: { where: { id: string }; include?: { customer?: boolean; variations?: boolean } }): Promise<TenderJobRecord>;
    updateMany(args: {
      where: { id: string; status?: string | { not: string }; payout?: number };
      data: { status?: string; payout?: { increment: number } | number };
    }): Promise<{ count: number }>;
  };
  variation: {
    findUnique(args: { where: { id: string } }): Promise<VariationRecord | null>;
    findUniqueOrThrow(args: { where: { id: string } }): Promise<VariationRecord>;
    findMany(args: { where: { jobId: string; status?: string } }): Promise<VariationRecord[]>;
    updateMany(args: { where: { id: string; status: string }; data: { status: string } }): Promise<{ count: number }>;
  };
}

export interface TenderDb extends TenderTx {
  tenderJob: TenderTx["tenderJob"] & {
    findMany(args: {
      include: { customer: boolean; variations: boolean };
      orderBy: { createdAt: "desc" };
      take: number;
      skip: number;
    }): Promise<TenderJobRecord[]>;
    update(args: {
      where: { id: string; status?: string };
      data: Record<string, unknown>;
      include: { customer: boolean; variations: boolean };
    }): Promise<TenderJobRecord>;
    create(args: {
      data: Record<string, unknown>;
      include: { customer: boolean; variations: boolean };
    }): Promise<TenderJobRecord>;
  };
  variation: TenderTx["variation"] & {
    create(args: { data: VariationRecord }): Promise<VariationRecord>;
  };
  $transaction<T>(fn: (tx: TenderTx) => Promise<T>): Promise<T>;
}

export interface HandlerResult {
  status: number;
  body: Record<string, unknown>;
}

export function serializeJob(job: Record<string, unknown>, redactCustomer = false): Record<string, unknown> {
  const { leadGenCut, consultantCut, ...publicSafeJob } = job;
  void leadGenCut;
  void consultantCut;
  let parsedExtras: unknown[] = [];
  if (typeof job.extras === "string" && job.extras) {
    try {
      const parsed = JSON.parse(job.extras);
      if (Array.isArray(parsed)) parsedExtras = parsed;
    } catch {
      parsedExtras = [];
    }
  } else if (Array.isArray(job.extras)) {
    parsedExtras = job.extras;
  }
  const serialized: Record<string, unknown> = {
    ...publicSafeJob,
    leadGenCut: 0,
    consultantCut: 0,
    extras: parsedExtras,
  };
  if (redactCustomer) {
    serialized.customer = {
      name: "CONFIDENTIAL",
      phone: "CONFIDENTIAL",
      email: "CONFIDENTIAL",
      address: "CONFIDENTIAL",
    };
  }
  return serialized;
}

export async function handleTenderGet(
  db: TenderDb,
  role: Role | null,
  params: { take?: number; skip?: number }
): Promise<HandlerResult> {
  const rawTake = params.take ?? 50;
  const rawSkip = params.skip ?? 0;
  const take = Number.isNaN(rawTake) ? 50 : Math.min(100, Math.max(1, rawTake));
  const skip = Number.isNaN(rawSkip) ? 0 : Math.max(0, rawSkip);

  // Only partner and admin roles may view claimed-job homeowner PII.
  // Unauthenticated callers and sales consultants always receive redacted PII on claimed jobs.
  const canViewClaimedPII = role === "admin" || role === "partner";

  const jobs = await db.tenderJob.findMany({
    include: { customer: true, variations: true },
    orderBy: { createdAt: "desc" },
    take,
    skip,
  });

  const available = jobs
    .filter((j) => j.status === "Available")
    .map((j) => serializeJob(j, true));

  const claimed = jobs
    .filter((j) => j.status !== "Available")
    .map((j) => serializeJob(j, !canViewClaimedPII));

  const totalVolume = available.reduce((acc, j) => acc + Number(j.payout || 0), 0);
  const totalClaimedVolume = claimed.reduce((acc, j) => acc + Number(j.payout || 0), 0);
  const warrantyReservePool = claimed.length * 650;

  return {
    status: 200,
    body: {
      success: true,
      data: {
        available,
        claimed,
        metrics: {
          totalVolume,
          totalClaimedVolume,
          activeOrdersCount: available.length,
          claimedOrdersCount: claimed.length,
          warrantyReservePool,
        },
        pagination: { take, skip, totalReturned: jobs.length },
      },
    },
  };
}

export async function handleTenderPost(
  db: TenderDb,
  role: Role | null,
  body: unknown,
  idempotencyKey: string | null
): Promise<HandlerResult> {
  if (role === null) {
    return {
      status: 401,
      body: { success: false, error: "Unauthorized: valid partner or admin credentials required." },
    };
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      status: 400,
      body: { success: false, error: "Invalid request payload." },
    };
  }

  const record = body as Record<string, unknown>;

  try {
    if (record.action === "claim") {
      if (role !== "admin" && role !== "partner") {
        return {
          status: 403,
          body: { success: false, error: "Forbidden: only an accredited partner or admin may claim contracts." },
        };
      }
      const { jobId, installerId } = ClaimSchema.parse(record);
      try {
        const updated = await db.tenderJob.update({
          where: { id: jobId, status: "Available" },
          data: {
            status: "Claimed",
            claimedBy: installerId || "Installer_094",
            claimedAt: new Date().toISOString(),
          },
          include: { customer: true, variations: true },
        });
        return {
          status: 200,
          body: {
            success: true,
            message: `Contract ${jobId} successfully claimed! Customer details and Work Order unlocked.`,
            data: serializeJob(updated, false),
          },
        };
      } catch (e: unknown) {
        if ((e as { code?: string })?.code === "P2025") {
          return {
            status: 409,
            body: { success: false, error: "Contract has already been claimed or does not exist." },
          };
        }
        throw e;
      }
    }

    if (record.action === "add_variation") {
      if (role !== "admin" && role !== "partner") {
        return {
          status: 403,
          body: { success: false, error: "Forbidden: only a partner or admin may raise variations." },
        };
      }
      const { jobId, reason, amount } = VariationSchema.parse(record);
      const job = await db.tenderJob.findUnique({ where: { id: jobId }, include: { variations: true } });
      if (!job) {
        return { status: 404, body: { success: false, error: "Contract not found." } };
      }
      if (job.status === "Available" || job.status === "Settled") {
        return {
          status: 409,
          body: {
            success: false,
            error:
              job.status === "Settled"
                ? "Variations cannot be raised on a settled contract."
                : "Variations can only be raised on a claimed contract.",
          },
        };
      }

      const pendingCount = (job.variations || []).filter((v) => v.status === "Pending Review").length;
      if (pendingCount >= MAX_PENDING_VARIATIONS_PER_JOB) {
        return {
          status: 422,
          body: { success: false, error: "Too many pending variations on this contract; resolve existing ones first." },
        };
      }

      const varId = idempotencyKey
        ? `VAR-${createHash("sha256").update(`${jobId}:${idempotencyKey}`).digest("hex").slice(0, 16).toUpperCase()}`
        : `VAR-${crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;

      try {
        await db.variation.create({
          data: {
            id: varId,
            reason,
            amount,
            status: "Pending Review",
            createdAt: new Date().toISOString(),
            jobId,
          },
        });
      } catch (e: unknown) {
        if ((e as { code?: string })?.code !== "P2002") throw e;
        // Payload-bound idempotency check: if the same key was sent with a different amount or reason, reject with 409.
        const existing = await db.variation.findUnique({ where: { id: varId } });
        if (!existing || existing.jobId !== jobId || existing.amount !== amount || existing.reason !== reason) {
          return {
            status: 409,
            body: {
              success: false,
              error: "Idempotency-Key conflict: key already used for a variation with different parameters.",
            },
          };
        }
      }

      const updated = await db.tenderJob.findUnique({
        where: { id: jobId },
        include: { customer: true, variations: true },
      });
      return {
        status: 200,
        body: {
          success: true,
          message: "Variation recorded. The contract payout is unchanged until an admin approves it.",
          data: updated ? serializeJob(updated, false) : null,
        },
      };
    }

    if (record.action === "approve_variation") {
      if (role !== "admin") {
        return {
          status: 403,
          body: { success: false, error: "Forbidden: only an admin can resolve variations." },
        };
      }
      const { variationId, decision } = ApproveVariationSchema.parse(record);

      try {
        const result = await db.$transaction(async (tx) => {
          const existingVar = await tx.variation.findUnique({ where: { id: variationId } });
          if (!existingVar) throw new Error("ALREADY_RESOLVED");

          const job = await tx.tenderJob.findUnique({ where: { id: existingVar.jobId } });
          if (!job) throw new Error("ALREADY_RESOLVED");
          if (job.status === "Settled" && decision === "approve") throw new Error("JOB_SETTLED");

          const resolved = await tx.variation.updateMany({
            where: { id: variationId, status: "Pending Review" },
            data: { status: decision === "approve" ? "Approved" : "Rejected" },
          });
          if (resolved.count !== 1) throw new Error("ALREADY_RESOLVED");

          if (decision === "approve") {
            const approved = await tx.variation.findMany({
              where: { jobId: existingVar.jobId, status: "Approved" },
            });
            const signedSum = approved.reduce((sum, v) => sum + v.amount, 0);
            const positiveSum = approved.reduce((sum, v) => sum + (v.amount > 0 ? v.amount : 0), 0);
            if (
              signedSum > MAX_CUMULATIVE_APPROVED_VARIATION ||
              positiveSum > MAX_CUMULATIVE_APPROVED_VARIATION
            ) {
              throw new Error("CUMULATIVE_CAP");
            }
            const nextPayout = Number(job.payout || 0) + existingVar.amount;
            if (nextPayout < 0) {
              throw new Error("PAYOUT_FLOOR");
            }

            // Conditional atomic update guards against READ COMMITTED concurrent approvals and concurrent settlement.
            const jobUpdate = await tx.tenderJob.updateMany({
              where: {
                id: existingVar.jobId,
                status: { not: "Settled" },
                payout: Number(job.payout || 0),
              },
              data: { payout: { increment: existingVar.amount } },
            });
            if (jobUpdate.count !== 1) throw new Error("CONCURRENT_MODIFICATION");
          }

          return tx.tenderJob.findUniqueOrThrow({
            where: { id: existingVar.jobId },
            include: { customer: true, variations: true },
          });
        });
        return { status: 200, body: { success: true, data: serializeJob(result, false) } };
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "";
        if (message === "ALREADY_RESOLVED") {
          return {
            status: 409,
            body: { success: false, error: "That variation has already been resolved or does not exist." },
          };
        }
        if (message === "JOB_SETTLED") {
          return {
            status: 409,
            body: { success: false, error: "Variations cannot be resolved on a settled contract." },
          };
        }
        if (message === "CONCURRENT_MODIFICATION") {
          return {
            status: 409,
            body: { success: false, error: "Concurrent modification detected on contract payout; please retry." },
          };
        }
        if (message === "CUMULATIVE_CAP") {
          return {
            status: 422,
            body: { success: false, error: "Approving this would exceed the cumulative variation cap for the contract." },
          };
        }
        if (message === "PAYOUT_FLOOR") {
          return {
            status: 422,
            body: { success: false, error: "Approving this deduction would reduce contract payout below zero." },
          };
        }
        throw e;
      }
    }

    if (record.action === "update_status") {
      if (role !== "admin" && role !== "partner") {
        return {
          status: 403,
          body: { success: false, error: "Forbidden: consultants cannot modify installation status." },
        };
      }
      const { jobId, status } = UpdateStatusSchema.parse(record);
      const current = await db.tenderJob.findUnique({ where: { id: jobId } });
      if (!current) {
        return { status: 404, body: { success: false, error: "Contract not found." } };
      }
      if (role !== "admin") {
        const from = STATUS_ORDER.indexOf(current.status as (typeof STATUS_ORDER)[number]);
        const to = STATUS_ORDER.indexOf(status);
        const isSingleForwardStep = from >= 1 && to === from + 1;
        if (status === "Settled" || !isSingleForwardStep) {
          return {
            status: 403,
            body: { success: false, error: "That status change needs an admin. Partners can advance one step at a time." },
          };
        }
      }

      const updatedCount = await db.tenderJob.updateMany({
        where: { id: jobId, status: current.status },
        data: { status },
      });
      if (updatedCount.count !== 1) {
        return {
          status: 409,
          body: { success: false, error: "Contract status changed concurrently; please refresh and retry." },
        };
      }

      const updated = await db.tenderJob.findUniqueOrThrow({
        where: { id: jobId },
        include: { customer: true, variations: true },
      });
      return { status: 200, body: { success: true, data: serializeJob(updated, false) } };
    }

    // Default: New Job Publication
    const parsed = PublishSchema.parse(record);

    const activePvRate = parsed.hardwareTier === 3 ? 650 : parsed.hardwareTier === 2 ? 450 : 320;
    const activeBattRate = parsed.hardwareTier === 3 ? 600 : parsed.hardwareTier === 2 ? 500 : 415;
    const serverEstHardware = parsed.pvSize * activePvRate + parsed.batterySize * activeBattRate;
    const serverEstLabor =
      1250 + (parsed.pvSize > 6.6 ? (parsed.pvSize - 6.6) * 100 : 0) + (parsed.batterySize > 0 ? 650 : 0);
    const serverMinMarketingFee = parsed.hardwareTier === 3 ? 5000 : parsed.hardwareTier === 2 ? 4200 : 3500;
    const serverBaseWarrantyPerKw = parsed.hardwareTier === 3 ? 200 : parsed.hardwareTier === 2 ? 160 : 130;
    const serverBatteryWarrantyBuffer = parsed.batterySize > 0 ? 300 : 0;
    const serverOriginalBaseFee = Math.round(parsed.pvSize * serverBaseWarrantyPerKw + serverBatteryWarrantyBuffer);
    const serverPaddedLabor =
      1500 + (parsed.pvSize > 6.6 ? (parsed.pvSize - 6.6) * 120 : 0) + (parsed.batterySize > 0 ? 830 : 0);
    const serverPaddedPvRate = parsed.hardwareTier === 3 ? 750 : parsed.hardwareTier === 2 ? 550 : 400;
    const serverPaddedBattRate = parsed.hardwareTier === 3 ? 650 : parsed.hardwareTier === 2 ? 550 : 450;
    const serverPaddedHardware = parsed.pvSize * serverPaddedPvRate + parsed.batterySize * serverPaddedBattRate;
    const serverTargetInstallerGross =
      serverOriginalBaseFee + serverPaddedLabor + serverPaddedHardware + parsed.totalExtrasCost;
    const serverMinTotalBaseCost = serverTargetInstallerGross + serverMinMarketingFee + 650;
    const serverMinConsultantCut = Math.round(Math.ceil(serverMinTotalBaseCost / (1 - 0.04)) * 0.04);

    if (
      parsed.estHardwareCost < serverEstHardware * 0.8 ||
      parsed.estLaborCost < serverEstLabor * 0.8 ||
      (parsed.leadGenCut > 0 && parsed.leadGenCut < serverMinMarketingFee * 0.9) ||
      (parsed.consultantCut > 0 && parsed.consultantCut < serverMinConsultantCut * 0.9)
    ) {
      return {
        status: 400,
        body: {
          success: false,
          error: "Economic validation failed. Costs or brokerage margins do not match server constraints.",
        },
      };
    }

    const maxAllowedPayout = Math.round(serverTargetInstallerGross + 600);
    const enforcedPayout = Math.min(
      maxAllowedPayout,
      Math.max(Math.round(serverEstHardware + serverEstLabor), Math.round(parsed.installerNetRevenue))
    );
    const enforcedLeadGenCut = Math.max(serverMinMarketingFee, Math.round(parsed.leadGenCut));
    const enforcedConsultantCut = Math.max(serverMinConsultantCut, Math.round(parsed.consultantCut));

    const randomId = `JOB-${crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}-WA`;
    const extrasStr = JSON.stringify(parsed.activeExtras);

    const newJob = await db.tenderJob.create({
      data: {
        id: randomId,
        suburb: parsed.suburb,
        size: parsed.pvSize,
        tier: parsed.hardwareTier,
        tierName: parsed.hardwareTier === 3 ? "Premium" : parsed.hardwareTier === 2 ? "Advanced" : "Value",
        battery: parsed.batterySize,
        roof: parsed.roof,
        extras: extrasStr,
        payout: enforcedPayout,
        hardwareCost: Math.round(parsed.estHardwareCost),
        laborCost: Math.round(parsed.estLaborCost),
        warrantyFund: 650,
        leadGenCut: enforcedLeadGenCut,
        consultantCut: enforcedConsultantCut,
        timeRemaining: "45:00",
        isHot: true,
        status: "Available",
        customer: {
          create: {
            name: parsed.customerName,
            phone: parsed.customerPhone,
            email: parsed.customerEmail,
            address: parsed.customerAddress,
          },
        },
      },
      include: { customer: true, variations: true },
    });

    return {
      status: 200,
      body: {
        success: true,
        message: "Tender published live to SunnyEX Order Book.",
        data: serializeJob(newJob, true),
      },
    };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return { status: 400, body: { success: false, error: "Invalid request payload." } };
    }
    throw err;
  }
}
