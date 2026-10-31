import { NextResponse } from "next/server";
import { z } from "zod";
import { isThrottled, resolveRoleFromCode } from "@/lib/auth";

export const dynamic = "force-dynamic";

const VerifySchema = z.object({ code: z.string().min(1).max(200) });

/**
 * Server-side access-code check. The browser never holds or compares secrets; it submits the
 * code the user typed and receives only the resolved role.
 */
export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  if (isThrottled(`verify:${ip}`)) {
    return NextResponse.json(
      { success: false, error: "Too many attempts. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  let parsed;
  try {
    parsed = VerifySchema.safeParse(await req.json());
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }

  const role = resolveRoleFromCode(parsed.data.code);
  if (!role) {
    return NextResponse.json({ success: false, error: "That code wasn't recognised." }, { status: 401 });
  }
  return NextResponse.json({ success: true, role });
}
