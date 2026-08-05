"use client";

import { useState, useEffect, useRef } from "react";
import { Calculator, DollarSign, ShieldCheck, Wrench, Settings, Users, ArrowUpRight, CreditCard, PlusCircle, Package, Download, Mail } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { QuoteData } from "@/lib/types";
import { CustomerQuoteTemplate, InstallerWorkOrderTemplate } from "@/components/QuotePDFTemplates";

export default function PricingCalculator() {
  // System Specs
  const [pvSize, setPvSize] = useState<number>(6.6);
  const [batterySize, setBatterySize] = useState<number>(10);
  const [hardwareTier, setHardwareTier] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"Admin" | "Consultant">("Admin");
  
  // Base Engine Constants (Locked)
  const baseFee = 1800; // Increased to provide larger BOS/Safety buffer for installers
  const marketingFee = 1500;

  // Hardware Tier Tuning
  const [t1PvRate, setT1PvRate] = useState<number>(700);
  const [t1BattRate, setT1BattRate] = useState<number>(600);
  
  const [t2PvRate, setT2PvRate] = useState<number>(850);
  const [t2BattRate, setT2BattRate] = useState<number>(750);
  
  const [t3PvRate, setT3PvRate] = useState<number>(1200);
  const [t3BattRate, setT3BattRate] = useState<number>(1100);

  // Rebate Tuning
  const [stcValue, setStcValue] = useState<number>(39);
  const [waRetailer, setWaRetailer] = useState<string>("Synergy");
  
  // Automated Finance Matrix State
  const [financeVendor, setFinanceVendor] = useState<string>("Cash");
  const [loanType, setLoanType] = useState<string>("");
  const [loanTerm, setLoanTerm] = useState<number>(0);
  
  // Extras & Upgrades
  const [isDoubleStory, setIsDoubleStory] = useState<boolean>(false);
  const [isTerracotta, setIsTerracotta] = useState<boolean>(false);
  const [isSbUpgrade1Ph, setIsSbUpgrade1Ph] = useState<boolean>(false);
  const [isSbUpgrade3Ph, setIsSbUpgrade3Ph] = useState<boolean>(false);
  const [isSmartMeter, setIsSmartMeter] = useState<boolean>(false);
  const [isTiltFrames, setIsTiltFrames] = useState<boolean>(false);

  // Consultant Sell Price (Starts at 0 so it auto-snaps to the floor on load)
  const [sellPrice, setSellPrice] = useState<number>(0);

  // --- LOGIC ENGINE ---

  // 1. Hardware Tier Resolution
  let activePvRate = t1PvRate;
  let activeBattRate = t1BattRate;
  let activeTierName = "Tier 1: Value (Jinko/GoodWe/SolaX/AlphaESS)";
  
  if (hardwareTier === 2) {
    activePvRate = t2PvRate;
    activeBattRate = t2BattRate;
    activeTierName = "Tier 2: Advanced (QCells/Sungrow/Huawei/Fronius)";
  } else if (hardwareTier === 3) {
    activePvRate = t3PvRate;
    activeBattRate = t3BattRate;
    activeTierName = "Tier 3: Premium (Maxeon/Enphase/Tesla/SigenStor)";
  }

  // 2. Rebates 
  const pvCertificates = Math.floor(pvSize * 1.382 * 5);
  const pvStcDiscount = pvCertificates * stcValue;
  
  let stateBatteryRebate = 0;
  if (batterySize > 0) {
    if (waRetailer === "Synergy") stateBatteryRebate = 1300;
    if (waRetailer === "Horizon") stateBatteryRebate = 3800;
  }
  
  const totalRebates = pvStcDiscount + stateBatteryRebate;

  // 3. Extras Calculation
  let totalExtrasCost = 0;
  const activeExtras: string[] = [];
  
  if (isDoubleStory) { totalExtrasCost += 400; activeExtras.push("Double Story"); }
  if (isTerracotta) { totalExtrasCost += 300; activeExtras.push("Terracotta/Steep"); }
  if (isSbUpgrade1Ph) { totalExtrasCost += 900; activeExtras.push("Switchboard (1-Phase)"); }
  if (isSbUpgrade3Ph) { totalExtrasCost += 1200; activeExtras.push("Switchboard (3-Phase)"); }
  if (isSmartMeter) { totalExtrasCost += 350; activeExtras.push("Smart Meter"); }
  if (isTiltFrames) { 
    const tiltCost = Math.floor(pvSize * 60);
    totalExtrasCost += tiltCost; 
    activeExtras.push(`Tilt Frames ($${tiltCost})`); 
  }

  // 4. Automated Finance Matrix Resolution (High-Precision)
  let vendorFeePct = 0;
  
  if (financeVendor === "Plenti") {
    if (loanType === "Standard Green Loan") vendorFeePct = 0.015;
    else if (loanType === "0% Interest") {
      if (loanTerm === 12) vendorFeePct = 0.05;
      else if (loanTerm === 24) vendorFeePct = 0.09;
      else if (loanTerm === 36) vendorFeePct = 0.12;
      else if (loanTerm === 48) vendorFeePct = 0.15;
      else if (loanTerm === 60) vendorFeePct = 0.18;
      else if (loanTerm === 72) vendorFeePct = 0.21;
      else if (loanTerm === 84) vendorFeePct = 0.24;
      else if (loanTerm === 120) vendorFeePct = 0.32;
    }
  } else if (financeVendor === "Brighte") {
    if (loanType === "Standard Green Loan") vendorFeePct = 0.015;
    else if (loanType === "0% Interest") {
      if (loanTerm === 12) vendorFeePct = 0.055;
      else if (loanTerm === 24) vendorFeePct = 0.095;
      else if (loanTerm === 36) vendorFeePct = 0.125;
      else if (loanTerm === 48) vendorFeePct = 0.155;
      else if (loanTerm === 60) vendorFeePct = 0.185;
      else if (loanTerm === 72) vendorFeePct = 0.215;
      else if (loanTerm === 84) vendorFeePct = 0.245;
      else if (loanTerm === 120) vendorFeePct = 0.335;
    }
  } else if (financeVendor === "Humm") {
    if (loanType === "Standard Interest") vendorFeePct = 0.02;
    else if (loanType === "0% Interest") {
      if (loanTerm === 12) vendorFeePct = 0.06;
      else if (loanTerm === 24) vendorFeePct = 0.10;
      else if (loanTerm === 36) vendorFeePct = 0.135;
      else if (loanTerm === 48) vendorFeePct = 0.165;
      else if (loanTerm === 60) vendorFeePct = 0.195;
      else if (loanTerm === 72) vendorFeePct = 0.225;
      else if (loanTerm === 84) vendorFeePct = 0.255;
      else if (loanTerm === 120) vendorFeePct = 0.355;
    }
  } else if (financeVendor === "Zip") {
    if (loanType === "Standard Interest") vendorFeePct = 0.035;
    else if (loanType === "0% Interest") {
      if (loanTerm === 12) vendorFeePct = 0.05;
      else if (loanTerm === 24) vendorFeePct = 0.085;
      else if (loanTerm === 36) vendorFeePct = 0.115;
      else if (loanTerm === 48) vendorFeePct = 0.145;
      else if (loanTerm === 60) vendorFeePct = 0.175;
      else if (loanTerm === 72) vendorFeePct = 0.205;
      else if (loanTerm === 84) vendorFeePct = 0.235;
      else if (loanTerm === 120) vendorFeePct = 0.325;
    }
  }

  // 5. Infinite Series Cost-Plus Calculation
  const installerRequiredGross = baseFee + (pvSize * activePvRate) + (batterySize * activeBattRate) + totalExtrasCost;
  
  // The absolute minimum money required to pay for Hardware, Install, and Lead Gen
  const totalBaseCost = installerRequiredGross + marketingFee;
  
  // Gross up by 10% to generate the Consultant's Base Commission. 
  // This is the TRUE GROSS floor of the system before any government subsidies.
  const trueGrossCashFloor = totalBaseCost / 0.90;
  const baseCommission = trueGrossCashFloor * 0.10; // Consultant gets 10% of True Gross

  // The Customer's Cash Floor is the True Gross minus whatever the government pays for.
  const cashFloorPrice = Math.max(0, trueGrossCashFloor - totalRebates);

  // Net Floor Price (Grossed up infinitely to perfectly absorb the Finance Vendor Fee)
  const netFloorPrice = cashFloorPrice > 0 ? (cashFloorPrice / (1 - vendorFeePct)) : 0;

  // The actual dollar amount the Finance Company will deduct from the final financed quote
  const actualVendorFeeAmount = sellPrice * vendorFeePct;
  const cashReceivedFromFinance = sellPrice - actualVendorFeeAmount;

  // 6. COMMISSION SPLIT LOGIC
  const rawOvers = cashReceivedFromFinance - cashFloorPrice;
  const cappedOvers = Math.max(0, Math.min(3000, rawOvers)); 
  
  const consultantOvers = cappedOvers / 3;
  const leadGenOvers = cappedOvers / 3;
  const installerOvers = cappedOvers / 3;

  const totalConsultantPayout = baseCommission + consultantOvers;
  const totalLeadGenPayout = marketingFee + leadGenOvers;

  // 7. Installer Real-World Cash Flow Math
  const installerGrossCashIn = cashReceivedFromFinance + totalRebates;
  const installerNetRevenue = installerGrossCashIn - totalConsultantPayout - totalLeadGenPayout;

  // Hardware/Labor Estimator Logic
  const estHardwareCost = (pvSize * (activePvRate * 0.4)) + (batterySize * (activeBattRate * 0.8)) + 1200;
  const estLaborCost = 1500 + (pvSize * 50) + (batterySize > 0 ? 500 : 0);
  const estInstallerProfit = Math.max(0, installerNetRevenue - estHardwareCost - estLaborCost - totalExtrasCost);

  // Handlers
  const handleVendorChange = (vendor: string) => {
    setFinanceVendor(vendor);
    if (vendor === "Cash") {
      setLoanType("");
      setLoanTerm(0);
    } else {
      setLoanType("0% Interest");
      setLoanTerm(36);
    }
  };

  const handleLoanTypeChange = (type: string) => {
    setLoanType(type);
    if (type === "0% Interest") setLoanTerm(36);
    else setLoanTerm(60);
  };

  // Sync initial sell price & dynamically shift it when floor changes
  const prevFloorRef = useRef(netFloorPrice);
  
  useEffect(() => {
    // If the floor price changes (e.g. changing tiers or adding extras), shift the sell price by the same amount
    // to perfectly preserve the consultant's margin/overs.
    const delta = netFloorPrice - prevFloorRef.current;
    if (Math.abs(delta) > 0.1 && prevFloorRef.current > 0) {
      setSellPrice(prev => prev + delta);
    } else if (sellPrice < Math.floor(netFloorPrice) && netFloorPrice > 0) {
      setSellPrice(Math.ceil(netFloorPrice));
    }
    prevFloorRef.current = netFloorPrice;
  }, [netFloorPrice, sellPrice]);

  const quoteData: QuoteData = {
    pvSize, batterySize, hardwareTier, activeTierName, totalExtrasCost, activeExtras,
    totalRebates, pvCertificates, pvStcDiscount, waRetailer, stateBatteryRebate,
    financeVendor, vendorFeePct, actualVendorFeeAmount, sellPrice,
    estHardwareCost, estLaborCost, totalConsultantPayout, totalLeadGenPayout,
    installerNetRevenue, estInstallerProfit
  };

  const exportPDF = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(filename);
    } catch (err) {
      console.error("Failed to generate PDF", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg">
              <Calculator className="text-accent-500 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-primary-900 tracking-tight">Cost-Plus Pricing Engine</h1>
              <p className="text-sm font-medium text-slate-500">Live 2026 WA State & Federal Math Model</p>
            </div>
          </div>
          
          <div className="flex items-center bg-white rounded-lg shadow-sm border border-slate-200 p-1">
            <button onClick={() => setViewMode("Admin")} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${viewMode === "Admin" ? "bg-slate-800 text-white shadow" : "text-slate-500 hover:bg-slate-50"}`}>Admin (Lead Gen) View</button>
            <button onClick={() => setViewMode("Consultant")} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${viewMode === "Consultant" ? "bg-primary-600 text-white shadow" : "text-slate-500 hover:bg-slate-50"}`}>Consultant View</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT: Inputs */}
          <div className="space-y-6">
            
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-6">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">System Specs</h2>
              
              <div>
                <label className="flex justify-between text-sm font-bold text-slate-900 mb-2">
                  <span>Hardware Package Tier</span>
                </label>
                <select 
                  value={hardwareTier} 
                  onChange={(e) => setHardwareTier(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-primary-500 text-sm outline-none bg-slate-50 font-semibold"
                >
                  <option value={1}>Tier 1: Value (Jinko/GoodWe/SolaX/AlphaESS)</option>
                  <option value={2}>Tier 2: Advanced (QCells/Sungrow/Huawei/Fronius)</option>
                  <option value={3}>Tier 3: Premium (Maxeon/Enphase/Tesla/SigenStor)</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
                  <span>PV Array Size (kW)</span>
                  <div className="flex items-center">
                    <input 
                      type="number" 
                      value={pvSize} 
                      onChange={(e) => setPvSize(parseFloat(e.target.value) || 0)} 
                      className="w-16 text-right bg-transparent text-primary-600 font-bold outline-none border-b border-primary-200 focus:border-primary-500 hide-arrows" 
                      step="0.1"
                    />
                    <span className="text-primary-600 ml-1">kW</span>
                  </div>
                </label>
                <input type="range" min="0" max="20" step="0.1" value={pvSize} onChange={(e) => setPvSize(parseFloat(e.target.value))} className="w-full accent-primary-600" />
              </div>

              <div>
                <label className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
                  <span>Battery Size (kWh)</span>
                  <div className="flex items-center">
                    <input 
                      type="number" 
                      value={batterySize} 
                      onChange={(e) => setBatterySize(parseFloat(e.target.value) || 0)} 
                      className="w-16 text-right bg-transparent text-primary-600 font-bold outline-none border-b border-primary-200 focus:border-primary-500 hide-arrows" 
                      step="0.1"
                    />
                    <span className="text-primary-600 ml-1">kWh</span>
                  </div>
                </label>
                <input type="range" min="0" max="30" step="0.5" value={batterySize} onChange={(e) => setBatterySize(parseFloat(e.target.value))} className="w-full accent-primary-600" />
              </div>

              <style jsx>{`
                .hide-arrows::-webkit-outer-spin-button,
                .hide-arrows::-webkit-inner-spin-button {
                  -webkit-appearance: none;
                  margin: 0;
                }
                .hide-arrows {
                  -moz-appearance: textfield;
                }
              `}</style>

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
                  <span>Customer Payment Method (Matrix)</span>
                </label>
                
                <div className="space-y-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Finance Vendor</label>
                    <select 
                      value={financeVendor} 
                      onChange={(e) => handleVendorChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-slate-200 focus:border-primary-500 text-sm outline-none bg-white"
                    >
                      <option value="Cash">Cash / EFT (0% Fee)</option>
                      <option value="Plenti">Plenti</option>
                      <option value="Brighte">Brighte</option>
                      <option value="Humm">Humm</option>
                      <option value="Zip">Zip Money</option>
                    </select>
                  </div>

                  {financeVendor !== "Cash" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Loan Type</label>
                        <select 
                          value={loanType} 
                          onChange={(e) => handleLoanTypeChange(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-slate-200 focus:border-primary-500 text-sm outline-none bg-white"
                        >
                          <option value="0% Interest">0% Interest</option>
                          {financeVendor !== "Humm" && <option value="Standard Green Loan">Standard Green Loan</option>}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Term Length</label>
                        <select 
                          value={loanTerm} 
                          onChange={(e) => setLoanTerm(parseInt(e.target.value))}
                          className="w-full px-3 py-2 rounded-md border border-slate-200 focus:border-primary-500 text-sm outline-none bg-white"
                        >
                          {loanType === "0% Interest" ? (
                            <>
                              <option value="12">12 Months</option>
                              <option value="24">24 Months</option>
                              <option value="36">36 Months</option>
                              <option value="48">48 Months</option>
                              <option value="60">60 Months</option>
                              <option value="72">72 Months</option>
                              <option value="84">84 Months (7 Years)</option>
                              <option value="120">120 Months (10 Years)</option>
                            </>
                          ) : (
                            <>
                              <option value="36">36 Months (Standard)</option>
                              <option value="60">60 Months (Standard)</option>
                              <option value="84">84 Months (Standard)</option>
                              <option value="120">120 Months (Standard)</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                  )}
                  
                  {vendorFeePct > 0 && (
                    <div className="pt-2 border-t border-blue-200/50 mt-1">
                      <p className="text-blue-700 text-xs font-bold flex items-center justify-between">
                        <span>Matrix Rate Applied:</span>
                        <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full">{(vendorFeePct * 100).toFixed(1)}% Fee</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <label className="flex justify-between text-sm font-bold text-slate-900 mb-3">
                  <span>Site Extras & Upgrades</span>
                </label>
                <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isDoubleStory} onChange={(e) => setIsDoubleStory(e.target.checked)} className="w-4 h-4 text-primary-600 rounded" />
                    Double Story (+$400)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isTerracotta} onChange={(e) => setIsTerracotta(e.target.checked)} className="w-4 h-4 text-primary-600 rounded" />
                    Terracotta/Steep (+$300)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isSbUpgrade1Ph} onChange={(e) => { setIsSbUpgrade1Ph(e.target.checked); if(e.target.checked) setIsSbUpgrade3Ph(false); }} className="w-4 h-4 text-primary-600 rounded" />
                    1-Ph Switchboard (+$900)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isSbUpgrade3Ph} onChange={(e) => { setIsSbUpgrade3Ph(e.target.checked); if(e.target.checked) setIsSbUpgrade1Ph(false); }} className="w-4 h-4 text-primary-600 rounded" />
                    3-Ph Switchboard (+$1200)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isSmartMeter} onChange={(e) => setIsSmartMeter(e.target.checked)} className="w-4 h-4 text-primary-600 rounded" />
                    Smart Meter (+$350)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isTiltFrames} onChange={(e) => setIsTiltFrames(e.target.checked)} className="w-4 h-4 text-primary-600 rounded" />
                    Tilt Frames (+$60/kW)
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-2xl">
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
              
              <div className="grid grid-cols-2 gap-4">
                
                {/* 3-Tier Tuning */}
                <div className="col-span-2 border-slate-200 mt-1">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Hardware Multipliers (Wholesale Costing)</h3>
                </div>
                
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Tier 1 PV Rate ($/kW)</label>
                  <input type="number" value={t1PvRate} onChange={(e) => setT1PvRate(parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 rounded border border-slate-200 text-xs" />
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Tier 1 Batt Rate ($/kWh)</label>
                  <input type="number" value={t1BattRate} onChange={(e) => setT1BattRate(parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 rounded border border-slate-200 text-xs" />
                </div>
                
                <div className="bg-blue-50 p-2 rounded border border-blue-100">
                  <label className="block text-[10px] font-bold text-blue-700 mb-1">Tier 2 PV Rate ($/kW)</label>
                  <input type="number" value={t2PvRate} onChange={(e) => setT2PvRate(parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 rounded border border-slate-200 text-xs" />
                </div>
                <div className="bg-blue-50 p-2 rounded border border-blue-100">
                  <label className="block text-[10px] font-bold text-blue-700 mb-1">Tier 2 Batt Rate ($/kWh)</label>
                  <input type="number" value={t2BattRate} onChange={(e) => setT2BattRate(parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 rounded border border-slate-200 text-xs" />
                </div>

                <div className="bg-purple-50 p-2 rounded border border-purple-100">
                  <label className="block text-[10px] font-bold text-purple-700 mb-1">Tier 3 PV Rate ($/kW)</label>
                  <input type="number" value={t3PvRate} onChange={(e) => setT3PvRate(parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 rounded border border-slate-200 text-xs" />
                </div>
                <div className="bg-purple-50 p-2 rounded border border-purple-100">
                  <label className="block text-[10px] font-bold text-purple-700 mb-1">Tier 3 Batt Rate ($/kWh)</label>
                  <input type="number" value={t3BattRate} onChange={(e) => setT3BattRate(parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 rounded border border-slate-200 text-xs" />
                </div>

                <div className="col-span-2 border-t border-slate-200 pt-3 mt-1">
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
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Financial Breakdown (Final Quote)</h2>
              
              <div className="space-y-3 font-medium text-sm">
                <div className="flex justify-between text-blue-300 border-b border-primary-800 pb-2">
                  <span className="flex items-center gap-1"><Package className="w-4 h-4"/> Hardware Package</span>
                  <span className="text-right text-xs max-w-[200px]">{activeTierName}</span>
                </div>

                <div className="flex justify-between pt-1">
                  <span className="text-slate-300">Gross System Quote</span>
                  <span>${(sellPrice + totalRebates).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span>PV STCs ({pvCertificates} certs)</span>
                  <span>-${pvStcDiscount.toLocaleString()}</span>
                </div>
                {batterySize > 0 && waRetailer !== "None" && (
                  <div className="flex justify-between text-green-400">
                    <span>WA {waRetailer} Rebate</span>
                    <span>-${stateBatteryRebate.toLocaleString()}</span>
                  </div>
                )}
                {totalExtrasCost > 0 && (
                  <div className="flex justify-between text-blue-300 border-t border-primary-800 pt-2">
                    <span className="flex items-center gap-1"><PlusCircle className="w-4 h-4"/> Site Extras & Upgrades</span>
                    <span>+${totalExtrasCost.toLocaleString()}</span>
                  </div>
                )}
                {vendorFeePct > 0 && (
                  <div className="flex justify-between text-yellow-400 border-t border-primary-800 pt-2">
                    <span className="flex items-center gap-1"><CreditCard className="w-4 h-4"/> {financeVendor} Vendor Fee</span>
                    <span>Included in Quote</span>
                  </div>
                )}
                <div className="border-t border-primary-700 pt-3 flex justify-between text-lg font-bold text-accent-400">
                  <span>Final Customer Quote (Out of Pocket)</span>
                  <span>${sellPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="text-right text-xs text-slate-500 font-semibold mt-1">
                  (Absolute Minimum Floor: ${netFloorPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => exportPDF("customer-quote-pdf", `Sunny_State_Quote_${sellPrice}.pdf`)}
                  className="flex-1 bg-white hover:bg-slate-50 text-primary-900 border border-primary-200 font-bold py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" /> Export PDF
                </button>
                <button 
                  onClick={() => alert("Email integration coming in next phase")}
                  className="flex-1 bg-accent-500 hover:bg-accent-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-sm shadow-accent-500/30 flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" /> Email Quote
                </button>
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
                  <span className="text-slate-600 font-bold">Consultant Base (10% of Cash Floor)</span>
                  <span className="font-bold text-slate-900">${baseCommission.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                
                {viewMode === "Admin" && (
                  <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                    <span className="text-blue-600 font-bold">Lead Gen Base (Marketing Fee)</span>
                    <span className="font-bold text-blue-700">${marketingFee.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                )}
                
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 mt-2">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-2 mb-2">Overs Distribution</div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Consultant Bonus</span>
                    <span className="font-bold text-green-600">+${consultantOvers.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  {viewMode === "Admin" && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-blue-600 font-semibold">Lead Gen / You</span>
                        <span className="font-bold text-blue-600">+${leadGenOvers.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200 mt-2">
                        <span className="font-bold text-green-600">Est. Installer Take-Home Profit</span>
                        <span className="font-bold text-green-500">${estInstallerProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className={`grid ${viewMode === "Admin" ? "grid-cols-2" : "grid-cols-1"} gap-4 pt-2`}>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-center">
                    <span className="block text-xs font-bold text-green-600 uppercase mb-1">Consultant Yield</span>
                    <span className="block text-xl font-black text-green-700">${totalConsultantPayout.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  {viewMode === "Admin" && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-center relative overflow-hidden">
                      <ArrowUpRight className="absolute -right-2 -top-2 w-12 h-12 text-blue-100" />
                      <span className="block text-xs font-bold text-blue-600 uppercase mb-1 relative z-10">Your Profit</span>
                      <span className="block text-xl font-black text-blue-700 relative z-10">${totalLeadGenPayout.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Installer Handover */}
            {viewMode === "Admin" && (
              <div className="bg-slate-100 rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Wrench className="w-5 h-5 text-slate-500" />
                  <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Installer Job Sheet</h2>
                </div>
                
                <div className="space-y-3 font-medium text-sm">
                  
                  <div className="flex justify-between text-blue-800 bg-blue-100/50 p-2 rounded text-xs border border-blue-200">
                    <span className="font-bold">Approved Hardware</span>
                    <span className="text-right">{activeTierName}</span>
                  </div>

                  <div className="flex justify-between text-slate-600 mt-2">
                    <span>System Specs</span>
                    <span>{pvSize}kW PV + {batterySize}kWh Battery</span>
                  </div>
                  
                  {activeExtras.length > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span className="font-bold">Site Variables</span>
                      <span className="text-right">{activeExtras.join(", ")}</span>
                    </div>
                  )}
                  
                  {/* Real-World Cash Flow Display */}
                  <div className="flex justify-between text-slate-900 font-bold border-b border-slate-300 pb-2 mt-2">
                    <span>Customer Total Financed Amount</span>
                    <span>${sellPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>

                  {vendorFeePct > 0 && (
                    <div className="flex justify-between text-orange-600 font-bold pt-1">
                      <span>- {financeVendor} Vendor Fee ({(vendorFeePct * 100).toFixed(1)}%)</span>
                      <span>-${actualVendorFeeAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-slate-600 pt-1 border-b border-slate-300 pb-2">
                    <span>+ Gov Rebates Claimed by Installer</span>
                    <span>+${totalRebates.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-slate-800 font-bold pt-2 mb-2">
                    <span>Total Gross Cash Received</span>
                    <span>${installerGrossCashIn.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>

                  <div className="flex justify-between text-slate-600 pt-1">
                    <span>- Consultant Invoice</span>
                    <span className="text-red-500">-${totalConsultantPayout.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>

                  <div className="flex justify-between text-slate-600 border-b border-slate-300 pb-2">
                    <span>- Lead Gen Invoice (You)</span>
                    <span className="text-red-500">-${totalLeadGenPayout.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  
                  <div className="flex justify-between text-base font-bold text-slate-800 mb-4 pt-1">
                    <span>Net Installer Revenue</span>
                    <span>${installerNetRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  
                  {/* Back-end Invoicing Logic */}
                  <div className="bg-blue-50/50 p-3 rounded border border-blue-200">
                    <div className="flex justify-between text-sm font-bold text-blue-900 mb-1">
                      <span>Invoice to Send to Installer</span>
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
                      <span>- Est. Wholesale Hardware Cost (Tier {hardwareTier})</span>
                      <span>-${estHardwareCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-red-500 mb-1">
                      <span>- Est. Labor & Standard Overheads</span>
                      <span>-${estLaborCost.toLocaleString()}</span>
                    </div>
                    {totalExtrasCost > 0 && (
                      <div className="flex justify-between text-xs text-red-500 mb-2">
                        <span>- Site Extras (Hardware/Labor)</span>
                        <span>-${totalExtrasCost.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-bold text-green-600">
                      <span>Est. Installer Take-Home Profit</span>
                      <span>${estInstallerProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                  </div>

                </div>
                
                <div className="mt-4 text-[10px] text-slate-400 leading-tight italic px-2 text-center">
                  *Tender Conditions: The installer net revenue absorbs standard Customer Acquisition Costs (CAC), meaning the savings in marketing overhead translate directly to net profit for the installing company. All site extras and billables must be inclusive of this final quote so the customer cannot incur extras based on predatory behaviour. If unforeseen but proven extras occur on-site, a 3-way negotiation will be entered between the consultant, the marketing entity, and the installer to balance out the overhead and preserve profitability for all parties. If the required extras are so severe that they completely destroy margins and a compromise cannot be reached, only then must the customer bear the cost for a solution.
                </div>
                
                <button 
                  onClick={() => exportPDF("installer-job-sheet-pdf", `Installer_Tender_${installerNetRevenue}.pdf`)}
                  className="w-full mt-6 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" /> Export Work Order PDF
                </button>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Hidden Templates for PDF Export */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <CustomerQuoteTemplate data={quoteData} />
        <InstallerWorkOrderTemplate data={quoteData} />
      </div>

    </div>
  );
}
