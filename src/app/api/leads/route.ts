import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import {
  handleLeadGet,
  persistLeadRecord,
  type LeadDb,
  type StoredLeadRecord,
} from "@/lib/leadLogic";

const globalForLeads = global as unknown as {
  recentLeadsStore?: StoredLeadRecord[];
  prisma?: PrismaClient;
};
const recentLeadsStore: StoredLeadRecord[] = globalForLeads.recentLeadsStore || [];
globalForLeads.recentLeadsStore = recentLeadsStore;

const prisma = globalForLeads.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForLeads.prisma = prisma;

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

const DEFAULT_GOOGLE_SHEETS_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbzgqk0EatPP935z68kOkm6PSeJbEdC5YDlo1puNslqkd7sgLROK-DRwpyYOv_9IhbNvRg/exec";

/**
 * Authenticated Consultant/Admin Endpoint to Load Captured Homeowner Leads into /pricing.
 * Enforces Law 21 & Law 24 (server-side authorization before returning any consumer PII).
 */
export async function GET(request: Request) {
  const result = await handleLeadGet(prisma as unknown as LeadDb, recentLeadsStore, request);
  return NextResponse.json(result.body, { status: result.status });
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Malformed JSON body." }, { status: 400 });
    }

    const persisted = await persistLeadRecord(
      prisma as unknown as LeadDb,
      recentLeadsStore,
      request,
      body
    );
    if (!persisted.ok) {
      return NextResponse.json(persisted.body, { status: persisted.status });
    }

    const capturedRecord = persisted.record;
    const { leadRef } = capturedRecord;

    // ARCHON Law 25/27: Log non-PII reference ID only (never dump raw consumer PII to stdout)
    console.log(`[wa-solar-leads] Captured ${leadRef} (billSize=$${capturedRecord.billSize}, db=${persisted.dbPersisted})`);

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
            name: sanitizeSheetCell(capturedRecord.name),
            mobile: "'" + capturedRecord.mobile,
            email: sanitizeSheetCell(capturedRecord.email),
            address: sanitizeSheetCell(capturedRecord.address),
            billSize: capturedRecord.billSize,
            roofType: sanitizeSheetCell(capturedRecord.roofType),
            phasing: sanitizeSheetCell(capturedRecord.phasing),
            notes: sanitizeSheetCell(
              (capturedRecord.notes ? capturedRecord.notes + " | " : "") +
                `[Homeowner: ${capturedRecord.homeowner ? "Yes" : "No"}, System: ${capturedRecord.existingSystem}]`
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
            <td>${escapeHtml(capturedRecord.name)}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Mobile</td>
            <td>${escapeHtml(capturedRecord.mobile)}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Email</td>
            <td>${escapeHtml(capturedRecord.email)}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Address</td>
            <td>${escapeHtml(capturedRecord.address)}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Homeowner?</td>
            <td>${capturedRecord.homeowner ? "Yes" : "No"}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Existing System</td>
            <td>${escapeHtml(capturedRecord.existingSystem)}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Roof / Phase</td>
            <td>${escapeHtml(capturedRecord.roofType)} / ${escapeHtml(capturedRecord.phasing)}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Bi-Monthly Bill</td>
            <td>$${capturedRecord.billSize}</td>
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
          subject: `NEW LEAD [${leadRef}]: WA Solar Assessment ($${capturedRecord.billSize} bill)`,
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
        delivery: { dbPersisted: persisted.dbPersisted, webhookDelivered, emailDelivered },
        message: "Lead captured successfully.",
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
