import { NextResponse } from "next/server";
import { z } from "zod";
import nodemailer from "nodemailer";

const LeadSchema = z.object({
  homeowner: z.boolean(),
  existingSystem: z.string().min(1),
  billSize: z.number(),
  address: z.string().min(5),
  name: z.string().min(2),
  mobile: z.string().min(8),
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = LeadSchema.parse(body);

    console.log("================ NEW LEAD CAPTURED ================");
    console.log(JSON.stringify(validatedData, null, 2));

    // Email Delivery Setup
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
          <td>${validatedData.name}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Mobile</td>
          <td>${validatedData.mobile}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Email</td>
          <td>${validatedData.email}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Address</td>
          <td>${validatedData.address}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Homeowner?</td>
          <td>${validatedData.homeowner ? 'Yes' : 'No'}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Existing System</td>
          <td>${validatedData.existingSystem}</td>
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
      return NextResponse.json({ success: false, error: (error as z.ZodError).errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
