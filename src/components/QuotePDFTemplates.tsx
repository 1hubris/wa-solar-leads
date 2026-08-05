import React from 'react';
import { QuoteData } from '@/lib/types';
import { Sun, Battery, ShieldCheck, Banknote, ClipboardCheck, Zap, UserCheck } from 'lucide-react';

// ==========================================
// CUSTOMER-FACING QUOTE TEMPLATE
// STRICTLY NO INTERNAL MARGINS OR COSTS HERE
// ==========================================
export const CustomerQuoteTemplate = ({ data }: { data: QuoteData }) => {
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
          <p className="text-sm text-slate-400 mt-1">Generated: {new Date().toLocaleDateString()}</p>
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

          {data.batterySize > 0 && data.waRetailer !== "None" && (
            <div className="flex justify-between text-emerald-400">
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

          <div className="flex justify-between items-end border-t-2 border-primary-700 pt-6 mt-4">
            <div>
              <span className="block text-2xl font-black text-accent-400">Final Out-of-Pocket</span>
              <span className="block text-xs text-primary-300 mt-1">Fully installed, commissioned, and warranted.</span>
            </div>
            <span className="text-4xl font-black text-white">${data.sellPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
        </div>
      </div>

      {/* Legal */}
      <div className="mt-auto border-t border-slate-200 pt-4 text-[10px] text-slate-400 leading-relaxed italic text-justify">
        <strong>Important Notice & Tender Conditions:</strong> This document is a pricing estimate based on remote assessment and does not constitute a legally binding contract. Final pricing is strictly subject to a physical site inspection and structural/electrical engineering approval by the installing electrical company. The net revenue absorbs standard Customer Acquisition Costs (CAC), providing savings directly to you. All known site extras have been included. If unforeseen but proven electrical or structural complexities occur on-site, a 3-way negotiation will be entered between the consultant, the marketing entity, and the installer to balance out the overhead. If the required extras are so severe that they completely destroy margins and a compromise cannot be reached, only then must the customer bear the cost for a solution, or the contract may be cancelled with full refund of deposit.
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

    </div>
  );
};
