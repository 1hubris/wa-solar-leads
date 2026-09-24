import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { QuoteData } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { emailTo, quoteData }: { emailTo: string, quoteData: QuoteData } = await request.json();

    if (!emailTo || !quoteData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use environment variables for SMTP if available, otherwise generate an ethereal test account
    let transporter;
    
    if (process.env.SMTP_HOST) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Create a test account on the fly for development
      console.log('No SMTP config found. Generating ethereal test account...');
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
    }

    // Build the HTML template (Strictly Customer-Facing Data Only)
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
        <div style="background-color: #f8fafc; padding: 20px; border-bottom: 4px solid #0ea5e9; text-align: center;">
          <h1 style="color: #0f172a; margin: 0;">Sunny State Quotes</h1>
          <p style="color: #64748b; margin-top: 5px;">WA's Premium Solar Assessment Brokerage</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #0f172a;">Your Custom Solar & Battery Solution</h2>
          <p style="line-height: 1.6;">Based on our technical assessment of your property, we have negotiated the following wholesale-direct package. This system has been specifically sized to eliminate your Synergy bills and protect you against future energy inflation.</p>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 10px;">System Specifications</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 10px;"><strong>PV Array:</strong> ${quoteData.pvSize}kW (${quoteData.activeTierName})</li>
              ${quoteData.batterySize > 0 ? `<li style="margin-bottom: 10px;"><strong>Battery:</strong> ${quoteData.batterySize}kWh (${quoteData.activeTierName})</li>` : ''}
              <li><strong>Site Variables Included:</strong> ${quoteData.activeExtras.length > 0 ? quoteData.activeExtras.join(", ") : "Standard Install"}</li>
            </ul>
          </div>

          <div style="background-color: #0f172a; color: white; padding: 25px; border-radius: 12px; margin: 30px 0;">
            <h3 style="color: #7dd3fc; margin-top: 0; text-transform: uppercase; letter-spacing: 1px; font-size: 12px;">Financial Breakdown</h3>
            
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 10px; margin-bottom: 10px;">
              <span>Total System Value</span>
              <span>$${(quoteData.sellPrice + quoteData.totalRebates).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; color: #10b981; margin-bottom: 8px;">
              <span>PV STC Grant Claimed (${quoteData.pvCertificates} certs)</span>
              <span>-$${quoteData.pvStcDiscount.toLocaleString()}</span>
            </div>
            
            ${quoteData.batterySize > 0 ? `
            <div style="display: flex; justify-content: space-between; color: #10b981; margin-bottom: 8px;">
              <span>Battery STCs (${quoteData.batteryCertificates} certs)</span>
              <span>-$${quoteData.batteryStcDiscount.toLocaleString()}</span>
            </div>
            ` : ''}

            ${quoteData.batterySize > 0 && quoteData.waRetailer !== "None" ? `
            <div style="display: flex; justify-content: space-between; color: #10b981; margin-bottom: 8px;">
              <span>WA ${quoteData.waRetailer} Battery Rebate</span>
              <span>-$${quoteData.stateBatteryRebate.toLocaleString()}</span>
            </div>` : ''}

            <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #334155;">
              <div style="color: #7dd3fc; font-size: 12px;">Final Out-of-Pocket</div>
              <div style="font-size: 32px; font-weight: bold; color: white;">$${quoteData.sellPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
            </div>
          </div>
          
          <div style="font-size: 11px; color: #94a3b8; font-style: italic; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <strong>Important Notice & Tender Conditions:</strong> This document is a pricing estimate based on remote assessment and does not constitute a legally binding contract. Final pricing is strictly subject to a physical site inspection and structural/electrical engineering approval by the installing electrical company. All known site extras have been included.
            <br/><br/>
            <strong>Liability Disclaimer:</strong> Sunny State Quotes operates strictly as a data acquisition and marketing broker. All installation contracts, warranties, and Australian Consumer Law obligations are held strictly by the licensed Electrical Contracting Company performing the installation. Sunny State Quotes accepts zero liability for installation defects, timeline delays, or STC/remedial compliance.
          </div>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: '"Sunny State Quotes" <quotes@sunnystatequotes.com>',
      to: emailTo,
      subject: `Your Solar & Battery Quote ($${quoteData.sellPrice.toLocaleString(undefined, {minimumFractionDigits: 2})})`,
      html: htmlTemplate,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("Message sent: %s", info.messageId);
    if (previewUrl) {
      console.log("Preview URL: %s", previewUrl);
    }

    return NextResponse.json({ 
      success: true, 
      messageId: info.messageId,
      previewUrl: previewUrl || null
    });

  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
