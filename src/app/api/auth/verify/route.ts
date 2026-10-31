import { NextResponse } from "next/server";
import { z } from "zod";
import {
  extractClientKey,
  getAuthConfigStatus,
  isKeyThrottled,
  recordFailedAttempt,
  resolveRoleFromCode,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

const VerifySchema = z.object({ code: z.string().min(1).max(200) });

/**
 * Non-secret health/readiness endpoint reporting which role tokens are configured with valid entropy.
 * Never returns secret values or lengths.
 */
export async function GET() {
  const status = getAuthConfigStatus();
  return NextResponse.json(status, { status: status.ready ? 200 : 503 });
}

/**
 * Server-side access-code check. The browser never holds or compares secrets; it submits the
 * code the user typed and receives only the resolved role.
 */
export async function POST(req: Request) {
  let parsed;
  try {
    parsed = VerifySchema.safeParse(await req.json());
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }

  const code = parsed.data.code.trim();
  const clientKey = `verify:${extractClientKey(req, code)}`;
  if (isKeyThrottled(clientKey)) {
    return NextResponse.json(
      { success: false, error: "Too many attempts. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  const role = resolveRoleFromCode(code);
  if (!role) {
    const nowThrottled = recordFailedAttempt(clientKey);
    if (nowThrottled) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Please wait a minute and try again." },
        { status: 429 }
      );
    }
    return NextResponse.json({ success: false, error: "That code wasn't recognised." }, { status: 401 });
  }
  return NextResponse.json({ success: true, role });
}
