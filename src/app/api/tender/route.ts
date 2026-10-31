export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { createHash } from "crypto";
import { resolveRole } from "@/lib/auth";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

function isAuthorizedRequest(req: Request): boolean {
  return resolveRole(req) !== null;
}

// Job lifecycle. Non-admin callers may only advance one step at a time and can never settle.
const STATUS_ORDER = ["Available", "Claimed", "Site Inspected", "Installed", "STCs Lodged", "Settled"] as const;
const MAX_CUMULATIVE_APPROVED_VARIATION = 15000;

// --- ZOD SCHEMAS FOR ZERO-TRUST INGRESS ---
const ClaimSchema = z.object({
  action: z.literal("claim"),
  jobId: z.string().min(1).max(64),
  installerId: z.string().regex(/^[a-zA-Z0-9_-]{3,40}$/).optional(),
});

const VariationSchema = z.object({
  action: z.literal("add_variation"),
  jobId: z.string().min(1).max(64),
  reason: z.string().min(5).max(200),
  amount: z.number().min(-5000).max(15000),
});

const UpdateStatusSchema = z.object({
  action: z.literal("update_status"),
  jobId: z.string().min(1).max(64),
  status: z.enum(["Claimed", "Site Inspected", "Installed", "STCs Lodged", "Settled"]),
});

const ApproveVariationSchema = z.object({
  action: z.literal("approve_variation"),
  variationId: z.string().min(1).max(64),
  decision: z.enum(["approve", "reject"]),
});

