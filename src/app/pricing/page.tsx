"use client";

import { useState } from "react";
import { Calculator, DollarSign, ShieldCheck, Wrench, Settings, Users, ArrowUpRight, CreditCard, PlusCircle, Package, Download, Mail, Activity, Check } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { CustomerQuoteTemplate, InstallerWorkOrderTemplate, CustomerTermsTemplate } from "@/components/QuotePDFTemplates";
import { usePricingEngine } from "@/hooks/usePricingEngine";

export default function PricingCalculator() {
  const {
    pvSize, setPvSize, batterySize, setBatterySize, hardwareTier, setHardwareTier,
    viewMode, setViewMode, t1PvRate, setT1PvRate, t1BattRate, setT1BattRate,
    t2PvRate, setT2PvRate, t2BattRate, setT2BattRate, t3PvRate, setT3PvRate,
    t3BattRate, setT3BattRate, stcValue, setStcValue, waRetailer, setWaRetailer,
    financeVendor, setFinanceVendor, loanType, setLoanType, loanTerm, setLoanTerm,
    isDoubleStory, setIsDoubleStory, isTerracotta, setIsTerracotta,
    isSbUpgrade1Ph, setIsSbUpgrade1Ph, isSbUpgrade3Ph, setIsSbUpgrade3Ph,
    isSmartMeter, setIsSmartMeter, isTiltFrames, setIsTiltFrames,
    customExtrasList, setCustomExtrasList, brandSpecific, setBrandSpecific,
    requestedBrand, setRequestedBrand,
    sellPrice, setSellPrice, showEmailModal, setShowEmailModal,
    emailTo, setEmailTo, isSending, setIsSending, emailSuccess, setEmailSuccess,
    handleVendorChange, handleLoanTypeChange,
    activeTierName, pvCertificates, pvStcDiscount, batteryCertificates, batteryStcDiscount,
    stateBatteryRebate, totalRebates, totalExtrasCost, activeExtras,
    vendorFeePct, customerInterestRate, estLaborCost, estHardwareCost,
    installerRequiredGross, totalBaseCost, trueGrossCashFloor, baseCommission,
    cashFloorPrice, netFloorPrice, actualVendorFeeAmount, cashReceivedFromFinance,
    monthlyRepayment, totalCustomerCost,
    rawOvers, cappedOvers, consultantOvers, leadGenOvers, installerOvers,
    totalConsultantPayout, totalLeadGenPayout, installerGrossCashIn,
    installerNetRevenue, estInstallerProfit, quoteData, marketingFee, baseFee
  } = usePricingEngine();

  const [newExtraName, setNewExtraName] = useState("");
  const [newExtraCost, setNewExtraCost] = useState("");

  const handleAddCustomExtra = () => {
    if (newExtraName.trim() && !isNaN(Number(newExtraCost)) && Number(newExtraCost) > 0) {
      setCustomExtrasList([...customExtrasList, { id: crypto.randomUUID(), name: newExtraName.trim(), cost: Number(newExtraCost) }]);
      setNewExtraName("");
      setNewExtraCost("");
    }
  };
  
  const handleRemoveCustomExtra = (id: string) => {
    setCustomExtrasList(customExtrasList.filter(e => e.id !== id));
  };

  const [tenderPublishSuccess, setTenderPublishSuccess] = useState(false);
  const [showFinalizationModal, setShowFinalizationModal] = useState(false);
  const [customerPII, setCustomerPII] = useState({
    name: "Verified WA Homeowner",
    phone: "0400 000 000",
    email: "homeowner@sunnystate.com.au",
    address: "Perth Metropolitan Area, WA"
  });
  const [isPublishingTender, setIsPublishingTender] = useState(false);

  const handlePublishToTender = async () => {
    setIsPublishingTender(true);
    try {
      const res = await fetch("/api/tender", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Idempotency-Key": `publish-${crypto.randomUUID()}`
        },
        body: JSON.stringify({
          suburb: "Perth Metro, WA",
          pvSize,
          hardwareTier,
          batterySize,
          installerNetRevenue,
          estHardwareCost,
          estLaborCost,
          activeExtras,
          roof: isTerracotta ? "Terracotta / Steep" : isDoubleStory ? "Colorbond / Double Story" : "Colorbond / Single Story",
          customerName: customerPII.name,
          customerPhone: customerPII.phone,
          customerEmail: customerPII.email,
          customerAddress: customerPII.address,
          leadGenCut: totalLeadGenPayout,
          consultantCut: totalConsultantPayout
        }),
      });
      if (res.ok) {
        setTenderPublishSuccess(true);
        setTimeout(() => setTenderPublishSuccess(false), 6000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPublishingTender(false);
    }
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

      // If exporting the customer quote, automatically append the Terms & Conditions as Page 2
      if (elementId === "customer-quote-pdf") {
        const termsElement = document.getElementById("customer-terms-pdf");
        if (termsElement) {
          const termsCanvas = await html2canvas(termsElement, { scale: 2 });
          const termsImgData = termsCanvas.toDataURL("image/png");
          const termsPdfHeight = (termsCanvas.height * pdfWidth) / termsCanvas.width;
          pdf.addPage();
          pdf.addImage(termsImgData, "PNG", 0, 0, pdfWidth, termsPdfHeight);
        }
      }
      
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
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-primary-500 text-sm outline-none bg-slate-50 font-semibold mb-3"
                >
                  <option value={1}>Tier 1: Value (Jinko/GoodWe/SolaX/AlphaESS)</option>
                  <option value={2}>Tier 2: Advanced (QCells/Sungrow/Huawei/Fronius)</option>
                  <option value={3}>Tier 3: Premium (Maxeon/Enphase/Tesla/SigenStor)</option>
                </select>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                    <input 
                      type="checkbox" 
                      checked={brandSpecific} 
                      onChange={(e) => setBrandSpecific(e.target.checked)} 
                      className="w-4 h-4 text-primary-600 rounded" 
                    />
                    Specific Brand Guarantee (+${hardwareTier === 3 ? 1000 : hardwareTier === 2 ? 650 : 400})
                  </label>
                  {brandSpecific && (
                    <div className="mt-3 pl-6">
                      <input 
                        type="text" 
                        placeholder="e.g., Fronius Inverter & Jinko Panels" 
                        value={requestedBrand} 
                        onChange={(e) => setRequestedBrand(e.target.value)} 
                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm outline-none focus:border-primary-500" 
                      />
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        Guaranteeing specific stock limits the installer's ability to use their standard volume procurement pipeline, incurring a procurement premium.
                      </p>
                    </div>
                  )}
                </div>
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
                <input type="range" min="0" max="45" step="0.5" value={batterySize} onChange={(e) => setBatterySize(parseFloat(e.target.value))} className="w-full accent-primary-600" />
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
                      <option value="CommBank">CommBank (3.99% Home Energy Loan)</option>
                      <option value="NAB_Westpac">NAB/Westpac (Green Mortgage Top-Up)</option>
                      <option value="Broker">External Broker (~7% Unsecured)</option>
                      <option value="Plenti">Plenti (0% Interest / Green Loan)</option>
                      <option value="Brighte">Brighte (0% Interest)</option>
                      <option value="Humm">Humm (Buy Now Pay Later)</option>
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
                          className="w-full px-3 py-2 rounded-md border border-slate-200 focus:border-primary-500 text-sm outline-none bg-white disabled:bg-slate-50 disabled:text-slate-500"
                          disabled={financeVendor === "CommBank" || financeVendor === "NAB_Westpac" || financeVendor === "Broker"}
                        >
                          {financeVendor === "CommBank" || financeVendor === "NAB_Westpac" || financeVendor === "Broker" ? (
                            <option value={loanType}>{loanType}</option>
                          ) : (
                            <>
                              <option value="0% Interest">0% Interest</option>
                              {financeVendor !== "Humm" && <option value="Standard Green Loan">Standard Green Loan</option>}
                            </>
                          )}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Term Length</label>
                        <select 
                          value={loanTerm} 
                          onChange={(e) => setLoanTerm(parseInt(e.target.value))}
                          className="w-full px-3 py-2 rounded-md border border-slate-200 focus:border-primary-500 text-sm outline-none bg-white"
                        >
                          {financeVendor === "CommBank" || financeVendor === "NAB_Westpac" || financeVendor === "Broker" ? (
                            <>
                              <option value="36">36 Months (3 Years)</option>
                              <option value="60">60 Months (5 Years)</option>
                              <option value="84">84 Months (7 Years)</option>
                              <option value="120">120 Months (10 Years)</option>
                            </>
                          ) : loanType === "0% Interest" ? (
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
                  {(financeVendor === "CommBank" || financeVendor === "NAB_Westpac" || financeVendor === "Broker") && (
                    <div className="pt-2 border-t border-green-200/50 mt-1">
                      <p className="text-green-700 text-xs font-bold">
                        Customer pays interest directly to bank. Vendor Fee: <span className="bg-green-600 text-white px-2 py-0.5 rounded-full">0%</span>
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
                
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Add Custom Extra</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Extra Name" 
                      value={newExtraName} 
                      onChange={(e) => setNewExtraName(e.target.value)} 
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-md text-sm outline-none focus:border-primary-500" 
                    />
                    <div className="relative w-24">
                      <span className="absolute left-3 top-2 text-slate-400 text-sm">$</span>
                      <input 
                        type="number" 
                        placeholder="Cost" 
                        value={newExtraCost} 
                        onChange={(e) => setNewExtraCost(e.target.value)} 
                        className="w-full pl-6 pr-2 py-2 border border-slate-200 rounded-md text-sm outline-none focus:border-primary-500 hide-arrows" 
                      />
                    </div>
                    <button 
                      onClick={handleAddCustomExtra}
                      disabled={!newExtraName.trim() || !newExtraCost || Number(newExtraCost) <= 0}
                      className="bg-primary-600 text-white px-3 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      <PlusCircle className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {customExtrasList.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {customExtrasList.map(extra => (
                        <div key={extra.id} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-md border border-slate-100 text-sm">
                          <span className="text-slate-700">{extra.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-slate-900">+${extra.cost}</span>
                            <button onClick={() => handleRemoveCustomExtra(extra.id)} className="text-red-400 hover:text-red-600">
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

            {/* Payout Distribution (Moved and Scaled Down) */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 mt-6">
              <h2 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-3">Payout Distribution</h2>
              <div className="space-y-2 text-xs font-medium text-slate-300">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span>Lead Gen Marketing Fee</span>
                  <span>${marketingFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span>Lead Gen Overs (50%)</span>
                  <span className="text-emerald-400">+${leadGenOvers.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span>Consultant Base (4.0%)</span>
                  <span>${baseCommission.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span>Consultant At-Risk Overs</span>
                  <span className="text-emerald-400">+${consultantOvers.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2 text-slate-400">
                  <span>Installer Base Buffer</span>
                  <span>${baseFee.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2 text-slate-400">
                  <span>Installer Overs (20%)</span>
                  <span className="text-emerald-400">+${installerOvers.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                {viewMode === "Admin" && (
                  <div className="pt-2 space-y-2 mt-2">
                    <div className="flex justify-between text-white font-bold bg-blue-900/40 p-2 rounded border border-blue-800">
                      <span>Total Lead Gen Profit</span>
                      <span className="text-blue-400">${totalLeadGenPayout.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold bg-green-900/30 p-2 rounded border border-green-800">
                      <span>Total Consultant Yield</span>
                      <span className="text-green-400">${totalConsultantPayout.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold bg-purple-900/30 p-2 rounded border border-purple-800">
                      <span>Est. Installer Take-Home</span>
                      <span className="text-purple-400">${estInstallerProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT: Outputs */}
          <div className="space-y-6">
            

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
                <div className="flex justify-between items-center text-sm font-semibold text-green-600 pt-2">
                  <span>PV STCs ({pvCertificates} certs)</span>
                  <span>-${pvStcDiscount.toLocaleString()}</span>
                </div>
                {batterySize > 0 && (
                  <div className="flex justify-between items-center text-sm font-semibold text-green-600 pt-1">
                    <span>Battery STCs ({batteryCertificates} certs)</span>
                    <span>-${batteryStcDiscount.toLocaleString()}</span>
                  </div>
                )}
                {batterySize > 0 && waRetailer !== "None" && (
                  <div className="flex justify-between items-center text-sm font-semibold text-green-600 pt-1">
                    <span>WA {waRetailer} Rebate</span>
                    <span>-${stateBatteryRebate.toLocaleString()}</span>
                  </div>
                )}
                
                {/* Consultant Insurance Warning */}
                {viewMode === "Consultant" && sellPrice > cashFloorPrice && (
                  <div className="mt-6 bg-slate-800 border border-slate-600 rounded-lg p-4 text-xs text-slate-300 leading-relaxed">
                    <strong className="text-amber-400 block mb-1">⚠️ Overs Insurance & Penalty Policy</strong>
                    Because unseen site extras can occur, the Total Overs Pool acts as a shared insurance buffer. 
                    If unforeseen extras are found by the installer:
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                      <li>The extra cost is deducted from the Gross Overs Pool first.</li>
                      <li>If Overs run out, the shortfall is deducted from your Base Commission (you are guaranteed a minimum $150 take-home).</li>
                      <li>If the remaining shortfall exceeds $1,000, the sale is voided and must be requoted.</li>
                    </ul>
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
                  <span>Final Customer Quote (Principal)</span>
                  <span>${sellPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                {financeVendor !== "Cash" && loanTerm > 0 && (
                  <div className="mt-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                      <span>Interest Rate (Est.)</span>
                      <span>{customerInterestRate > 0 ? (customerInterestRate * 100).toFixed(2) + "% p.a." : "0% Interest"} over {loanTerm} months</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-white mb-2">
                      <span>Estimated Monthly Repayment</span>
                      <span className="text-emerald-400">${monthlyRepayment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} /mo</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-700 pt-2 mt-2">
                      <span>Total Repayable (Gross Cost)</span>
                      <span>${totalCustomerCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                  </div>
                )}
                <div className="text-right text-xs text-slate-500 font-semibold mt-3">
                  (Absolute Minimum Floor: ${netFloorPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-6 flex flex-col gap-3">
                <div className="flex gap-3">
                  <button 
                    onClick={() => exportPDF("customer-quote-pdf", `Sunny_State_Quote_${sellPrice}.pdf`)}
                    className="flex-1 bg-white hover:bg-slate-50 text-primary-900 border border-primary-200 font-bold py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" /> Export Quote PDF
                  </button>
                  <button 
                    onClick={() => setShowEmailModal(true)}
                    className="flex-1 bg-accent-500 hover:bg-accent-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-sm shadow-accent-500/30 flex items-center justify-center gap-2 text-sm"
                  >
                    <Mail className="w-4 h-4" /> Email Quote
                  </button>
                </div>

                <button
                  disabled={isPublishingTender}
                  onClick={() => setShowFinalizationModal(true)}
                  className={`w-full py-3 px-4 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 text-sm ${
                    tenderPublishSuccess
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-900 hover:bg-slate-850 text-emerald-400 border border-emerald-500/40 hover:border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  }`}
                >
                  {tenderPublishSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-white" /> Broadcasted to SunnyEX Tender Order Book!
                    </>
                  ) : (
                    <>
                      <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                      {isPublishingTender ? "Broadcasting to Marketplace..." : "Publish to SunnyEX Tender Order Book"}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Installer Handover */}
            {viewMode === "Admin" && (
              <div className="bg-slate-100 rounded-2xl border border-slate-200 p-6 mt-6">
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

                  <div className="flex justify-between text-slate-600 pt-1">
                    <span>- Lead Gen Invoice (You)</span>
                    <span className="text-red-500">-${totalLeadGenPayout.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  
                  <div className="flex justify-between text-slate-600 pt-1 border-b border-slate-300 pb-2">
                    <span>- Warranty Escrow Trust</span>
                    <span className="text-red-500">-$150.00</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-800 mb-4 pt-1">
                    <span>Net Installer Revenue</span>
                    <span>${installerNetRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  
                  {/* Back-end Invoicing Logic */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex justify-between items-center text-blue-900 font-bold text-[13px] mb-1">
                      <span>Total Brokerage Invoice (Installer Owes Us)</span>
                      <span>${(totalLeadGenPayout + totalConsultantPayout + 150).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wide">
                      INCLUDES: LEAD GEN (${totalLeadGenPayout.toLocaleString()}) + CONSULTANT (${totalConsultantPayout.toLocaleString()}) + WARRANTY ESCROW ($150)
                    </div>
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
                
                <div className="flex flex-col gap-2 mt-6">
                  <button 
                    onClick={() => exportPDF("installer-job-sheet-pdf", `Installer_Tender_${installerNetRevenue}.pdf`)}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" /> Export Work Order PDF
                  </button>
                  <button
                    disabled={isPublishingTender}
                    onClick={() => setShowFinalizationModal(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
                  >
                    <Activity className="w-4 h-4" />
                    {tenderPublishSuccess ? "Broadcasted Live to SunnyEX!" : "Publish to SunnyEX Live Order Book"}
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Hidden Templates for PDF Export */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <CustomerQuoteTemplate data={quoteData} />
        <InstallerWorkOrderTemplate data={quoteData} />
        <CustomerTermsTemplate />
      </div>

      {/* Email Quote Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Email Customer Quote</h3>
            <p className="text-sm text-slate-500 mb-6">Send the sanitized, branded quote directly to the homeowner.</p>
            
            {emailSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <p className="font-bold text-slate-800">Email Sent Successfully!</p>
                <p className="text-xs text-slate-500 mt-2">The customer should receive it shortly. Check the server logs for the Ethereal testing link.</p>
                <button onClick={() => {setShowEmailModal(false); setEmailSuccess(false);}} className="mt-6 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all">Close</button>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsSending(true);
                try {
                  const res = await fetch('/api/quote/email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ emailTo, quoteData })
                  });
                  if (!res.ok) throw new Error("Failed");
                  setEmailSuccess(true);
                } catch (err) {
                  alert("Failed to send email");
                } finally {
                  setIsSending(false);
                }
              }}>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Customer Email</label>
                <input 
                  type="email" 
                  required 
                  value={emailTo} 
                  onChange={e => setEmailTo(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 outline-none mb-6"
                  placeholder="homeowner@example.com"
                />
                
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowEmailModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all">Cancel</button>
                  <button type="submit" disabled={isSending} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
                    {isSending ? "Sending..." : "Send Quote"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* FINALIZATION MODAL */}
      {showFinalizationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-900 p-5 text-white border-b border-slate-700">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" /> Secure Customer PII Intake
              </h3>
              <p className="text-slate-400 text-xs mt-1">This data will be redacted on the SunnyEX public board and only revealed to the specific installer who claims the contract under the MSA.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Customer Full Name</label>
                <input type="text" className="w-full p-2 border border-slate-300 rounded text-sm text-slate-800" value={customerPII.name} onChange={(e) => setCustomerPII({...customerPII, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Customer Phone Number</label>
                <input type="text" className="w-full p-2 border border-slate-300 rounded text-sm text-slate-800" value={customerPII.phone} onChange={(e) => setCustomerPII({...customerPII, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Customer Email</label>
                <input type="email" className="w-full p-2 border border-slate-300 rounded text-sm text-slate-800" value={customerPII.email} onChange={(e) => setCustomerPII({...customerPII, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Exact Street Address</label>
                <input type="text" className="w-full p-2 border border-slate-300 rounded text-sm text-slate-800" value={customerPII.address} onChange={(e) => setCustomerPII({...customerPII, address: e.target.value})} />
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex gap-3 justify-end border-t border-slate-200">
              <button onClick={() => setShowFinalizationModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800">Cancel</button>
              <button onClick={() => { setShowFinalizationModal(false); handlePublishToTender(); }} disabled={isPublishingTender} className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded shadow hover:bg-blue-700">Confirm & Publish to SunnyEX</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
