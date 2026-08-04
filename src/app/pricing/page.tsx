"use client";

import { useState, useEffect } from "react";
import { Calculator, DollarSign, ShieldCheck, Wrench, Settings, Users, ArrowUpRight } from "lucide-react";

export default function PricingCalculator() {
  // System Specs
  const [pvSize, setPvSize] = useState<number>(6.6);
  const [batterySize, setBatterySize] = useState<number>(10);
  
  // Base + Variable Cost Engine Constants
  const [baseFee, setBaseFee] = useState<number>(1500); 
  const [pvRate, setPvRate] = useState<number>(700);    
  const [battRate, setBattRate] = useState<number>(600); 
  const [marketingFee, setMarketingFee] = useState<number>(1500); // User's Flat Lead Gen Fee

  // Rebate Tuning
  const [stcValue, setStcValue] = useState<number>(39);
  const [federalBattFactor, setFederalBattFactor] = useState<number>(6.8); 
  const [waRetailer, setWaRetailer] = useState<string>("Synergy");
  
  // Consultant Sell Price
  const [sellPrice, setSellPrice] = useState<number>(13500);

  // 1. Rebates 
  const pvCertificates = Math.floor(pvSize * 1.382 * 5);
  const pvStcDiscount = pvCertificates * stcValue;
  
  const battCertificates = batterySize > 0 ? Math.floor(batterySize * federalBattFactor) : 0;
  const federalBatteryDiscount = battCertificates * stcValue;

  let stateBatteryRebate = 0;
  if (batterySize > 0) {
    if (waRetailer === "Synergy") stateBatteryRebate = 1300;
    if (waRetailer === "Horizon") stateBatteryRebate = 3800;
  }
  
  const totalRebates = pvStcDiscount + federalBatteryDiscount + stateBatteryRebate;

  // 2. Bottom-Up Calculation
  const installerRequiredGross = baseFee + (pvSize * pvRate) + (batterySize * battRate);
  const installerRequiredCash = installerRequiredGross - totalRebates;
  
  const subtotalRequiredCash = Math.max(0, installerRequiredCash) + marketingFee;
  
  // Divide by 0.90 to ensure the Consultant gets their 10% commission WITHOUT eating into margins
  const netFloorPrice = subtotalRequiredCash > 0 ? (subtotalRequiredCash / 0.90) : 0;
  const grossPrice = netFloorPrice + totalRebates;
  
  // 3. COMMISSION SPLIT LOGIC
  const baseCommission = netFloorPrice * 0.10;
  
  const rawOvers = sellPrice - netFloorPrice;
  const cappedOvers = Math.max(0, Math.min(3000, rawOvers)); 
  
  const consultantOvers = cappedOvers / 3;
  const leadGenOvers = cappedOvers / 3;
  const installerOvers = cappedOvers / 3;

  const totalConsultantPayout = baseCommission + consultantOvers;
  const totalLeadGenPayout = marketingFee + leadGenOvers;

  // 4. Installer Real-World Cash Flow Math
  // The customer pays the entire 'sellPrice' directly to the Installer.
  const installerGrossCashIn = sellPrice + totalRebates;
  
  // The installer then pays the two invoices (Consultant & Lead Gen).
  const installerNetRevenue = installerGrossCashIn - totalConsultantPayout - totalLeadGenPayout;

  // Hardware/Labor Rough Estimator
  const estHardwareCost = (pvSize * 250) + (batterySize * 500) + 1200; 
  const estLaborCost = 1500 + (pvSize * 50); 
  
  // Pure Profit
  const estInstallerProfit = installerNetRevenue - estHardwareCost - estLaborCost;

  // Sync initial sell price 
  useEffect(() => {
    if (sellPrice < Math.floor(netFloorPrice) && netFloorPrice > 0) {
      setSellPrice(Math.ceil(netFloorPrice));
    }
  }, [netFloorPrice, sellPrice]);

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg">
            <Calculator className="text-accent-500 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-primary-900 tracking-tight">Cost-Plus Pricing Engine</h1>
            <p className="text-sm font-medium text-slate-500">Live 2026 WA State & Federal Math Model</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT: Inputs */}
          <div className="space-y-6">
            
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-6">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">System Specs</h2>
              
              <div>
                <label className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
                  <span>PV Array Size (kW)</span>
                  <span className="text-primary-600">{pvSize} kW</span>
                </label>
                <input type="range" min="0" max="20" step="0.1" value={pvSize} onChange={(e) => setPvSize(parseFloat(e.target.value))} className="w-full accent-primary-600" />
              </div>

              <div>
                <label className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
                  <span>Battery Size (kWh)</span>
                  <span className="text-primary-600">{batterySize} kWh</span>
                </label>
                <input type="range" min="0" max="30" step="0.5" value={batterySize} onChange={(e) => setBatterySize(parseFloat(e.target.value))} className="w-full accent-primary-600" />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="flex justify-between text-sm font-bold text-slate-900 mb-2">
                  <span>WA Retailer (For Battery Grant)</span>
                </label>
                <select 
                  value={waRetailer} 
                  onChange={(e) => setWaRetailer(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-primary-500 text-sm outline-none"
                >
                  <option value="Synergy">Synergy (Perth/SWIS) - $1,300 Rebate</option>
                  <option value="Horizon">Horizon Power (Regional) - $3,800 Rebate</option>
                  <option value="None">None / Ineligible - $0 Rebate</option>
                </select>
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <label className="flex justify-between text-sm font-bold text-slate-900 mb-2">
                  <span>Your Quote to Customer ($)</span>
                  <span className="text-accent-600">${sellPrice.toLocaleString()}</span>
                </label>
                <input type="range" min={Math.ceil(netFloorPrice)} max={Math.floor(netFloorPrice + 3000)} step="50" value={sellPrice} onChange={(e) => setSellPrice(parseFloat(e.target.value))} className="w-full accent-accent-500" />
                <p className="text-slate-400 text-xs font-semibold mt-2">
                  *Markup is strictly capped at $3,000 above the floor price.
                </p>
                {rawOvers < 0 && (
                  <p className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4"/> You cannot sell below the Net Floor Price.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Cost-Plus Engine Tuning</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Lead Gen Marketing Fee ($) - <span className="text-blue-500">Your Base Profit</span></label>
                  <input type="number" value={marketingFee} onChange={(e) => setMarketingFee(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 text-sm outline-none bg-blue-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Base Install Fee ($)</label>
                  <input type="number" value={baseFee} onChange={(e) => setBaseFee(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-primary-500 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">PV Rate ($ / kW)</label>
                  <input type="number" value={pvRate} onChange={(e) => setPvRate(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-primary-500 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Battery Rate ($ / kWh)</label>
                  <input type="number" value={battRate} onChange={(e) => setBattRate(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-primary-500 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">STC Trade Value ($)</label>
                  <input type="number" value={stcValue} onChange={(e) => setStcValue(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-primary-500 text-sm outline-none" />
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Outputs */}
          <div className="space-y-6">
            
            {/* The Breakdown */}
            <div className="bg-primary-900 rounded-2xl shadow-lg border border-primary-800 p-6 text-white">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Financial Breakdown</h2>
              
              <div className="space-y-3 font-medium text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">Gross Baseline Cost</span>
                  <span>${grossPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span>PV STCs ({pvCertificates} certs)</span>
                  <span>-${pvStcDiscount.toLocaleString()}</span>
                </div>
                {batterySize > 0 && (
                  <>
                    <div className="flex justify-between text-green-400">
                      <span>Federal Batt Rebate ({battCertificates} certs)</span>
                      <span>-${federalBatteryDiscount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-green-400">
                      <span>WA {waRetailer} Rebate</span>
                      <span>-${stateBatteryRebate.toLocaleString()}</span>
                    </div>
                  </>
                )}
                <div className="border-t border-primary-700 pt-3 flex justify-between text-lg font-bold">
                  <span>Net Floor Price</span>
                  <span>${netFloorPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              </div>
            </div>

            {/* Payout Splits */}
            <div className="bg-white rounded-2xl shadow-md border-l-4 border-l-accent-500 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Users className="w-32 h-32" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-4 relative z-10">Revenue Splits (Bottom-Up Model)</h2>
              
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                  <span className="text-slate-600 font-bold">Consultant Base (10% of Net Floor)</span>
                  <span className="font-bold text-slate-900">${baseCommission.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                  <span className="text-blue-600 font-bold">Lead Gen Base (Marketing Fee)</span>
                  <span className="font-bold text-blue-700">${marketingFee.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 mt-2">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-2 mb-2">Overs Distribution (33/33/33)</div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Consultant (33.3%)</span>
                    <span className="font-bold text-green-600">+${consultantOvers.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-600 font-semibold">Lead Gen / You (33.3%)</span>
                    <span className="font-bold text-blue-600">+${leadGenOvers.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Installer Bonus (33.3%)</span>
                    <span className="font-bold text-purple-600">+${installerOvers.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-center">
                    <span className="block text-xs font-bold text-green-600 uppercase mb-1">Consultant Yield</span>
                    <span className="block text-xl font-black text-green-700">${totalConsultantPayout.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-center relative overflow-hidden">
                    <ArrowUpRight className="absolute -right-2 -top-2 w-12 h-12 text-blue-100" />
                    <span className="block text-xs font-bold text-blue-600 uppercase mb-1 relative z-10">Your Profit</span>
                    <span className="block text-xl font-black text-blue-700 relative z-10">${totalLeadGenPayout.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Installer Handover */}
            <div className="bg-slate-100 rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="w-5 h-5 text-slate-500" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Installer Job Sheet</h2>
              </div>
              
              <div className="space-y-3 font-medium text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>System Specs</span>
                  <span>{pvSize}kW PV + {batterySize}kWh Battery</span>
                </div>
                
                {/* Real-World Cash Flow Display */}
                <div className="flex justify-between text-slate-900 font-bold border-b border-slate-300 pb-2">
                  <span>Total System Price (Customer Cash)</span>
                  <span>${sellPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1">
                  <span>+ Gov Rebates Claimed by Installer</span>
                  <span>+${totalRebates.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600 border-b border-slate-300 pb-2">
                  <span>- Consultant Invoice</span>
                  <span className="text-red-500">-${totalConsultantPayout.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                
                <div className="flex justify-between text-base font-bold text-slate-800 mb-4 pt-1">
                  <span>Net Installer Revenue</span>
                  <span>${installerNetRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                
                {/* Back-end Invoicing Logic */}
                <div className="bg-blue-50/50 p-3 rounded border border-blue-200">
                  <div className="flex justify-between text-sm font-bold text-blue-900 mb-1">
                    <span>Owed to Lead Gen (You)</span>
                    <span>${totalLeadGenPayout.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  <p className="text-[10px] text-blue-600 uppercase tracking-wide">
                    $1,500 Base + ${leadGenOvers.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} Overs
                  </p>
                </div>

                {/* Hardware/Labor Rough Estimator */}
                <div className="bg-white p-3 rounded border border-slate-200 mt-2">
                  <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2">Estimated Installer Profit Margin</h4>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Net Installer Revenue</span>
                    <span>${installerNetRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between text-xs text-red-500 mb-1">
                    <span>- Est. Wholesale Hardware Cost</span>
                    <span>-${estHardwareCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-red-500 mb-2">
                    <span>- Est. Labor & Overheads</span>
                    <span>-${estLaborCost.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-bold text-green-600">
                    <span>Est. Installer Take-Home Profit</span>
                    <span>${estInstallerProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                </div>

              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
