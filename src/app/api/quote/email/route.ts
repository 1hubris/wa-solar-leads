import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { QuoteData } from '@/lib/types';
import { extractClientKey, isThrottled, resolveRole } from '@/lib/auth';

function escapeHtml(unsafe: string): string {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const EmailRequestSchema = z.object({
  emailTo: z.string().email().max(150),
});

export async function POST(request: Request) {
  try {
    const role = resolveRole(request);
    if (role !== 'admin' && role !== 'consultant') {
      return NextResponse.json({ error: 'Unauthorized quote dispatch.' }, { status: 401 });
    }
    if (isThrottled(`email:${extractClientKey(request)}`)) {
      return NextResponse.json({ error: 'Quote email rate limit exceeded. Please wait a minute.' }, { status: 429 });
    }

    const body = await request.json();
    const { emailTo } = EmailRequestSchema.parse(body);
    const quoteData: QuoteData = body.quoteData;

    if (!quoteData || typeof quoteData.sellPrice !== 'number') {
      return NextResponse.json({ error: 'Missing required quote fields' }, { status: 400 });
    }

    let transporter;
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else if (process.env.NODE_ENV !== 'production') {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } else {
      return NextResponse.json({ error: 'Email service unavailable.' }, { status: 503 });
    }

    const safeTierName = escapeHtml(quoteData.activeTierName);
    const safeExtras = Array.isArray(quoteData.activeExtras) && quoteData.activeExtras.length > 0
      ? quoteData.activeExtras.map((e) => escapeHtml(String(e))).join(', ')
      : 'Standard Install';
    const safeRetailer = escapeHtml(quoteData.waRetailer);

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
        <div style="background-color: #f8fafc; padding: 20px; border-bottom: 4px solid #0ea5e9; text-align: center;">
          <h1 style="color: #0f172a; margin: 0;">Sunny State Quotes</h1>
          <p style="color: #64748b; margin-top: 5px;">WA's Solar Assessment &amp; Procurement Clearinghouse</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #0f172a;">Your Custom Solar &amp; Battery Estimate</h2>
          <p style="line-height: 1.6;">Based on our technical assessment of your property, we have prepared the following system specification and estimate.</p>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 10px;">System Specifications</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 10px;"><strong>PV Array:</strong> ${Number(quoteData.pvSize)}kW (${safeTierName})</li>
              ${quoteData.batterySize > 0 ? `<li style="margin-bottom: 10px;"><strong>Battery:</strong> ${Number(quoteData.batterySize)}kWh (${safeTierName})</li>` : ''}
              <li><strong>Site Variables Included:</strong> ${safeExtras}</li>
            </ul>
          </div>

          <div style="background-color: #0f172a; color: white; padding: 25px; border-radius: 12px; margin: 30px 0;">
            <h3 style="color: #7dd3fc; margin-top: 0; text-transform: uppercase; letter-spacing: 1px; font-size: 12px;">Financial Breakdown</h3>
            
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 10px; margin-bottom: 10px;">
              <span>Total System Value</span>
              <span>$${Number(quoteData.sellPrice + quoteData.totalRebates).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; color: #10b981; margin-bottom: 8px;">
              <span>PV STC Grant Claimed (${Number(quoteData.pvCertificates)} certs)</span>
              <span>-$${Number(quoteData.pvStcDiscount).toLocaleString()}</span>
            </div>
            
            ${quoteData.batterySize > 0 ? `
            <div style="display: flex; justify-content: space-between; color: #10b981; margin-bottom: 8px;">
              <span>Battery STCs (${Number(quoteData.batteryCertificates)} certs)</span>
              <span>-$${Number(quoteData.batteryStcDiscount).toLocaleString()}</span>
            </div>
            ` : ''}

            ${quoteData.batterySize > 0 && quoteData.waRetailer !== 'None' ? `
            <div style="display: flex; justify-content: space-between; color: #10b981; margin-bottom: 8px;">
              <span>WA ${safeRetailer} Battery Rebate</span>
              <span>-$${Number(quoteData.stateBatteryRebate).toLocaleString()}</span>
            </div>` : ''}

            <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #334155;">
              <div style="color: #7dd3fc; font-size: 12px;">Final Out-of-Pocket</div>
              <div style="font-size: 32px; font-weight: bold; color: white;">$${Number(quoteData.sellPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
          
          <div style="font-size: 11px; color: #94a3b8; font-style: italic; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <strong>Important Notice &amp; Tender Conditions:</strong> This document is a pricing estimate based on remote assessment. Final installation pricing is subject to physical site inspection and engineering approval by the assigned WA licensed electrical contractor.
            <br/><br/>
            <strong>Statutory Consumer Guarantees:</strong> Physical installation contracts and workmanship warranties are executed by the assigned licensed Electrical Contracting Company. Nothing in this estimate excludes, restricts, or modifies any consumer guarantee, right, or remedy conferred by the Australian Consumer Law (ACL s 64).
          </div>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: '"Sunny State Quotes" <quotes@sunnystatequotes.com>',
      to: emailTo,
      subject: `Your Solar & Battery Quote ($${Number(quoteData.sellPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })})`,
      html: htmlTemplate,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || null,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
