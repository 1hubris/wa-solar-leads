'use client';
import React, { useState, useEffect } from 'react';
import { QuoteData } from '@/lib/types';
import { Sun, Battery, ShieldCheck, Banknote, ClipboardCheck, Zap, UserCheck } from 'lucide-react';

// ==========================================
// CUSTOMER-FACING QUOTE TEMPLATE
// STRICTLY NO INTERNAL MARGINS OR COSTS HERE
// ==========================================
export const CustomerQuoteTemplate = ({ data }: { data: QuoteData }) => {
  const [dateStr, setDateStr] = useState('');
  useEffect(() => {
    setDateStr(new Date().toLocaleDateString());
  }, []);
  return (
    <div id="customer-quote-pdf" className="bg-white p-10 w-[800px] text-slate-800" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b-4 border-primary-500 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-primary-500 text-white p-2 rounded-lg">
              <Sun className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sunny State Quotes</h1>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-2 ml-1">WA's Premium Solar Assessment Brokerage</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-slate-700 uppercase tracking-widest">Pricing Proposal</h2>
          <p className="text-sm text-slate-400 mt-1">Generated: {dateStr}</p>
        </div>
      </div>

      {/* Intro */}
      <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-100">
        <h3 className="font-bold text-lg text-slate-800 mb-2">Your Custom Solar & Battery Solution</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          Based on our technical assessment of your property, we have negotiated the following wholesale-direct package. This system has been specifically sized to eliminate your Synergy bills and protect you against future energy inflation.
        </p>
      </div>

      {/* System Specs */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-3 border-b border-slate-100 pb-2">Hardware Specification</h4>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Sun className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800">{data.pvSize}kW Solar Array</p>
                <p className="text-xs text-slate-500">{data.activeTierName}</p>
              </div>
            </div>
            {data.batterySize > 0 && (
              <div className="flex items-start gap-3">
                <Battery className="w-5 h-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800">{data.batterySize}kWh Battery Storage</p>
                  <p className="text-xs text-slate-500">{data.activeTierName}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-3 border-b border-slate-100 pb-2">Site Specifics</h4>
          <ul className="space-y-2 text-sm text-slate-700">
            {data.activeExtras.length > 0 ? (
              data.activeExtras.map((extra, i) => (
                <li key={i} className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary-500" /> {extra}
                </li>
              ))
            ) : (
              <li className="flex items-center gap-2 text-slate-500 italic">
                Standard Installation (No extras required)
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Financials */}
      <div className="bg-primary-900 rounded-2xl p-8 text-white mb-8 shadow-xl">
        <h4 className="text-xs font-bold uppercase text-primary-300 tracking-widest mb-6">Financial Breakdown</h4>
        
        <div className="space-y-4 text-base font-medium">
          <div className="flex justify-between items-end border-b border-primary-800 pb-3">
            <span className="text-primary-100">Total System Value (Pre-Rebates)</span>
            <span className="text-xl">${(data.sellPrice + data.totalRebates).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>

          <div className="flex justify-between text-emerald-400 pt-2">
            <span>Federal STC Grant Claimed ({data.pvCertificates} certs)</span>
            <span>-${data.pvStcDiscount.toLocaleString()}</span>
          </div>
          
          {data.batterySize > 0 && (
            <div className="flex justify-between text-emerald-400 pt-1">
              <span>Battery STCs ({data.batteryCertificates} certs)</span>
              <span>-${data.batteryStcDiscount.toLocaleString()}</span>
            </div>
          )}

          {data.batterySize > 0 && data.waRetailer !== "None" && (
            <div className="flex justify-between text-emerald-400 pt-1">
              <span>WA {data.waRetailer} Battery Rebate Claimed</span>
              <span>-${data.stateBatteryRebate.toLocaleString()}</span>
            </div>
          )}

          {data.vendorFeePct > 0 && (
            <div className="flex justify-between text-amber-300 border-t border-primary-800 pt-3">
              <span>{data.financeVendor} Finance Vendor Fee</span>
              <span>Fully Absorbed</span>
            </div>
          )}

          <div className="flex justify-between text-blue-300 pt-1">
            <span>Sunny State Warranty Assurance Fund</span>
            <span>Included ($150)</span>
          </div>

          <div className="flex justify-between items-end border-t-2 border-primary-700 pt-6 mt-4">
            <div>
              <span className="block text-2xl font-black text-accent-400">Final Out-of-Pocket</span>
              <span className="block text-xs text-primary-300 mt-1">Fully installed, commissioned, and warranted.</span>
            </div>
            <span className="text-4xl font-black text-white">${data.sellPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 pt-4 border-t-2 border-slate-200 text-[10px] text-slate-500 italic leading-relaxed">
        <strong>Important Legal Notice:</strong> This document is a pricing estimate based on remote assessment and does not constitute a legally binding contract. Final pricing is strictly subject to a physical site inspection and structural/electrical engineering approval by the installing electrical company. All known site extras have been included. 
        <br/><br/>
        <strong>Liability Disclaimer:</strong> Sunny State Quotes operates strictly as a data acquisition and marketing broker. All installation contracts, warranties, and Australian Consumer Law obligations are held strictly by the licensed Electrical Contracting Company performing the installation. Sunny State Quotes accepts zero liability for installation defects, timeline delays, or STC/remedial compliance.
      </div>
    </div>
  );
};


// ==========================================
// CUSTOMER TERMS & CONDITIONS TEMPLATE (PAGE 2)
// ==========================================
export const CustomerTermsTemplate = () => {
  return (
    <div id="customer-terms-pdf" className="bg-white p-10 w-[800px] text-slate-800" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="border-b-4 border-slate-800 pb-4 mb-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Terms & Conditions of Sale</h2>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Legally Binding Contract - Please Read Carefully</p>
      </div>

      <div className="grid grid-cols-2 gap-8 text-[10px] leading-relaxed text-justify">
        {/* Column 1 */}
        <div className="space-y-5">
          <div>
            <h3 className="font-bold text-[11px] text-slate-900 uppercase mb-1">1. Contractual Parties & Brokerage</h3>
            <p><strong>1.1 Role of Sunny State Quotes:</strong> Sunny State Quotes operates strictly as a data acquisition, quoting, and marketing brokerage service. Sunny State Quotes does NOT perform electrical contracting, engineering, or physical installation work.</p>
            <p className="mt-2"><strong>1.2 Transfer of Liability:</strong> Upon acceptance of this quote, you enter into a direct installation contract with the assigned licensed Electrical Contracting Company ("The Installer"). All Australian Consumer Law (ACL) statutory warranties, workmanship warranties, equipment warranties, and obligations relating to STCs are the sole responsibility of the Installer. Sunny State Quotes is explicitly indemnified against property damage, defects, underperformance, or compliance failures.</p>
          </div>

          <div>
            <h3 className="font-bold text-[11px] text-slate-900 uppercase mb-1">2. Hardware & Substitutions</h3>
            <p><strong>2.1 Supply of Goods:</strong> Unless a "Specific Brand Guarantee" is explicitly itemised on this quote, the Installer reserves the right to supply any Tier 1 Clean Energy Council (CEC) approved hardware that matches the performance specifications quoted, based on local warehouse availability.</p>
            <p className="mt-2"><strong>2.2 Variations:</strong> If requested hardware is unavailable, the Installer will substitute with equivalent or superior products at no additional cost. If you reject the substitution, a full refund of the deposit will be issued.</p>
          </div>

          <div>
            <h3 className="font-bold text-[11px] text-slate-900 uppercase mb-1">3. Site Conditions & Extras</h3>
            <p><strong>3.1 Unforeseen Extras:</strong> This quote is based on remote assessment. If unforeseen structural, roofing, or electrical complexities (e.g., asbestos, non-compliant switchboards, degraded rafters) are discovered during physical inspection, the Installer may issue a Variation Order. You reserve the right to reject the Variation Order and receive a full refund of your deposit.</p>
            <p className="mt-2"><strong>3.2 Spare Tiles:</strong> If your property has a tiled roof, you must provide a minimum of 10 spare tiles (concrete) or 20 spare tiles (terracotta) on the day of installation to replace any tiles inevitably damaged during roof work.</p>
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-5">
          <div>
            <h3 className="font-bold text-[11px] text-slate-900 uppercase mb-1">4. Payment & Finance</h3>
            <p><strong>4.1 Deposit:</strong> A 10% deposit is required to secure your hardware allocation and schedule your installation.</p>
            <p className="mt-2"><strong>4.2 Final Payment:</strong> For cash purchases, the final balance is due strictly on the day of installation completion. For financed purchases, settlement will be triggered automatically upon commissioning.</p>
            <p className="mt-2"><strong>4.3 STC Assignment:</strong> The quoted price assumes you assign the right to create Small-scale Technology Certificates (STCs) to the Installer. If you are ineligible for STCs, the total price will increase by the STC discount value shown.</p>
          </div>

          <div>
            <h3 className="font-bold text-[11px] text-slate-900 uppercase mb-1">5. Warranties</h3>
            <p><strong>5.1 Workmanship:</strong> The Installer provides a 10-Year Workmanship Warranty covering defects arising directly from the physical installation process.</p>
            <p className="mt-2"><strong>5.2 Manufacturer Warranty:</strong> Product warranties (Panels, Inverters, Batteries) are held directly with the manufacturer. The Installer will assist in facilitating warranty claims, but is not liable for manufacturer insolvency or replacement delays.</p>
          </div>

          <div>
            <h3 className="font-bold text-[11px] text-slate-900 uppercase mb-1">6. Cooling Off & Cancellation</h3>
            <p><strong>6.1 Cooling Off Period:</strong> You are entitled to a 10-business-day cooling-off period from the date of signing. During this period, you may cancel this agreement without penalty and receive a full refund of your deposit.</p>
            <p className="mt-2"><strong>6.2 Post-Cooling Off:</strong> Cancellation after the cooling-off period may result in forfeiture of your deposit to cover administration, grid application, and restocking fees incurred by the Installer.</p>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t-2 border-slate-200 pt-8">
        <h3 className="text-base font-bold text-slate-800 mb-4">Customer Acceptance</h3>
        <p className="text-xs text-slate-600 mb-8">By signing below, I acknowledge that I have read, understood, and agree to the Terms & Conditions outlined above, and I authorise the progression of grid connection applications and hardware procurement.</p>
        
        <div className="grid grid-cols-2 gap-12">
          <div>
            <div className="border-b border-slate-400 h-10 mb-2"></div>
            <p className="text-xs font-bold text-slate-500 uppercase">Customer Signature</p>
          </div>
          <div>
            <div className="border-b border-slate-400 h-10 mb-2"></div>
            <p className="text-xs font-bold text-slate-500 uppercase">Date</p>
          </div>
        </div>
      </div>
    </div>
  );
};


// ==========================================
// INSTALLER JOB SHEET TEMPLATE
// HIGHLY GRANULAR. NO CONSULTANT EARNINGS SHOWN.
// ==========================================
export const InstallerWorkOrderTemplate = ({ data }: { data: QuoteData }) => {
  
  // Calculate Granular Hardware Breakdown based on Engine Math
  // PV: 40% of standard estimator. Battery: 80%. BOS: $1200 base.
  const pvCost = data.pvSize * (data.estHardwareCost / (data.pvSize + (data.batterySize || 1)) * 0.4); // Rough granular split
  const pvBrand = data.hardwareTier === 1 ? "Jinko / Trina" : data.hardwareTier === 2 ? "QCells / REC" : "Maxeon / SunPower";
  
  const inverterBrand = data.hardwareTier === 1 ? "GoodWe / SolaX" : data.hardwareTier === 2 ? "Sungrow / Fronius" : "Enphase / Tesla";
  
  const battCost = data.batterySize * (data.estHardwareCost / (data.pvSize + (data.batterySize || 1)) * 0.8);
  const battBrand = data.hardwareTier === 1 ? "AlphaESS / GoodWe" : data.hardwareTier === 2 ? "Sungrow / BYD" : "Tesla / SigenStor";

  const totalCalculatedHardware = data.estHardwareCost - 1200; // Remove BOS
  
  // Labor Breakdown
  const directWages = (data.pvSize * 30) + (data.batterySize > 0 ? 300 : 0);
  const insurancesOverheads = data.estLaborCost - directWages;

  return (
    <div id="installer-job-sheet-pdf" className="bg-white p-10 w-[800px] text-slate-800" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div className="flex justify-between items-start border-b-4 border-slate-800 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ClipboardCheck className="w-8 h-8 text-slate-800" />
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Approved Tender</h1>
          </div>
          <p className="text-sm font-bold text-red-600 uppercase tracking-widest bg-red-50 inline-block px-2 py-1 rounded">Confidential: For Installer Only</p>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-bold text-slate-700">Work Order Auth</h2>
          <p className="text-sm text-slate-500 mt-1">Date: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-bold text-slate-900 border-b-2 border-slate-200 pb-2 mb-4">System Requirements</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between"><span className="text-slate-500">PV Array:</span> <span className="font-bold">{data.pvSize}kW ({pvBrand})</span></li>
            <li className="flex justify-between"><span className="text-slate-500">Inverter:</span> <span className="font-bold">{inverterBrand}</span></li>
            {data.batterySize > 0 && (
              <li className="flex justify-between"><span className="text-slate-500">Battery:</span> <span className="font-bold">{data.batterySize}kWh ({battBrand})</span></li>
            )}
          </ul>
        </div>
        
        <div>
          <h3 className="text-sm font-bold text-slate-900 border-b-2 border-slate-200 pb-2 mb-4">Site Complexities (Billed Extras)</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            {data.activeExtras.length > 0 ? (
              data.activeExtras.map((extra, i) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> {extra}
                </li>
              ))
            ) : (
              <li className="italic text-slate-400">Standard Install</li>
            )}
          </ul>
        </div>
      </div>

      {/* The Core Financials */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8">
        <h3 className="text-xs font-bold uppercase text-slate-500 tracking-widest mb-6">Tender Financials (Top-Down)</h3>
        
        <div className="space-y-2 text-sm font-medium">
          {/* Top Line Net */}
          <div className="flex justify-between items-center bg-green-100/50 p-4 rounded-lg border border-green-200 mb-6">
            <span className="text-base font-bold text-green-900">Total Contract Value (Net to Installer)</span>
            <span className="text-2xl font-black text-green-700">${data.installerNetRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>

          <p className="text-xs text-slate-500 mb-4">* The above value is strictly AFTER all marketing, lead gen, and sales commissions have been paid. $0 CAC.</p>

          <div className="border-t border-slate-200 pt-4 mb-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase mb-3">Est. Hardware Allowances (Tier {data.hardwareTier})</h4>
            <div className="flex justify-between text-slate-600 pl-4 mb-1">
              <span>Primary Components (PV, Inverter, Battery)</span>
              <span>-${totalCalculatedHardware.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            </div>
            <div className="flex justify-between text-slate-600 pl-4 mb-1">
              <span>Balance of System (Racking, Switchgear, Cables)</span>
              <span>-$1,200</span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 mb-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase mb-3">Est. Labor & Overhead Allowances</h4>
            <div className="flex justify-between text-slate-600 pl-4 mb-1">
              <span>Direct Wages (Electrician + Apprentice)</span>
              <span>-${directWages.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            </div>
            <div className="flex justify-between text-slate-600 pl-4 mb-1">
              <span>Business Overheads (Insurance, Van, Admin)</span>
              <span>-${insurancesOverheads.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            </div>
            {data.totalExtrasCost > 0 && (
              <div className="flex justify-between text-red-500 pl-4 mb-1 pt-1 font-bold">
                <span>Site Extras Allowance (Complexity Buffer)</span>
                <span>-${data.totalExtrasCost.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center border-t-2 border-slate-800 pt-4 mt-6">
            <span className="text-lg font-bold text-slate-900">Estimated Take-Home Profit (Net Margin)</span>
            <span className="text-2xl font-black text-slate-900">${data.estInstallerProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-start gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
        <UserCheck className="w-8 h-8 text-blue-500 flex-shrink-0" />
        <p className="text-xs text-blue-800 leading-relaxed">
          <strong>Notice to Director:</strong> This job carries a zero Customer Acquisition Cost (CAC) for your firm. All reasonable complexities known at the time of sale have been priced into the Extras Allowance above. If unforeseen structural/electrical issues are discovered on the day of install, please contact the Lead Generator to negotiate a margin offset before charging the customer.
        </p>
      </div>

      <div className="flex items-start gap-4 bg-purple-50 p-4 rounded-xl border border-purple-100 mt-4">
        <ShieldCheck className="w-6 h-6 text-purple-500 flex-shrink-0" />
        <p className="text-xs text-purple-800 leading-relaxed">
          <strong>Warranty Assurance Fund:</strong> This job is backed by the Sunny State Warranty Assurance Fund. $150 has been safely escrowed by the brokerage from the marketing fee to cover future orphan warranty labor claims, ensuring maximum protection for both the customer and the installer network.
        </p>
      </div>

      {/* Legal Acceptance */}
      <div className="mt-6 pt-4 border-t-2 border-slate-200 text-[10px] text-slate-500 italic leading-relaxed">
        <strong>B2B Tender Conditions & Liability Transfer:</strong> By accepting this lead and proceeding with the installation, the Electrical Contracting Company acknowledges that Sunny State Quotes acts solely as a lead generation and marketing broker. The Installer agrees to assume 100% legal liability for the physical installation, STC claims, and all Australian Consumer Law (ACL) statutory warranties (including 10-year workmanship). Sunny State Quotes is explicitly indemnified against any structural, electrical, or consumer claims arising from this site.
        <br/><br/>
        <strong>Margin Integrity:</strong> The installer net revenue absorbs standard Customer Acquisition Costs (CAC). All site extras and billables must be inclusive of this final quote so the customer cannot incur extras based on predatory behaviour. If unforeseen but proven extras occur on-site, a 3-way negotiation will be entered between the consultant, the marketing entity, and the installer to balance out the overhead and preserve profitability for all parties.
      </div>
    </div>
  );
};
