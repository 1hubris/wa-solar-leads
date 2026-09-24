const fs = require('fs');

if (!fs.existsSync('src/hooks')) {
    fs.mkdirSync('src/hooks');
}

const lines = fs.readFileSync('src/app/pricing/page.tsx', 'utf8').split('\n');

// 1. Generate usePricingEngine.ts
const hookLines = [
  'import { useState, useEffect, useRef } from "react";',
  'import { QuoteData } from "@/lib/types";',
  '',
  'export function usePricingEngine() {',
  ...lines.slice(10, 286), // from line 11 (index 10) to line 286 (index 285)
  '  return {',
  '    pvSize, setPvSize, batterySize, setBatterySize, hardwareTier, setHardwareTier,',
  '    viewMode, setViewMode, t1PvRate, setT1PvRate, t1BattRate, setT1BattRate,',
  '    t2PvRate, setT2PvRate, t2BattRate, setT2BattRate, t3PvRate, setT3PvRate,',
  '    t3BattRate, setT3BattRate, stcValue, setStcValue, waRetailer, setWaRetailer,',
  '    financeVendor, setFinanceVendor, loanType, setLoanType, loanTerm, setLoanTerm,',
  '    isDoubleStory, setIsDoubleStory, isTerracotta, setIsTerracotta,',
  '    isSbUpgrade1Ph, setIsSbUpgrade1Ph, isSbUpgrade3Ph, setIsSbUpgrade3Ph,',
  '    isSmartMeter, setIsSmartMeter, isTiltFrames, setIsTiltFrames,',
  '    sellPrice, setSellPrice, showEmailModal, setShowEmailModal,',
  '    emailTo, setEmailTo, isSending, setIsSending, emailSuccess, setEmailSuccess,',
  '    handleVendorChange, handleLoanTypeChange,',
  '    activeTierName, pvCertificates, pvStcDiscount, batteryCertificates, batteryStcDiscount,',
  '    stateBatteryRebate, totalRebates, totalExtrasCost, activeExtras,',
  '    vendorFeePct, customerInterestRate, estLaborCost, estHardwareCost,',
  '    installerRequiredGross, totalBaseCost, trueGrossCashFloor, baseCommission,',
  '    cashFloorPrice, netFloorPrice, actualVendorFeeAmount, cashReceivedFromFinance,',
  '    rawOvers, cappedOvers, consultantOvers, leadGenOvers, installerOvers,',
  '    totalConsultantPayout, totalLeadGenPayout, installerGrossCashIn,',
  '    installerNetRevenue, estInstallerProfit, quoteData',
  '  };',
  '}'
];

fs.writeFileSync('src/hooks/usePricingEngine.ts', hookLines.join('\n'), 'utf8');

// 2. Refactor page.tsx
const topLines = [
  '"use client";',
  '',
  'import { Calculator, DollarSign, ShieldCheck, Wrench, Settings, Users, ArrowUpRight, CreditCard, PlusCircle, Package, Download, Mail } from "lucide-react";',
  'import html2canvas from "html2canvas";',
  'import jsPDF from "jspdf";',
  'import { CustomerQuoteTemplate, InstallerWorkOrderTemplate } from "@/components/QuotePDFTemplates";',
  'import { usePricingEngine } from "@/hooks/usePricingEngine";',
  '',
  'export default function PricingCalculator() {',
  '  const {',
  '    pvSize, setPvSize, batterySize, setBatterySize, hardwareTier, setHardwareTier,',
  '    viewMode, setViewMode, t1PvRate, setT1PvRate, t1BattRate, setT1BattRate,',
  '    t2PvRate, setT2PvRate, t2BattRate, setT2BattRate, t3PvRate, setT3PvRate,',
  '    t3BattRate, setT3BattRate, stcValue, setStcValue, waRetailer, setWaRetailer,',
  '    financeVendor, setFinanceVendor, loanType, setLoanType, loanTerm, setLoanTerm,',
  '    isDoubleStory, setIsDoubleStory, isTerracotta, setIsTerracotta,',
  '    isSbUpgrade1Ph, setIsSbUpgrade1Ph, isSbUpgrade3Ph, setIsSbUpgrade3Ph,',
  '    isSmartMeter, setIsSmartMeter, isTiltFrames, setIsTiltFrames,',
  '    sellPrice, setSellPrice, showEmailModal, setShowEmailModal,',
  '    emailTo, setEmailTo, isSending, setIsSending, emailSuccess, setEmailSuccess,',
  '    handleVendorChange, handleLoanTypeChange,',
  '    activeTierName, pvCertificates, pvStcDiscount, batteryCertificates, batteryStcDiscount,',
  '    stateBatteryRebate, totalRebates, totalExtrasCost, activeExtras,',
  '    vendorFeePct, customerInterestRate, estLaborCost, estHardwareCost,',
  '    installerRequiredGross, totalBaseCost, trueGrossCashFloor, baseCommission,',
  '    cashFloorPrice, netFloorPrice, actualVendorFeeAmount, cashReceivedFromFinance,',
  '    rawOvers, cappedOvers, consultantOvers, leadGenOvers, installerOvers,',
  '    totalConsultantPayout, totalLeadGenPayout, installerGrossCashIn,',
  '    installerNetRevenue, estInstallerProfit, quoteData',
  '  } = usePricingEngine();',
  ''
];
const bottomLines = lines.slice(287); // from exportPDF down to the end
fs.writeFileSync('src/app/pricing/page.tsx', topLines.concat(bottomLines).join('\n'), 'utf8');

console.log("Refactoring complete.");