const PublishSchema = z.object({
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

// Cache for idempotency keys (bounded LRU-style cap, recorded ONLY after commit)
const idempotencyCache = new Set<string>();
function recordIdempotencySuccess(key: string | null) {
  if (!key) return;
  if (idempotencyCache.size >= 5000) {
    const oldest = idempotencyCache.values().next().value;
    if (oldest) idempotencyCache.delete(oldest);
  }
  idempotencyCache.add(key);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const rawTake = parseInt(url.searchParams.get("take") || "50", 10);
    const rawSkip = parseInt(url.searchParams.get("skip") || "0", 10);
    const take = Number.isNaN(rawTake) ? 50 : Math.min(100, Math.max(1, rawTake));
    const skip = Number.isNaN(rawSkip) ? 0 : Math.max(0, rawSkip);
    const isAuthedPartner = isAuthorizedRequest(req);

    const jobs = await prisma.tenderJob.findMany({
      include: {
        customer: true,
        variations: true,
      },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    });

    const available = jobs
      .filter((j) => j.status === "Available")
      .map((j) => serializeJob(j, true));

    // ARCHON S2 Fix: Redact customer PII on claimed jobs too unless caller has a valid partner/admin token
    const claimed = jobs
      .filter((j) => j.status !== "Available")
      .map((j) => serializeJob(j, !isAuthedPartner));

    const totalVolume = available.reduce((acc, j) => acc + Number(j.payout || 0), 0);
    const totalClaimedVolume = claimed.reduce((acc, j) => acc + Number(j.payout || 0), 0);
    const warrantyReservePool = claimed.length * 650;

    return NextResponse.json({
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
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch tender jobs." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const role = resolveRole(req);
    if (role === null) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: valid partner or admin credentials required." },
        { status: 401 }
      );
    }

    const idempotencyKey = req.headers.get("Idempotency-Key") || req.headers.get("x-idempotency-key");
    if (idempotencyKey && idempotencyCache.has(idempotencyKey)) {
      return NextResponse.json({ success: true, message: "Idempotent request already processed." }, { status: 200 });
    }

    const body = await req.json();

    if (body.action === "claim") {
      const parsed = ClaimSchema.parse(body);
      const { jobId, installerId } = parsed;

      try {
        const updated = await prisma.tenderJob.update({
          where: {
            id: jobId,
            status: "Available",
          },
          data: {
            status: "Claimed",
            claimedBy: installerId || "Installer_094",
            claimedAt: new Date().toISOString(),
          },
          include: { customer: true, variations: true },
        });

        recordIdempotencySuccess(idempotencyKey);
        return NextResponse.json({
          success: true,
          message: `Contract ${jobId} successfully claimed! Customer details and Work Order unlocked.`,
          data: serializeJob(updated, false),
        });
      } catch (e: unknown) {
        const code = (e as { code?: string })?.code;
        if (code === "P2025") {
          return NextResponse.json(
            { success: false, error: "Contract has already been claimed or does not exist." },
            { status: 409 }
          );
        }
        throw e;
      }
    }

    if (body.action === "add_variation") {
      const parsed = VariationSchema.parse(body);
      const { jobId, reason, amount } = parsed;

      const job = await prisma.tenderJob.findUnique({ where: { id: jobId }, select: { status: true } });
      if (!job) {
        return NextResponse.json({ success: false, error: "Contract not found." }, { status: 404 });
      }
      if (job.status === "Available") {
        return NextResponse.json(
          { success: false, error: "Variations can only be raised on a claimed contract." },
          { status: 409 }
        );
      }

      // DB-enforced idempotency: the variation id is derived from the Idempotency-Key, so a retry
      // collides on the primary key (P2002) instead of creating a duplicate.
      const varId = idempotencyKey
        ? `VAR-${createHash("sha256").update(`${jobId}:${idempotencyKey}`).digest("hex").slice(0, 16).toUpperCase()}`
        : `VAR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

      try {
        // Money-state is NOT touched here. Payout only changes when an admin approves (approve_variation).
        await prisma.variation.create({
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
      }

      const updated = await prisma.tenderJob.findUnique({
        where: { id: jobId },
        include: { customer: true, variations: true },
      });
      recordIdempotencySuccess(idempotencyKey);
      return NextResponse.json({
        success: true,
        message: "Variation recorded. The contract payout is unchanged until an admin approves it.",
        data: updated ? serializeJob(updated, false) : null,
      });
    }

    if (body.action === "approve_variation") {
      if (role !== "admin") {
        return NextResponse.json(
          { success: false, error: "Forbidden: only an admin can resolve variations." },
          { status: 403 }
        );
      }
      const { variationId, decision } = ApproveVariationSchema.parse(body);

      try {
        const result = await prisma.$transaction(async (tx) => {
          const resolved = await tx.variation.updateMany({
            where: { id: variationId, status: "Pending Review" },
            data: { status: decision === "approve" ? "Approved" : "Rejected" },
          });
          if (resolved.count !== 1) throw new Error("ALREADY_RESOLVED");

          const variation = await tx.variation.findUniqueOrThrow({ where: { id: variationId } });
          if (decision === "approve") {
            const approved = await tx.variation.findMany({
              where: { jobId: variation.jobId, status: "Approved" },
              select: { amount: true },
            });
            const cumulative = approved.reduce((sum, v) => sum + Math.abs(v.amount), 0);
            if (cumulative > MAX_CUMULATIVE_APPROVED_VARIATION) throw new Error("CUMULATIVE_CAP");
            await tx.tenderJob.update({
              where: { id: variation.jobId },
              data: { payout: { increment: variation.amount } },
            });
          }
          return tx.tenderJob.findUniqueOrThrow({
            where: { id: variation.jobId },
            include: { customer: true, variations: true },
          });
        });
        recordIdempotencySuccess(idempotencyKey);
        return NextResponse.json({ success: true, data: serializeJob(result, false) });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "";
        if (message === "ALREADY_RESOLVED") {
          return NextResponse.json(
            { success: false, error: "That variation has already been resolved or does not exist." },
            { status: 409 }
          );
        }
        if (message === "CUMULATIVE_CAP") {
          return NextResponse.json(
            { success: false, error: "Approving this would exceed the cumulative variation cap for the contract." },
            { status: 422 }
          );
        }
        throw e;
      }
    }

    if (body.action === "update_status") {
      const parsed = UpdateStatusSchema.parse(body);
      const { jobId, status } = parsed;

      const current = await prisma.tenderJob.findUnique({ where: { id: jobId }, select: { status: true } });
      if (!current) {
        return NextResponse.json({ success: false, error: "Contract not found." }, { status: 404 });
      }
      if (role !== "admin") {
        const from = STATUS_ORDER.indexOf(current.status as (typeof STATUS_ORDER)[number]);
        const to = STATUS_ORDER.indexOf(status);
        const isSingleForwardStep = from >= 1 && to === from + 1;
        if (status === "Settled" || !isSingleForwardStep) {
          return NextResponse.json(
            { success: false, error: "That status change needs an admin. Partners can advance one step at a time." },
            { status: 403 }
          );
        }
      }

      const updated = await prisma.tenderJob.update({
        where: { id: jobId },
        data: { status },
        include: { customer: true, variations: true },
      });
      recordIdempotencySuccess(idempotencyKey);
      return NextResponse.json({ success: true, data: serializeJob(updated, false) });
    }

    // Default: New Job Publication
    const parsed = PublishSchema.parse(body);

    // ARCHON: Zero-Trust Server-Side Economics Verification (Rule 12 / H11 Fix)
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
      return NextResponse.json(
        { success: false, error: "Economic validation failed. Costs or brokerage margins do not match server constraints." },
        { status: 400 }
      );
    }

    // Recompute canonical server ceiling for installerNetRevenue (S6 / H11 Fix)
    const maxAllowedPayout = Math.round(serverTargetInstallerGross + 600);
    const enforcedPayout = Math.min(maxAllowedPayout, Math.max(Math.round(serverEstHardware + serverEstLabor), Math.round(parsed.installerNetRevenue)));
    const enforcedLeadGenCut = Math.max(serverMinMarketingFee, Math.round(parsed.leadGenCut));
    const enforcedConsultantCut = Math.max(serverMinConsultantCut, Math.round(parsed.consultantCut));

    const randomId = `JOB-${crypto.randomUUID().slice(0, 8).toUpperCase()}-WA`;
    const extrasStr = JSON.stringify(parsed.activeExtras);

    const newJob = await prisma.tenderJob.create({
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
      include: {
        customer: true,
        variations: true,
      },
    });

    recordIdempotencySuccess(idempotencyKey);
    return NextResponse.json({
      success: true,
      message: "Tender published live to SunnyEX Order Book.",
      data: serializeJob(newJob, true),
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid request payload." }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to process tender." }, { status: 500 });
  }
}

function serializeJob(job: Record<string, unknown>, redactCustomer = false) {
  const { leadGenCut, consultantCut, ...publicSafeJob } = job;
  void leadGenCut;
  void consultantCut;
  const serialized: Record<string, unknown> = {
    ...publicSafeJob,
    leadGenCut: 0,
    consultantCut: 0,
    extras: typeof job.extras === "string" && job.extras ? JSON.parse(job.extras) : [],
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
