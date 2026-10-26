import { NextResponse } from "next/server";
import { z } from "zod";
import nodemailer from "nodemailer";

// Basic HTML sanitizer to prevent XSS in email templates
function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Neutralize spreadsheet formula injection characters (=, +, -, @)
function sanitizeSheetCell(val: string) {
  const trimmed = val.trim();
  if (/^[=+\-@]/.test(trimmed)) {
    return "'" + trimmed;
  }
  return trimmed;
}

function isAuthorizedRequest(req: Request): boolean {
  const authHeader = (req.headers.get("x-sunny-auth") || "").trim().toUpperCase();
  const expectedAdmin = (process.env.SUNNY_API_TOKEN || process.env.NEXT_PUBLIC_ADMIN_PIN || "2026").toUpperCase();
  const expectedPartner = (process.env.NEXT_PUBLIC_PARTNER_CODE || "SUNNYEX").toUpperCase();
  return Boolean(authHeader && (authHeader === expectedAdmin || authHeader === expectedPartner));
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

const globalForLeads = global as unknown as { recentLeadsStore?: StoredLeadRecord[] };
const recentLeadsStore: StoredLeadRecord[] = globalForLeads.recentLeadsStore || [];
globalForLeads.recentLeadsStore = recentLeadsStore;

const DEFAULT_GOOGLE_SHEETS_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbzgqk0EatPP935z68kOkm6PSeJbEdC5YDlo1puNslqkd7sgLROK-DRwpyYOv_9IhbNvRg/exec";

const LeadSchema = z.object({
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

/**
 * Authenticated Consultant/Admin Endpoint to Load Captured Homeowner Leads into /pricing.
 * Enforces Law 21 & Law 24 (server-side authorization before returning any consumer PII).
 */
export async function GET(request: Request) {
  if (!isAuthorizedRequest(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: valid consultant or admin credentials required." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    leads: recentLeadsStore.slice(0, 50),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = LeadSchema.parse(body);
    const leadRef = `LEAD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const createdAt = new Date().toISOString();

    // ARCHON Law 25/27: Log non-PII reference ID only (never dump raw consumer PII to stdout)
    console.log(`[wa-solar-leads] Captured ${leadRef} (billSize=$${validatedData.billSize})`);

    const capturedRecord: StoredLeadRecord = {
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

    recentLeadsStore.unshift(capturedRecord);
    if (recentLeadsStore.length > 200) {
      recentLeadsStore.length = 200;
    }

    // 1. Google Sheets Webhook Delivery (always active in production & dev so leads never drop silently)
    const googleScriptUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || DEFAULT_GOOGLE_SHEETS_WEBHOOK_URL;
    let webhookDelivered = false;

    if (googleScriptUrl) {
      try {
        const sheetResponse = await fetch(googleScriptUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(10000),
          body: JSON.stringify({
            leadRef,
            name: sanitizeSheetCell(validatedData.name),
            mobile: "'" + validatedData.mobile.trim(),
            email: sanitizeSheetCell(validatedData.email),
            address: sanitizeSheetCell(validatedData.address),
            billSize: validatedData.billSize,
            roofType: sanitizeSheetCell(validatedData.roofType),
            phasing: sanitizeSheetCell(validatedData.phasing),
            notes: sanitizeSheetCell(
              (validatedData.notes ? validatedData.notes + " | " : "") +
                `[Homeowner: ${validatedData.homeowner ? "Yes" : "No"}, System: ${validatedData.existingSystem}]`
            ),
          }),
        });

        if (sheetResponse.ok) {
          webhookDelivered = true;
        } else {
          console.error(`[wa-solar-leads] Sheet webhook failed for ${leadRef} with status ${sheetResponse.status}`);
        }
      } catch {
        console.error(`[wa-solar-leads] Error forwarding ${leadRef} to Google Sheets webhook.`);
      }
    }

    // 2. Email Delivery Setup
    let transporter;
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else if (process.env.NODE_ENV !== "production") {
      try {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      } catch {
        transporter = undefined;
      }
    }

    let emailDelivered = false;
    if (transporter) {
      const htmlContent = `
        <h2>New WA Solar Lead (${escapeHtml(leadRef)})</h2>
        <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr>
            <td style="font-weight: bold; width: 30%;">Name</td>
            <td>${escapeHtml(validatedData.name)}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Mobile</td>
            <td>${escapeHtml(validatedData.mobile)}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Email</td>
            <td>${escapeHtml(validatedData.email)}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Address</td>
            <td>${escapeHtml(validatedData.address)}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Homeowner?</td>
            <td>${validatedData.homeowner ? "Yes" : "No"}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Existing System</td>
            <td>${escapeHtml(validatedData.existingSystem)}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Roof / Phase</td>
            <td>${escapeHtml(validatedData.roofType)} / ${escapeHtml(validatedData.phasing)}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Bi-Monthly Bill</td>
            <td>$${validatedData.billSize}</td>
          </tr>
        </table>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          This lead was securely generated via the WA Solar Assessments funnel.
        </p>
      `;

      try {
        await transporter.sendMail({
          from: '"WA Solar System" <leads@wasolarassessments.com.au>',
          to: process.env.LEAD_DESTINATION_EMAIL || "test-inbox@wasolarassessments.com.au",
          subject: `NEW LEAD [${leadRef}]: WA Solar Assessment ($${validatedData.billSize} bill)`,
          html: htmlContent,
        });
        emailDelivered = true;
      } catch {
        console.error(`[wa-solar-leads] SMTP send failed for ${leadRef}.`);
      }
    }

    return NextResponse.json(
      {
        success: true,
        leadRef,
        lead: capturedRecord,
        delivery: { webhookDelivered, emailDelivered },
        message: "Lead captured successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid form input." }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
