export type QuoteData = {
  pvSize: number;
  batterySize: number;
  hardwareTier: number;
  activeTierName: string;
  totalExtrasCost: number;
  activeExtras: string[];
  totalRebates: number;
  pvCertificates: number;
  pvStcDiscount: number;
  batteryCertificates: number;
  batteryStcDiscount: number;
  waRetailer: string;
  stateBatteryRebate: number;
  financeVendor: string;
  vendorFeePct: number;
  actualVendorFeeAmount: number;
  sellPrice: number;

  // Pylon-Calibrated Perth Yield & Synergy Bill-Crusher ROI Telemetry
  biMonthlyBill: number;
  annualBaselineBill: number;
  annualNewBill: number;
  annualSavingsYear1: number;
  monthlyBeforeBill: number;
  monthlyAfterBill: number;
  annualProductionKwh: number;
  summerDailyKwh: number;
  winterDailyKwh: number;
  selfConsumptionPct: number;
  selfPoweredPct: number;
  solarSharePct: number;
  batterySharePct: number;
  gridSharePct: number;
  discountedPaybackYears: number;
  irrPct: number;
  npv20Yr: number;
  netSavings20Yr: number;
  roiPct20Yr: number;

  // Back-end costs (Used only by Installer Template)
  estHardwareCost: number;
  estLaborCost: number;
  totalConsultantPayout: number;
  totalLeadGenPayout: number;
  installerNetRevenue: number;
  estInstallerProfit: number;
  warrantyAssuranceFund: number;
};
