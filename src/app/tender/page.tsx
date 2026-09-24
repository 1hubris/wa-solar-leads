"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Clock,
  MapPin,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Activity,
  Cpu,
  Download,
  Phone,
  Mail,
  Home,
  FileText,
  Search,
  PlusCircle,
  Sparkles,
  Award,
  Layers,
  Check,
  RefreshCw,
  X,
  ExternalLink,
  DollarSign,
  Wrench,
  HelpCircle,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { InstallerWorkOrderTemplate } from "@/components/QuotePDFTemplates";
import { QuoteData } from "@/lib/types";

type TenderJob = {
  id: string;
  suburb: string;
  size: number;
  tier: number;
  tierName: string;
  battery: number;
  roof: string;
  extras: string[];
  payout: number;
  hardwareCost: number;
  laborCost: number;
  warrantyFund: number;
  leadGenCut: number;
  consultantCut: number;
  timeRemaining: string;
  isHot: boolean;
  status: "Available" | "Claimed" | "Audit Scheduled" | "Installation Complete" | "STCs Lodged";
  claimedBy?: string;
  claimedAt?: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  variations: {
    id: string;
    reason: string;
    amount: number;
    status: "Approved" | "Pending Review" | "Declined";
    createdAt: string;
  }[];
};

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState<"Live" | "Claimed">("Live");
  const [liveJobs, setLiveJobs] = useState<TenderJob[]>([]);
  const [claimedJobs, setClaimedJobs] = useState<TenderJob[]>([]);
  const [metrics, setMetrics] = useState({
    totalVolume: 13890,
    totalClaimedVolume: 3450,
    activeOrdersCount: 3,
    claimedOrdersCount: 1,
    warrantyReservePool: 600,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [tickerMessage, setTickerMessage] = useState<string>("Market Open • High Volume Trading Active");

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<number | "all">("all");
  const [batteryFilter, setBatteryFilter] = useState<"all" | "battery" | "solar">("all");
  const [sortBy, setSortBy] = useState<"payout" | "time" | "size">("payout");

  // Modal States
  const [selectedJobForClaim, setSelectedJobForClaim] = useState<TenderJob | null>(null);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccessJob, setClaimSuccessJob] = useState<TenderJob | null>(null);

  const [selectedJobForVariation, setSelectedJobForVariation] = useState<TenderJob | null>(null);
  const [variationReason, setVariationReason] = useState("Switchboard Asbestos Enclosure");
  const [variationAmount, setVariationAmount] = useState<number>(450);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showWarrantyPoolModal, setShowWarrantyPoolModal] = useState(false);
  const [selectedPDFJob, setSelectedPDFJob] = useState<TenderJob | null>(null);

  // Fetch live market data from API
  const fetchTenderData = async () => {
    try {
      const res = await fetch("/api/tender");
      const json = await res.json();
      if (json.success && json.data) {
        setLiveJobs(json.data.available || []);
        setClaimedJobs(json.data.claimed || []);
        if (json.data.metrics) setMetrics(json.data.metrics);
      }
    } catch (e) {
      console.error("Failed to load live tender feeds:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenderData();
    const interval = setInterval(fetchTenderData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Handle Contract Claiming
  const handleExecuteClaim = async () => {
    if (!selectedJobForClaim || !isTermsAccepted) return;
    setIsClaiming(true);
    try {
      const res = await fetch("/api/tender", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Idempotency-Key": `claim-${selectedJobForClaim.id}`
        },
        body: JSON.stringify({
          action: "claim",
          jobId: selectedJobForClaim.id,
          installerId: "Installer_094",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTickerMessage(`⚡ Contract ${selectedJobForClaim.id} claimed by Installer_094 (+$${selectedJobForClaim.payout.toLocaleString()})`);
        setClaimSuccessJob(data.data);
        fetchTenderData();
      } else {
        alert(data.error || "Claim failed.");
      }
    } catch (e) {
      alert("Network error processing tender claim.");
    } finally {
      setIsClaiming(false);
      setSelectedJobForClaim(null);
      setIsTermsAccepted(false);
    }
  };

  // Handle Status Update
  const handleUpdateStatus = async (jobId: string, status: TenderJob["status"]) => {
    try {
      const res = await fetch("/api/tender", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Idempotency-Key": `update-${jobId}-${status}`
        },
        body: JSON.stringify({ action: "update_status", jobId, status }),
      });
      if (res.ok) {
        fetchTenderData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Variation Submission
  const handleAddVariation = async () => {
    if (!selectedJobForVariation) return;
    try {
      const res = await fetch("/api/tender", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Idempotency-Key": `var-${selectedJobForVariation.id}-${variationAmount}`
        },
        body: JSON.stringify({
          action: "add_variation",
          jobId: selectedJobForVariation.id,
          reason: variationReason,
          amount: variationAmount,
        }),
      });
      if (res.ok) {
        fetchTenderData();
        setSelectedJobForVariation(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Simulate a live drop from a customer quote
  const handleSimulateDrop = async () => {
    const suburbs = ["Cottesloe, 6011", "Scarborough, 6019", "Midland, 6056", "Rockingham, 6168", "Ellenbrook, 6069", "South Perth, 6151"];
    const sizes = [6.6, 9.9, 13.2, 8.8];
    const tiers = [1, 2, 3];
    const battSizes = [0, 5, 10, 13.5];

    const randomSuburb = suburbs[Math.floor(Math.random() * suburbs.length)];
    const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
    const randomTier = tiers[Math.floor(Math.random() * tiers.length)];
    const randomBatt = battSizes[Math.floor(Math.random() * battSizes.length)];
    const payout = Math.round(2500 + randomSize * 250 + randomBatt * 200 + (randomTier === 3 ? 1500 : randomTier === 2 ? 800 : 0));

    try {
      const res = await fetch("/api/tender", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suburb: randomSuburb,
          pvSize: randomSize,
          hardwareTier: randomTier,
          batterySize: randomBatt,
          installerNetRevenue: payout,
          roof: "Colorbond Steel / Single Story",
          customerName: "New WA Homeowner (Signed)",
          customerAddress: `12 Sunshine Way, ${randomSuburb}`,
          customerPhone: "0488 123 456",
          customerEmail: "homeowner.wa@sunnyquote.com.au",
        }),
      });
      if (res.ok) {
        setTickerMessage(`🚨 NEW DROP: ${randomSize}kW in ${randomSuburb} just entered the order book (Payout: $${payout.toLocaleString()})`);
        fetchTenderData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // PDF Export for Work Order
  const handleExportWorkOrder = async (job: TenderJob) => {
    setSelectedPDFJob(job);
    setTimeout(async () => {
      const element = document.getElementById("tender-work-order-pdf");
      if (!element) return;
      try {
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`SunnyEX_Work_Order_${job.id}.pdf`);
      } catch (err) {
        console.error("PDF generation error:", err);
      }
    }, 150);
  };

  // Filter & Sort Logic
  const filteredJobs = liveJobs.filter((job) => {
    const matchesSearch =
      job.suburb.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.roof.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTier = tierFilter === "all" || job.tier === tierFilter;
    const matchesBattery =
      batteryFilter === "all" ||
      (batteryFilter === "battery" && job.battery > 0) ||
      (batteryFilter === "solar" && job.battery === 0);

    return matchesSearch && matchesTier && matchesBattery;
  });

  filteredJobs.sort((a, b) => {
    if (sortBy === "payout") return b.payout - a.payout;
    if (sortBy === "size") return b.size - a.size;
    return a.timeRemaining.localeCompare(b.timeRemaining);
  });

  // Prepare dummy QuoteData for Work Order PDF rendering
  const pdfQuoteData: QuoteData | null = selectedPDFJob
    ? {
        pvSize: selectedPDFJob.size,
        batterySize: selectedPDFJob.battery,
        hardwareTier: selectedPDFJob.tier,
        activeTierName: selectedPDFJob.tierName,
        totalExtrasCost: selectedPDFJob.extras.length * 350,
        activeExtras: selectedPDFJob.extras,
        totalRebates: Math.round(selectedPDFJob.size * 550 + selectedPDFJob.battery * 400),
        pvCertificates: Math.floor(selectedPDFJob.size * 1.382 * 5),
        pvStcDiscount: Math.floor(selectedPDFJob.size * 1.382 * 5) * 39,
        batteryCertificates: selectedPDFJob.battery * 5,
        batteryStcDiscount: selectedPDFJob.battery * 5 * 39,
        waRetailer: "Synergy",
        stateBatteryRebate: selectedPDFJob.battery > 0 ? 1300 : 0,
        financeVendor: "Cash",
        vendorFeePct: 0,
        actualVendorFeeAmount: 0,
        sellPrice: selectedPDFJob.payout + 3500,
        estHardwareCost: selectedPDFJob.hardwareCost,
        estLaborCost: selectedPDFJob.laborCost,
        totalConsultantPayout: 800,
        totalLeadGenPayout: 3500,
        installerNetRevenue: selectedPDFJob.payout,
        estInstallerProfit: Math.max(0, selectedPDFJob.payout - selectedPDFJob.hardwareCost - selectedPDFJob.laborCost),
        warrantyAssuranceFund: 150,
      }
    : null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Forex/Trading Style Top Nav */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = "/"}>
              <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <Activity className="w-5 h-5 text-slate-950 font-black" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl text-white tracking-tight leading-none">
                  SUNNY<span className="text-emerald-500">EX</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-0.5">
                  Tender Exchange
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800/60 rounded-full border border-slate-700 ml-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">WA Grid Live</span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-sm font-bold">
            {/* Warranty Pool Quick Stat */}
            <div
              onClick={() => setShowWarrantyPoolModal(true)}
              className="hidden lg:flex flex-col items-end cursor-pointer group bg-slate-800/40 hover:bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700/50 transition-all"
            >
              <div className="flex items-center gap-1.5 text-purple-400 text-[10px] uppercase tracking-widest font-mono">
                <ShieldCheck className="w-3.5 h-3.5" /> Warranty Pool
              </div>
              <span className="text-purple-300 font-mono text-sm">${metrics.warrantyReservePool.toLocaleString()}</span>
            </div>

            {/* Total Payout Volume */}
            <div className="flex flex-col items-end">
              <span className="text-slate-500 text-[10px] uppercase tracking-widest">Active Order Book</span>
              <span className="text-emerald-400 font-mono text-base sm:text-lg">${metrics.totalVolume.toLocaleString()}.00</span>
            </div>

            <div className="w-px h-8 bg-slate-800"></div>

            {/* Installer Profile Switcher / Badge */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg transition-all text-left"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-slate-200 text-xs leading-none">Installer_094</span>
                <span className="text-[10px] text-emerald-400 font-mono leading-none mt-1">CEC #A89124 • Active</span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-[1600px] mx-auto px-4 py-6 sm:py-8">
        {/* Ticker Tape Status with Live Actions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 overflow-hidden shadow-inner">
          <div className="flex items-center gap-3 overflow-hidden w-full">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-widest whitespace-nowrap shrink-0 pr-3 border-r border-slate-800">
              <TrendingUp className="w-4 h-4" />
              Live Order Feed
            </div>
            <div className="text-xs font-mono text-slate-300 truncate">
              {tickerMessage}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={handleSimulateDrop}
              className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Simulate Signed Quote
            </button>
            <button
              onClick={fetchTenderData}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-all"
              title="Refresh order book"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Action Bar & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("Live")}
              className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === "Live"
                  ? "bg-slate-800 text-white border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  : "bg-slate-900/60 text-slate-500 hover:text-slate-300 border border-slate-800"
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              Live Order Book
              <span className="ml-1.5 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs rounded-full font-mono">
                {liveJobs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("Claimed")}
              className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === "Claimed"
                  ? "bg-slate-800 text-white border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                  : "bg-slate-900/60 text-slate-500 hover:text-slate-300 border border-slate-800"
              }`}
            >
              <CheckCircle className="w-4 h-4 text-blue-400" />
              My Claimed Contracts
              <span className="ml-1.5 px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full font-mono">
                {claimedJobs.length}
              </span>
            </button>
          </div>

          {/* Quick Filters (Only shown on Live Order Book) */}
          {activeTab === "Live" && (
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-56">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Suburb / ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {/* Tier Filter */}
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Tiers</option>
                <option value="1">Tier 1: Value</option>
                <option value="2">Tier 2: Advanced</option>
                <option value="3">Tier 3: Premium</option>
              </select>

              {/* Battery Filter */}
              <select
                value={batteryFilter}
                onChange={(e) => setBatteryFilter(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Hardware</option>
                <option value="battery">With Battery</option>
                <option value="solar">Solar Only</option>
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="payout">Sort: Highest Payout</option>
                <option value="size">Sort: Largest PV Array</option>
                <option value="time">Sort: Expiring Soon</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Live Order Book */}
        {activeTab === "Live" && (
          <div className="bg-slate-900/70 rounded-xl border border-slate-800 p-4 sm:p-6 shadow-2xl backdrop-blur-sm">
            {/* Table Headers */}
            <div className="hidden lg:grid grid-cols-12 gap-4 pb-4 border-b border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <div className="col-span-2">Contract ID / Timer</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-3">System Specs</div>
              <div className="col-span-2">Site Conditions</div>
              <div className="col-span-1 text-right">Warranty Escrow</div>
              <div className="col-span-2 text-right">Net Payout & Action</div>
            </div>

            {/* Live Jobs Feed */}
            {isLoading ? (
              <div className="py-20 text-center text-slate-500 font-mono text-sm">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-emerald-500" />
                Connecting to SunnyEX order matching engine...
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <Clock className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                <p className="font-bold text-slate-400">No active contracts match your filter criteria.</p>
                <p className="text-xs text-slate-600 mt-1">Click "Simulate Signed Quote" above or reset filters.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mt-3">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className={`grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-slate-900 border transition-all hover:bg-slate-800/90 p-4 sm:p-5 rounded-xl group ${
                      job.isHot
                        ? "border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.08)] bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/20"
                        : "border-slate-800"
                    }`}
                  >
                    {/* ID & Time */}
                    <div className="lg:col-span-2 flex items-center lg:items-start justify-between lg:flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-white text-sm tracking-tight">{job.id}</span>
                        {job.isHot && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            HOT
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                        <span className="text-xs font-mono font-bold text-red-400">{job.timeRemaining}</span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="lg:col-span-2 flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-200 text-sm">{job.suburb}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">WA Metro Grid</span>
                    </div>

                    {/* Specs */}
                    <div className="lg:col-span-3 flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-400 text-sm">
                          {job.size}kW Solar {job.battery > 0 && `+ ${job.battery}kWh Battery`}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 mt-0.5 font-medium">
                        Tier {job.tier} ({job.tierName}) • CEC Inverter Included
                      </span>
                    </div>

                    {/* Conditions */}
                    <div className="lg:col-span-2 flex flex-col gap-1">
                      <span className="text-xs text-slate-300 font-medium">{job.roof}</span>
                      {job.extras.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {job.extras.map((ex, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-bold text-amber-400 uppercase bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded"
                            >
                              {ex}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-800/80 px-2 py-0.5 rounded w-fit">
                          Standard Install
                        </span>
                      )}
                    </div>

                    {/* Warranty Escrow */}
                    <div className="hidden lg:flex lg:col-span-1 flex-col items-end justify-center">
                      <span className="text-xs font-mono text-purple-400 font-bold">$150.00</span>
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest">Escrowed</span>
                    </div>

                    {/* Payout & Claim Action */}
                    <div className="lg:col-span-2 flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 border-slate-800 pt-3 lg:pt-0">
                      <div className="flex flex-col lg:items-end">
                        <span className="font-mono font-black text-xl text-emerald-400">
                          ${job.payout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                          $0 CAC • Net Payout
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedJobForClaim(job)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-wider text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        CLAIM <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Claimed Contracts */}
        {activeTab === "Claimed" && (
          <div className="space-y-6">
            {claimedJobs.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-16 text-center text-slate-500">
                <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-300">No Claimed Contracts Yet</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 mb-6">
                  Head over to the Live Order Book and click "Claim" on any active tender to secure the contract and unlock customer details.
                </p>
                <button
                  onClick={() => setActiveTab("Live")}
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-6 py-2.5 rounded-lg text-sm transition-all"
                >
                  View Available Orders
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {claimedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between"
                  >
                    {/* Top Status Header */}
                    <div>
                      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-white text-lg">{job.id}</span>
                            <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold px-2 py-0.5 rounded">
                              {job.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Claimed by Installer_094</p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-slate-500 uppercase tracking-widest block">Net Contract Value</span>
                          <span className="font-mono font-black text-2xl text-emerald-400">
                            ${job.payout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Unlocked Customer Card (Data Handover) */}
                      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 my-5">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            Homeowner Details (Unlocked)
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono">100% Liability Assigned</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-slate-500 block">Customer Name</span>
                            <span className="font-bold text-slate-200">{job.customer.name}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Installation Address</span>
                            <span className="font-bold text-slate-200 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {job.customer.address}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Direct Phone</span>
                            <a
                              href={`tel:${job.customer.phone}`}
                              className="font-bold text-blue-400 hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" /> {job.customer.phone}
                            </a>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Customer Email</span>
                            <a
                              href={`mailto:${job.customer.email}`}
                              className="font-bold text-blue-400 hover:underline flex items-center gap-1 truncate"
                            >
                              <Mail className="w-3 h-3" /> {job.customer.email}
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Brokerage Remittance (Financial Split) */}
                      <div className="bg-amber-950/20 border border-amber-900/50 rounded-xl p-4 my-5">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                            Brokerage Remittance Invoice
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono">Deducted from Total Finance</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-slate-500 block">Sunny State Quotes Fee</span>
                            <span className="font-bold text-slate-200">${(job.leadGenCut || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Consultant Commission</span>
                            <span className="font-bold text-slate-200">${(job.consultantCut || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Total Owed to Broker</span>
                            <span className="font-black text-amber-400 text-sm">${((job.leadGenCut || 0) + (job.consultantCut || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>

                      {/* System & Complexity Specs */}
                      <div className="grid grid-cols-2 gap-4 text-xs mb-5">
                        <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block mb-1">Hardware Scope</span>
                          <span className="font-bold text-slate-200 block">
                            {job.size}kW Solar Array {job.battery > 0 && `+ ${job.battery}kWh Battery`}
                          </span>
                          <span className="text-[10px] text-slate-400">Tier {job.tier} ({job.tierName})</span>
                        </div>
                        <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block mb-1">Site Complexities</span>
                          <span className="font-bold text-slate-200 block truncate">{job.roof}</span>
                          <span className="text-[10px] text-amber-400">
                            {job.extras.length > 0 ? job.extras.join(", ") : "Standard Install"}
                          </span>
                        </div>
                      </div>

                      {/* Variations List if any */}
                      {job.variations.length > 0 && (
                        <div className="mb-5 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-2">
                            Approved Site Variations (+${job.variations.reduce((a, v) => a + v.amount, 0)})
                          </span>
                          {job.variations.map((v) => (
                            <div key={v.id} className="flex justify-between text-xs text-amber-200 py-0.5">
                              <span>• {v.reason}</span>
                              <span className="font-mono font-bold">+${v.amount} (Offset)</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Progress Lifecycle Stepper */}
                      <div className="mb-6 pt-2 border-t border-slate-800">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
                          Installation Milestone Progress
                        </span>
                        <div className="grid grid-cols-4 gap-1">
                          {(["Claimed", "Audit Scheduled", "Installation Complete", "STCs Lodged"] as const).map((step, idx) => {
                            const stepsOrder = ["Claimed", "Audit Scheduled", "Installation Complete", "STCs Lodged"];
                            const currentIdx = stepsOrder.indexOf(job.status);
                            const isDone = idx <= currentIdx;
                            return (
                              <button
                                key={step}
                                onClick={() => handleUpdateStatus(job.id, step)}
                                className={`text-[10px] py-1.5 px-1 rounded text-center font-bold transition-all border ${
                                  isDone
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                    : "bg-slate-800 text-slate-500 border-slate-700/50 hover:text-slate-300"
                                }`}
                              >
                                {step}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                      <button
                        onClick={() => handleExportWorkOrder(job)}
                        className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 border border-slate-700"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Work Order PDF
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedJobForVariation(job);
                            setVariationReason("Switchboard Non-Compliance / Asbestos");
                            setVariationAmount(450);
                          }}
                          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold px-3 py-2 rounded-lg transition-all flex items-center gap-1"
                        >
                          <Wrench className="w-3.5 h-3.5" /> Request Variation
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Informational Trust Banners */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => setShowWarrantyPoolModal(true)}
            className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 rounded-xl p-5 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <h4 className="font-bold text-slate-200">Warranty Assurance Pool</h4>
              </div>
              <span className="text-xs text-purple-400 group-hover:underline">View Fund</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every single contract traded includes a pre-deducted $150 escrow strictly held by Sunny State to fund future orphan warranty labor call-outs.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold text-slate-200">Zero CAC. Locked Margins.</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              The payout value shown is exactly what hits your bank account. There are zero lead generation fees or marketing overheads deducted from this net figure.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h4 className="font-bold text-slate-200">Site Complexity Protocol</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              If severe structural or electrical complications (e.g., Asbestos) arise on-site, submit a 1-click Variation Order to offset costs without harming the homeowner relationship.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL 1: Claim Execution & Legal Acceptance */}
      {selectedJobForClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-emerald-400" />
                <h3 className="text-xl font-black text-white tracking-tight">Execute Tender Contract</h3>
              </div>
              <button
                onClick={() => setSelectedJobForClaim(null)}
                className="text-slate-500 hover:text-slate-300 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-6 space-y-4">
              {/* Financial Summary */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-widest block">Net Payout to Your Bank</span>
                  <span className="font-mono font-black text-2xl text-emerald-400">
                    ${selectedJobForClaim.payout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-purple-400 uppercase tracking-widest font-bold block">Warranty Escrow</span>
                  <span className="font-mono font-bold text-slate-300">$150.00 Deducted</span>
                </div>
              </div>

              {/* Job Specs */}
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-400 bg-slate-800/40 p-3 rounded-lg">
                <div>
                  <span className="text-slate-500 block">Job Scope:</span>
                  <span className="font-bold text-slate-200">
                    {selectedJobForClaim.size}kW Solar {selectedJobForClaim.battery > 0 && `+ ${selectedJobForClaim.battery}kWh Battery`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Location:</span>
                  <span className="font-bold text-slate-200">{selectedJobForClaim.suburb}</span>
                </div>
              </div>

              {/* Legal Disclaimer Checkbox */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTermsAccepted}
                    onChange={(e) => setIsTermsAccepted(e.target.checked)}
                    className="w-4 h-4 mt-1 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-900 border-slate-700"
                  />
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <strong>Master Tender Agreement:</strong> I confirm that{" "}
                    <span className="text-emerald-400 font-bold">Installer_094</span> holds an active Electrical Contractor Licence
                    and CEC Accreditation. By claiming this job, we assume 100% statutory installation liability, 10-year workmanship
                    warranties, and STC creation rights. Sunny State Quotes is strictly indemnified as the brokerage entity.
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedJobForClaim(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-all text-sm"
              >
                Cancel
              </button>
              <button
                disabled={!isTermsAccepted || isClaiming}
                onClick={handleExecuteClaim}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] text-sm flex items-center justify-center gap-2"
              >
                {isClaiming ? "Executing Lock-In..." : "CONFIRM CLAIM"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Claim Success Notice */}
      {claimSuccessJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.2)] animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
              <CheckCircle className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-black text-white">Contract Secured!</h3>
            <p className="text-sm text-slate-400 mt-2 mb-6">
              You have secured <strong className="text-white">{claimSuccessJob.id}</strong> in{" "}
              <span className="text-emerald-400 font-bold">{claimSuccessJob.suburb}</span> for{" "}
              <strong className="text-emerald-400 font-mono">${claimSuccessJob.payout.toLocaleString()}</strong>.
            </p>

            <button
              onClick={() => {
                setClaimSuccessJob(null);
                setActiveTab("Claimed");
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg text-sm"
            >
              Open Contract & Customer Details
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: Site Variation Order */}
      {selectedJobForVariation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white">Request Site Variation</h3>
              </div>
              <button
                onClick={() => setSelectedJobForVariation(null)}
                className="text-slate-500 hover:text-slate-300 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-5 space-y-4 text-xs">
              <p className="text-slate-400">
                Submit proven unforeseen site complexities for <strong>{selectedJobForVariation.id}</strong>. The cost will be offset directly from brokerage margins.
              </p>

              <div>
                <label className="text-slate-300 font-bold block mb-1.5">Variation Reason</label>
                <select
                  value={variationReason}
                  onChange={(e) => setVariationReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Switchboard Non-Compliance / Asbestos Backing">Switchboard Asbestos Backing ($450)</option>
                  <option value="Steep Pitch / Multi-Story Scaffolding Requirement">Scaffolding Requirement ($600)</option>
                  <option value="Degraded Rafters / Structural Reinforcement">Rafter Reinforcement ($350)</option>
                  <option value="Long Cable Run / Trenching Extra (>25m)">Long Cable Trenching ($400)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1.5">Approved Allowance ($ AUD)</label>
                <input
                  type="number"
                  value={variationAmount}
                  onChange={(e) => setVariationAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedJobForVariation(null)}
                className="flex-1 bg-slate-800 text-slate-300 font-bold py-2.5 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAddVariation}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition-all shadow-md"
              >
                Submit & Auto-Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Installer Profile & Accreditations */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-emerald-400" />
                <h3 className="text-lg font-black text-white">Installer Verification Card</h3>
              </div>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-500 hover:text-slate-300 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-6 space-y-3.5 text-xs">
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400">Firm / Handle:</span>
                <span className="font-bold text-white font-mono">Installer_094 (Apex Solar WA)</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400">CEC Accreditation #:</span>
                <span className="font-bold text-emerald-400 font-mono">A8912440 (Grid-Connect + Battery)</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400">NETCC Status:</span>
                <span className="font-bold text-emerald-400">Approved Seller Verified</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400">Public Liability Insurance:</span>
                <span className="font-bold text-blue-400">$20,000,000 (Active to 2027)</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400">Total Tender Payouts Earned:</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">${metrics.totalClaimedVolume.toLocaleString()} AUD</span>
              </div>
            </div>

            <button
              onClick={() => setShowProfileModal(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs transition-all"
            >
              Close Verification
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: Warranty Assurance Pool Detail */}
      {showWarrantyPoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-black text-white">Warranty Assurance Pool</h3>
              </div>
              <button onClick={() => setShowWarrantyPoolModal(false)} className="text-slate-500 hover:text-slate-300 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-6 space-y-4 text-xs">
              <div className="bg-purple-950/40 border border-purple-800/40 p-4 rounded-xl text-center">
                <span className="text-[10px] uppercase tracking-widest text-purple-300 font-bold block mb-1">
                  Total Accumulated Escrow
                </span>
                <span className="font-mono font-black text-3xl text-purple-300">
                  ${metrics.warrantyReservePool.toLocaleString()} AUD
                </span>
                <span className="text-[10px] text-purple-400/80 block mt-1">($150 per completed installation)</span>
              </div>

              <p className="text-slate-400 leading-relaxed">
                This fund solves the "orphan solar system" crisis. If an installer ceases trading or is unavailable, any approved contractor on SunnyEX can claim a flat $350-$450 fee to perform warranty service call-outs.
              </p>
            </div>

            <button
              onClick={() => setShowWarrantyPoolModal(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Hidden Work Order PDF Rendering Container */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        {pdfQuoteData && (
          <div id="tender-work-order-pdf">
            <InstallerWorkOrderTemplate data={pdfQuoteData} />
          </div>
        )}
      </div>
    </main>
  );
}
