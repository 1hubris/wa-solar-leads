import { useState, useEffect, useRef } from "react";
import { QuoteData } from "@/lib/types";

export function usePricingEngine() {
  // System Specs
  const [pvSize, setPvSize] = useState<number>(6.6);
  const [batterySize, setBatterySize] = useState<number>(10);
  const [hardwareTier, setHardwareTier] = useState<number>(1);
  const [brandSpecific, setBrandSpecific] = useState<boolean>(false);
  const [requestedBrand, setRequestedBrand] = useState<string>("");
  const [viewMode, setViewMode] = useState<"Admin" | "Consultant">("Admin");
  
  // The fixed acquisition/marketing fee paid to the Lead Gen entity
  // Massively increased to absorb the margin stripped from the capacity-filler installers
  const marketingFee = hardwareTier === 3 ? 5000 : hardwareTier === 2 ? 4200 : 3500;

  // 2. Base Costs & Installer Allowances
  const baseWarrantyPerKw = hardwareTier === 3 ? 200 : hardwareTier === 2 ? 160 : 130;
  const batteryWarrantyBuffer = batterySize > 0 ? 300 : 0;
  const originalBaseFee = Math.round((pvSize * baseWarrantyPerKw) + batteryWarrantyBuffer);

  // Wholesale Hardware Tuning (True Cost to Procure)
  const [t1PvRate, setT1PvRate] = useState<number>(320); // e.g. Jinko
  const [t1BattRate, setT1BattRate] = useState<number>(415); // e.g. AlphaESS
  
  const [t2PvRate, setT2PvRate] = useState<number>(450); // e.g. QCells/Sungrow
  const [t2BattRate, setT2BattRate] = useState<number>(500); 
  
  const [t3PvRate, setT3PvRate] = useState<number>(650); // e.g. Maxeon
  const [t3BattRate, setT3BattRate] = useState<number>(600); // e.g. Tesla/SigenStor

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
  const [customExtrasList, setCustomExtrasList] = useState<{id: string, name: string, cost: number}[]>([]);

  // Consultant Sell Price (Starts at 0 so it auto-snaps to the floor on load)
  const [sellPrice, setSellPrice] = useState<number>(0);

  // Email Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

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
  
  // New 2026 Battery STC Scheme
  // Clean Energy Regulator assigns STCs based on tested *usable* capacity, which fluctuates by brand.
  // We use a blended average of 5.2 STCs per kWh for rapid lead-gen estimation.
  const batteryCertificates = batterySize > 0 ? Math.floor(batterySize * 5.2) : 0;
  const batteryStcDiscount = batteryCertificates * stcValue;
  
  let stateBatteryRebate = 0;
  if (batterySize > 0) {
    if (waRetailer === "Synergy") stateBatteryRebate = 1300;
    if (waRetailer === "Horizon") stateBatteryRebate = 3800;
  }
  
  const totalRebates = pvStcDiscount + batteryStcDiscount + stateBatteryRebate;

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

  customExtrasList.forEach(extra => {
    totalExtrasCost += extra.cost;
    activeExtras.push(`${extra.name} ($${extra.cost})`);
  });

  if (brandSpecific) {
    const brandPremium = hardwareTier === 3 ? 1000 : hardwareTier === 2 ? 650 : 400;
    totalExtrasCost += brandPremium;
    const brandText = requestedBrand.trim() ? ` - ${requestedBrand}` : "";
    activeExtras.push(`Specific Brand Guarantee${brandText} ($${brandPremium})`);
  }

  // 4. Automated Finance Matrix Resolution (High-Precision)
  let vendorFeePct = 0;
  let customerInterestRate = 0;
  
  if (financeVendor === "CommBank") {
    customerInterestRate = 0.0399;
  } else if (financeVendor === "NAB_Westpac") {
    customerInterestRate = 0.0599;
  } else if (financeVendor === "Broker") {
    customerInterestRate = 0.0699;
  } else if (financeVendor === "Plenti") {
    if (loanType === "Standard Green Loan") { vendorFeePct = 0.015; customerInterestRate = 0.0999; }
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
    if (loanType === "Standard Green Loan") { vendorFeePct = 0.015; customerInterestRate = 0.0999; }
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
    if (loanType === "Standard Interest") { vendorFeePct = 0.02; customerInterestRate = 0.0999; }
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
    if (loanType === "Standard Interest") { vendorFeePct = 0.035; customerInterestRate = 0.0999; }
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
  
  // ORIGINAL PADDED COSTS (Used exclusively to keep the Customer Floor Price high)
  const paddedLabor = 1500 + (pvSize > 6.6 ? (pvSize - 6.6) * 120 : 0) + (batterySize > 0 ? 830 : 0);
  const paddedPvRate = hardwareTier === 3 ? 750 : hardwareTier === 2 ? 550 : 400;
  const paddedBattRate = hardwareTier === 3 ? 650 : hardwareTier === 2 ? 550 : 450;
  const paddedHardware = (pvSize * paddedPvRate) + (batterySize * paddedBattRate);
  
  // The absolute minimum money required to pay for the system under the OLD high margins
  const targetInstallerGross = originalBaseFee + paddedLabor + paddedHardware + totalExtrasCost;

  // EXPLICIT LEAN DISPLAY COSTS (What the Installer sees to make the deal attractive)
  const estLaborCost = 1250 + (pvSize > 6.6 ? (pvSize - 6.6) * 100 : 0) + (batterySize > 0 ? 650 : 0);
  const estHardwareCost = (pvSize * activePvRate) + (batterySize * activeBattRate);
  
  // The baseFee automatically expands to fill the gap, guaranteeing the Floor Price never drops
  // but transferring 100% of the cost savings directly into the installer's profit pool.
  const baseFee = targetInstallerGross - estLaborCost - estHardwareCost - totalExtrasCost;
  
  const installerRequiredGross = baseFee + estLaborCost + estHardwareCost + totalExtrasCost;
  
  const warrantyAssuranceFund = 150;
  
  // The absolute minimum money required to pay for Hardware, Install, Lead Gen, and Warranty Fund
  const totalBaseCost = installerRequiredGross + marketingFee + warrantyAssuranceFund;
  
  // Gross up by 4.0% to generate the Consultant's Base Commission. 
  // (Balanced at 4.0% to provide a solid floor while leaving a healthy overs pool)
  const trueGrossCashFloor = Math.ceil(totalBaseCost / (1 - 0.040));
  const baseCommission = Math.round(trueGrossCashFloor * 0.040); // Consultant gets 4.0% of True Gross

  // The Customer's Cash Floor is the True Gross minus whatever the government pays for.
  const cashFloorPrice = Math.max(0, trueGrossCashFloor - totalRebates);

  // Net Floor Price (Grossed up infinitely to perfectly absorb the Finance Vendor Fee)
  const netFloorPrice = cashFloorPrice > 0 ? Math.ceil(cashFloorPrice / (1 - vendorFeePct)) : 0;

  // The actual dollar amount the Finance Company will deduct from the final financed quote
  const actualVendorFeeAmount = sellPrice * vendorFeePct;
  const cashReceivedFromFinance = sellPrice - actualVendorFeeAmount;

  // Calculate Customer Repayments (Principal + Interest amortized)
  let monthlyRepayment = 0;
  let totalCustomerCost = sellPrice;
  if (financeVendor !== "Cash" && loanTerm > 0) {
    if (customerInterestRate > 0) {
      const r = customerInterestRate / 12;
      const n = loanTerm;
      monthlyRepayment = (sellPrice * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      totalCustomerCost = monthlyRepayment * n;
    } else {
      monthlyRepayment = sellPrice / loanTerm;
      totalCustomerCost = sellPrice;
    }
  }

  // 6. COMMISSION SPLIT LOGIC
  const rawOvers = Math.floor(cashReceivedFromFinance - cashFloorPrice); // Floor to prevent micro-cent B2B invoicing
  const cappedOvers = Math.max(0, Math.min(3000, rawOvers)); 
  
  // Final Locked Split: 50% Lead Gen, 30% Consultant, 20% Installer
  // Installers are capacity fillers, Lead Gen holds the true value.
  const consultantOvers = Math.round(cappedOvers * 0.30);
  const leadGenOvers = Math.round(cappedOvers * 0.50);
  const installerOvers = Math.round(cappedOvers * 0.20);

  const totalConsultantPayout = baseCommission + consultantOvers;
  const totalLeadGenPayout = marketingFee + leadGenOvers;

  // 7. Installer Real-World Cash Flow Math
  const installerGrossCashIn = Math.round(cashReceivedFromFinance + totalRebates);
  const installerNetRevenue = installerGrossCashIn - totalConsultantPayout - totalLeadGenPayout - warrantyAssuranceFund;
  const netProfit = installerNetRevenue - estLaborCost - estHardwareCost - totalExtrasCost;
  
  // Hardware/Labor Estimator Logic (Now perfectly aligns with the Cost-Plus formula)
  const estInstallerProfit = Math.max(0, installerNetRevenue - estHardwareCost - estLaborCost - totalExtrasCost);

  // Handlers
  const handleVendorChange = (vendor: string) => {
    setFinanceVendor(vendor);
    if (vendor === "Cash") {
      setLoanType("");
      setLoanTerm(0);
    } else if (vendor === "CommBank") {
      setLoanType("3.99% Home Energy Loan");
      setLoanTerm(60);
    } else if (vendor === "NAB_Westpac") {
      setLoanType("Green Mortgage Top-Up");
      setLoanTerm(60);
    } else if (vendor === "Broker") {
      setLoanType("Unsecured Personal Loan");
      setLoanTerm(84);
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
    totalRebates, pvCertificates, pvStcDiscount, 
    batteryCertificates, batteryStcDiscount, // Added Battery STCs
    waRetailer, stateBatteryRebate,
    financeVendor, vendorFeePct, actualVendorFeeAmount, sellPrice,
    estHardwareCost, estLaborCost, totalConsultantPayout, totalLeadGenPayout,
    installerNetRevenue, estInstallerProfit, warrantyAssuranceFund
  };
  return {
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
  };
}