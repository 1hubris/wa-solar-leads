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
  waRetailer: string;
  stateBatteryRebate: number;
  financeVendor: string;
  vendorFeePct: number;
  actualVendorFeeAmount: number;
  sellPrice: number;
  
  // Back-end costs (Used only by Installer Template)
  estHardwareCost: number;
  estLaborCost: number;
  totalConsultantPayout: number;
  totalLeadGenPayout: number;
  installerNetRevenue: number;
  estInstallerProfit: number;
};
