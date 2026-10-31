export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { resolveRole, type Role } from "@/lib/auth";
import { handleTenderGet, handleTenderPost, type TenderDb } from "@/lib/tenderLogic";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

function isAuthorizedRequest(req: Request, role: Role | null = resolveRole(req)): role is Role {
  return role !== null;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const rawTake = parseInt(url.searchParams.get("take") || "50", 10);
    const rawSkip = parseInt(url.searchParams.get("skip") || "0", 10);
    const role = resolveRole(req);

    const result = await handleTenderGet(prisma as unknown as TenderDb, role, {
      take: rawTake,
      skip: rawSkip,
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch tender jobs." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const role = resolveRole(req);
    if (!isAuthorizedRequest(req, role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: valid partner or admin credentials required." },
        { status: 401 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Malformed JSON body." }, { status: 400 });
    }

    const idempotencyKey = req.headers.get("Idempotency-Key") || req.headers.get("x-idempotency-key");
    const result = await handleTenderPost(prisma as unknown as TenderDb, role, body, idempotencyKey);
    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to process tender." }, { status: 500 });
  }
}
