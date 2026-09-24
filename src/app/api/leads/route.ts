import { NextResponse } from "next/server";
import { z } from "zod";
import nodemailer from "nodemailer";
import { promises as fs } from "fs";
import { existsSync } from "fs";
import path from "path";

// Basic HTML sanitizer to prevent XSS in email templates
function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const LeadSchema = z.object({
  homeowner: z.boolean(),
  existingSystem: z.string().min(1).max(100),
  billSize: z.number().min(0).max(10000),
  address: z.string().min(5).max(255),
  name: z.string().min(2).max(100),
  mobile: z.string().min(8).max(20).regex(/^[0-9+\s()-]+$/, "Invalid phone format"),
  email: z.string().email().max(150),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = LeadSchema.parse(body);

    console.log("================ NEW LEAD CAPTURED ================");
    console.log(JSON.stringify(validatedData, null, 2));

    // 1. Local Spreadsheet (CSV) Delivery
    try {
      const csvFilePath = path.join(process.cwd(), "leads.csv");
      const fileExists = existsSync(csvFilePath);
      
      // If file doesn't exist, write the header row first
      if (!fileExists) {
        await fs.writeFile(csvFilePath, "Date,Name,Mobile,Email,Address,Homeowner,Bill Size\n", "utf8");
      }

      // Append the new lead (sanitizing commas for CSV format)
      const dateStr = new Date().toLocaleString("en-AU", { timeZone: "Australia/Perth" });
      const safeName = validatedData.name.replace(/"/g, '""');
      const safeAddress = validatedData.address.replace(/"/g, '""');
      const csvRow = `"${dateStr}","${safeName}","${validatedData.mobile}","${validatedData.email}","${safeAddress}","${validatedData.homeowner ? 'Yes' : 'No'}","$${validatedData.billSize}"\n`;
      
      await fs.appendFile(csvFilePath, csvRow, "utf8");
      console.log("Successfully saved lead to local leads.csv spreadsheet.");
    } catch (csvError) {
      console.error("Error writing to local CSV spreadsheet:", csvError);
    }

    // 2. Google Sheets Webhook Delivery
    try {
      const googleScriptUrl = "https://script.google.com/macros/s/AKfycbwlDmkALUvKBb1r1VrDRKpCYngAt2QGUBf7cxzSdNbamn7h7i9lRCpXNw9OcGMkNbu2PA/exec";
      
      const sheetResponse = await fetch(googleScriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...validatedData,
          mobile: "'" + validatedData.mobile
        }),
      });
      
      if (sheetResponse.ok) {
        console.log("Successfully forwarded lead to live Google Sheet.");
      } else {
        console.error("Failed to forward to Google Sheets. Status:", sheetResponse.status);
      }
    } catch (sheetError) {
      console.error("Error sending to Google Sheets:", sheetError);
    }

    // 3. Email Delivery Setup
    let transporter;

    // Check if real SMTP credentials exist
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
    } else {
      // Fallback: Create a free testing account (Ethereal Email) to prove it works
      console.log("No SMTP credentials found in .env. Generating a test email account...");
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
    }

    const htmlContent = `
      <h2>New WA Solar Lead</h2>
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
          <td>${validatedData.homeowner ? 'Yes' : 'No'}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Existing System</td>
          <td>${escapeHtml(validatedData.existingSystem)}</td>
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

    const info = await transporter.sendMail({
      from: '"WA Solar System" <leads@wasolarassessments.com.au>',
      to: process.env.LEAD_DESTINATION_EMAIL || "test-inbox@wasolarassessments.com.au", // your real email goes here
      subject: `🚨 NEW LEAD: ${validatedData.name} in WA`,
      html: htmlContent,
    });

    console.log("Lead email dispatched successfully!");
    
    // If using the test account, provide the URL to view the email
    if (info.messageId && !process.env.SMTP_HOST) {
      console.log("Preview your lead email here: %s", nodemailer.getTestMessageUrl(info));
    }
    console.log("===================================================");

    return NextResponse.json({ success: true, message: "Lead captured successfully." }, { status: 200 });
  } catch (error) {
    console.error("Submission Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
