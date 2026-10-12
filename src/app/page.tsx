"use client";

import Link from "next/link";
import Funnel from "@/components/Funnel";
import { 
  Sun, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle, 
  Activity, 
  Cpu, 
  Layers, 
  Zap, 
  Shield, 
  Award, 
  Star, 
  Lock, 
  FileText, 
  Home as HomeIcon,
  ChevronRight
} from "lucide-react";

export default function Home() {
  const scrollToAssessment = () => {
    document.getElementById("assessment-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#102022] font-sans selection:bg-[#df6f24]/20 selection:text-[#df6f24]">
      
      {/* Site Header */}
      <header className="sticky top-0 z-50 bg-[#fbfaf7]/90 backdrop-blur-md border-b border-[#ddd7ca]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#102022] flex items-center justify-center relative overflow-hidden shadow-sm">
              <div className="w-6 h-3 border-2 border-[#df6f24] border-b-0 rounded-t-full absolute top-2"></div>
              <div className="w-4 h-0.5 bg-white absolute bottom-2"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-xl tracking-tight text-[#102022] leading-none">
                Sunny State Quotes
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#667376] font-semibold mt-1">
                WA Solar Assessments
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#2a383a]">
            <Link href="/" className="text-[#df6f24]">Home</Link>
            <a href="#process" className="hover:text-[#df6f24] transition-colors">How It Works</a>
            <a href="#philosophy" className="hover:text-[#df6f24] transition-colors">Why Us</a>
            <Link href="/tender" className="hover:text-[#df6f24] transition-colors flex items-center gap-1">
              <span>SunnyEX Tender</span>
              <span className="text-[10px] bg-[#df6f24]/10 text-[#df6f24] px-1.5 py-0.5 rounded font-bold uppercase">Live</span>
            </Link>
            <a href="#finance" className="hover:text-[#df6f24] transition-colors">Finance</a>
            <a href="#escrow" className="hover:text-[#df6f24] transition-colors">Escrow</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={scrollToAssessment}
              className="bg-[#102022] hover:bg-[#172022] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
            >
              Start Assessment
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f8f5ed] to-[#fbfaf7] border-b border-[#ddd7ca] py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Hero Column */}
            <div className="lg:col-span-6 flex flex-col justify-center pt-2 sm:pt-6">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#df6f24] mb-4">
                <span className="w-8 h-px bg-[#df6f24]"></span>
                Independent solar design + procurement
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#102022] leading-[1.06] tracking-tight mb-6">
                Know what you need.<br />
                <span className="text-[#df6f24]">Know what it should cost.</span>
              </h1>

              <p className="text-lg text-[#4f5c5f] leading-relaxed mb-8 max-w-xl">
                We assess your home and energy consumption, design an optimized solar system, establish a transparent build price, then tender the project to a vetted Western Australian electrical company.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <button
                  onClick={scrollToAssessment}
                  className="bg-[#df6f24] hover:bg-[#c95716] text-white font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-lg shadow-[#df6f24]/20 transition-all flex items-center gap-2"
                >
                  Start My Assessment <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  href="/tender"
                  className="bg-transparent hover:bg-white border border-[#ddd7ca] text-[#102022] font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl transition-all"
                >
                  View SunnyEX Tender Board
                </Link>
              </div>

              {/* Verified Trust Stats */}
              <div className="grid grid-cols-3 gap-4 border-t border-[#ddd7ca] pt-6 max-w-lg">
                <div>
                  <strong className="block font-serif text-2xl sm:text-3xl text-[#102022]">4.4★+</strong>
                  <span className="text-[10px] sm:text-xs text-[#667376] uppercase tracking-wider font-semibold">Minimum installer rating</span>
                </div>
                <div className="border-l border-[#ddd7ca] pl-4">
                  <strong className="block font-serif text-2xl sm:text-3xl text-[#102022]">10 yr</strong>
                  <span className="text-[10px] sm:text-xs text-[#667376] uppercase tracking-wider font-semibold">Workmanship target</span>
                </div>
                <div className="border-l border-[#ddd7ca] pl-4">
                  <strong className="block font-serif text-2xl sm:text-3xl text-[#102022]">65+</strong>
                  <span className="text-[10px] sm:text-xs text-[#667376] uppercase tracking-wider font-semibold">Verified reviews target</span>
                </div>
              </div>
            </div>

            {/* Right Column: Multi-Step Assessment Funnel */}
            <div id="assessment-section" className="lg:col-span-6 scroll-mt-28">
              <div className="relative">
                <div className="absolute -top-3 -right-3 hidden sm:flex items-center gap-1.5 bg-[#102022] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md z-20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  WA Homeowner Funnel
                </div>
                <Funnel />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5-Stage Process Strip */}
      <section id="process" className="border-b border-[#ddd7ca] bg-[#fbfaf7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#ddd7ca]">
            {[
              { num: "01", title: "Design First", desc: "Model the home and energy use before an installer enters the picture." },
              { num: "02", title: "Price Before Installer", desc: "Know the build economics before selecting who installs it." },
              { num: "03", title: "Tender the Project", desc: "Send a defined project into the SunnyEX installer marketplace." },
              { num: "04", title: "Escrow Protection", desc: "Contribute to the community protection mechanism attached to eligible jobs." },
              { num: "05", title: "Install", desc: "Move from a controlled project brief to a vetted electrical company." },
            ].map((step) => (
              <div key={step.num} className="p-6 sm:p-8 flex flex-col justify-between">
                <span className="font-serif text-3xl sm:text-4xl text-[#df6f24] leading-none mb-4">{step.num}</span>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#102022] mb-1.5">{step.title}</h3>
                  <p className="text-xs text-[#667376] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy / Core Grid */}
      <section id="philosophy" className="py-20 border-b border-[#ddd7ca]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#df6f24] mb-3">
                <span className="w-8 h-px bg-[#df6f24]"></span>
                A better way to go solar
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#102022] leading-tight max-w-xl">
                Solar should be designed before it is sold.
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#667376] max-w-md leading-relaxed">
              Instead of starting with a salesperson, we start with your house, energy use and project requirements — then build a transparent procurement pathway around it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#ddd7ca] rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#f7e7d8] text-[#df6f24] flex items-center justify-center text-xl font-bold mb-6">
                ⌂
              </div>
              <h3 className="font-serif font-bold text-2xl text-[#102022] mb-3">Energy Profile</h3>
              <p className="text-sm text-[#667376] leading-relaxed">
                We analyse your home, bills and future consumption needs so the system is sized around actual household requirements rather than a generic catalogue bundle.
              </p>
            </div>

            <div className="bg-white border border-[#ddd7ca] rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#f7e7d8] text-[#df6f24] flex items-center justify-center text-xl font-bold mb-6">
                ⌗
              </div>
              <h3 className="font-serif font-bold text-2xl text-[#102022] mb-3">Build Cost</h3>
              <p className="text-sm text-[#667376] leading-relaxed">
                We calculate intended equipment, labour and site extras before an installer is selected, establishing a single transparent project price with zero hidden margin traps.
              </p>
            </div>

            <div className="bg-white border border-[#ddd7ca] rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#f7e7d8] text-[#df6f24] flex items-center justify-center text-xl font-bold mb-6">
                ↗
              </div>
              <h3 className="font-serif font-bold text-2xl text-[#102022] mb-3">Installer Match</h3>
              <p className="text-sm text-[#667376] leading-relaxed">
                We tender the defined project to suitable, vetted WA electrical companies instead of selling a raw homeowner lead to three competing aggressive sales reps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Flow (Race to Bottom vs Controlled Tender) */}
      <section className="py-20 bg-[#172022] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#f0a46c] mb-3">
                <span className="w-8 h-px bg-[#f0a46c]"></span>
                The industry problem
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
                The 3-quote race to the bottom.
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#9eb0af] max-w-md leading-relaxed">
              Sunny State Quotes replaces competitive discounting with a defined project, transparent economics and a controlled tender.
            </p>
          </div>

          {/* Traditional Flow */}
          <div className="mb-10">
            <span className="text-xs uppercase tracking-widest text-red-400 font-bold block mb-3">The Traditional Lead-Gen Model</span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center sm:text-left">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <strong className="block text-white text-sm mb-1">1. Homeowner</strong>
                <span className="text-xs text-[#9eb0af]">Enters contact info for "3 free quotes"</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <strong className="block text-white text-sm mb-1">2. Lead Auctioned</strong>
                <span className="text-xs text-[#9eb0af]">Sold to 3+ competing sales teams</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <strong className="block text-white text-sm mb-1">3. Price War</strong>
                <span className="text-xs text-[#9eb0af]">Installers cut corners to win on margin</span>
              </div>
              <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-4">
                <strong className="block text-red-300 text-sm mb-1">4. Long-Term Risk</strong>
                <span className="text-xs text-red-200/80">Thin margins, orphaned warranties</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/10 my-8"></div>

          {/* Sunny State Flow */}
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold block mb-3">The Sunny State Quotes Procurement Model</span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center sm:text-left">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <strong className="block text-white text-sm mb-1">1. Homeowner Assessment</strong>
                <span className="text-xs text-[#9eb0af]">Analyzes property + energy telemetry</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <strong className="block text-white text-sm mb-1">2. Engineered Design</strong>
                <span className="text-xs text-[#9eb0af]">System and build cost fixed upfront</span>
              </div>
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4">
                <strong className="block text-emerald-300 text-sm mb-1">3. SunnyEX Tender</strong>
                <span className="text-xs text-emerald-200/80">Vetted electrical companies claim jobs</span>
              </div>
              <div className="bg-purple-950/30 border border-purple-500/30 rounded-xl p-4">
                <strong className="block text-purple-300 text-sm mb-1">4. Escrow Protected</strong>
                <span className="text-xs text-purple-200/80">Community reserve protects warranty</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SunnyEX Tender Board Section */}
      <section className="py-20 border-b border-[#ddd7ca]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#df6f24] mb-3">
                <span className="w-8 h-px bg-[#df6f24]"></span>
                SunnyEX tender board
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#102022] leading-tight mb-6">
                Your quote isn't sent to three salespeople.
              </h2>
              <p className="text-base text-[#4f5c5f] leading-relaxed mb-8">
                Once your project is designed and priced, it enters our controlled SunnyEX tender exchange where vetted electrical contractors review specifications and claim jobs that match their operational capacity.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/tender"
                  className="bg-[#102022] hover:bg-[#172022] text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all flex items-center gap-2"
                >
                  Enter Tender Exchange <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={scrollToAssessment}
                  className="border border-[#ddd7ca] hover:border-[#df6f24] text-[#102022] font-bold text-sm px-6 py-3.5 rounded-xl transition-all"
                >
                  Start Assessment
                </button>
              </div>
            </div>

            {/* Live Market Card Preview */}
            <div className="lg:col-span-6">
              <div className="bg-gradient-to-br from-[#173335] to-[#112324] text-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="text-[10px] tracking-widest uppercase text-[#a8b8b8] font-mono">
                    Project #SSQ-1047
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-[#ffb783] border border-[#df6f24]/50 bg-[#df6f24]/10 px-2.5 py-1 rounded-full font-bold">
                    Live Tender
                  </div>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-4">
                  Perth Metro · Tile Roof · 3 Phase
                </h3>

                <div className="flex flex-wrap gap-2 mb-6">
                  {["13 × 475W Panels", "Hybrid Inverter", "Battery Ready", "Tile Roof", "Subiaco Grid"].map((spec) => (
                    <span key={spec} className="text-xs bg-white/10 border border-white/10 text-slate-200 px-3 py-1 rounded-full">
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#9eaaaa] block mb-1">
                      Guaranteed Net Revenue
                    </span>
                    <strong className="font-serif text-3xl sm:text-4xl text-emerald-400 font-bold">
                      $4,200.00
                    </strong>
                  </div>

                  <Link
                    href="/tender"
                    className="bg-[#df6f24] hover:bg-[#c95716] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    View on Exchange <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 text-[11px] text-[#9eb0af] flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#df6f24]" />
                  Homeowner PII remains quarantined until an eligible installer executes legal anti-flipping liability.
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Community Escrow Trust Section */}
      <section id="escrow" className="py-20 bg-gradient-to-br from-[#eff7f2] to-[#f8f4ed] border-b border-[#ddd7ca]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#df6f24] mb-3">
                <span className="w-8 h-px bg-[#df6f24]"></span>
                Community escrow trust
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#102022] leading-tight mb-6">
                Your installer can change.<br />
                <span className="text-[#df6f24]">Your protection shouldn't.</span>
              </h2>
              <p className="text-base text-[#4f5c5f] leading-relaxed mb-6">
                A defined contribution is allocated on participating projects to maintain a collective reserve fund. In the event an installer ceases trading or disputes warranty obligations, the Community Escrow Trust provides an independent safety mechanism for eligible repairs.
              </p>
              <div className="bg-white/80 border border-[#ddd7ca] rounded-xl p-4 max-w-lg mb-6 text-xs text-[#667376] leading-relaxed">
                <strong className="text-[#102022] block mb-1 font-bold">Mathematical Solvency</strong>
                Every claimed job contributes directly into the pool before installer release, ensuring reserves continuously compound alongside network volume.
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-[#172022] rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl border border-white/10 text-center">
                <div className="w-32 h-32 rounded-full border border-white/20 mx-auto flex flex-col items-center justify-center bg-white/5 mb-6 shadow-inner">
                  <ShieldCheck className="w-8 h-8 text-purple-400 mb-1" />
                  <b className="font-serif text-lg leading-tight">ESCROW</b>
                  <small className="text-[9px] uppercase tracking-widest text-slate-400">Reserve Pool</small>
                </div>
                <h4 className="font-serif text-xl font-bold mb-2">Long-Term Homeowner Assurance</h4>
                <p className="text-xs text-[#bac6c6] leading-relaxed max-w-xs mx-auto">
                  Built to prevent orphaned solar installations across Western Australia.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Finance Pathways */}
      <section id="finance" className="py-20 border-b border-[#ddd7ca] bg-[#f2ece1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#df6f24] mb-3">
                <span className="w-8 h-px bg-[#df6f24]"></span>
                Finance without the sales trap
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#102022] leading-tight">
                Choose how you pay.<br />Not which salesperson you get.
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#667376] max-w-md leading-relaxed">
              Keep the system design and build price independent from the finance broker. Explore home energy loans only after your engineering is understood.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#ddd7ca] rounded-2xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#df6f24] font-bold block mb-2">Option 01</span>
                <h3 className="font-serif font-bold text-2xl text-[#102022] mb-3">Home Energy Loan</h3>
                <p className="text-sm text-[#667376] leading-relaxed">
                  Green loan options through major banks or mortgage providers with discounted clean energy interest rates.
                </p>
              </div>
              <span className="font-serif text-lg text-[#102022] font-bold mt-6 block">Low Fixed Rates</span>
            </div>

            <div className="bg-white border border-[#ddd7ca] rounded-2xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#df6f24] font-bold block mb-2">Option 02</span>
                <h3 className="font-serif font-bold text-2xl text-[#102022] mb-3">Mortgage Top-Up</h3>
                <p className="text-sm text-[#667376] leading-relaxed">
                  Use existing equity in your property to add solar and battery storage directly onto your current home loan structure.
                </p>
              </div>
              <span className="font-serif text-lg text-[#102022] font-bold mt-6 block">Flexible Term</span>
            </div>

            <div className="bg-white border border-[#ddd7ca] rounded-2xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#df6f24] font-bold block mb-2">Option 03</span>
                <h3 className="font-serif font-bold text-2xl text-[#102022] mb-3">Cash / Direct</h3>
                <p className="text-sm text-[#667376] leading-relaxed">
                  Pay directly for the project with zero finance interest, maximizing your immediate return on investment from day one.
                </p>
              </div>
              <span className="font-serif text-lg text-[#102022] font-bold mt-6 block">Maximum ROI</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="py-20 bg-gradient-to-r from-[#162224] to-[#243838] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#f0a46c] mb-3">
              <span className="w-8 h-px bg-[#f0a46c]"></span>
              Take the first step
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight mb-2">
              Get the system designed before you buy it.
            </h2>
            <p className="text-[#d3dddd] text-base max-w-xl">
              Start with a 60-second WA homeowner intake. We configure your brief and connect it to transparent project economics.
            </p>
          </div>

          <button
            onClick={scrollToAssessment}
            className="bg-[#df6f24] hover:bg-[#c95716] text-white font-bold text-base px-8 py-4 rounded-xl shadow-xl transition-all whitespace-nowrap"
          >
            Start My Solar Assessment →
          </button>
        </div>
      </section>

      {/* Site Footer */}
      <footer className="bg-[#0f1a1c] text-[#dce4e3] py-14 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center relative overflow-hidden">
                  <div className="w-5 h-2.5 border-2 border-[#df6f24] border-b-0 rounded-t-full absolute top-1.5"></div>
                </div>
                <span className="font-serif font-bold text-lg text-white">Sunny State Quotes</span>
              </div>
              <p className="text-xs text-[#99a8a5] leading-relaxed max-w-xs">
                Independent solar design and procurement for Western Australian homeowners. Designed around your real energy usage.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-3">Explore</h4>
              <ul className="space-y-2 text-xs text-[#aebcbb]">
                <li><a href="#process" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#philosophy" className="hover:text-white transition-colors">Why Us</a></li>
                <li><Link href="/tender" className="hover:text-white transition-colors">SunnyEX Tender Exchange</Link></li>
                <li><a href="#escrow" className="hover:text-white transition-colors">Community Escrow Trust</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-3">Resources</h4>
              <ul className="space-y-2 text-xs text-[#aebcbb]">
                <li><a href="#finance" className="hover:text-white transition-colors">Solar Finance Pathways</a></li>
                <li><button onClick={scrollToAssessment} className="hover:text-white transition-colors">Homeowner Assessment</button></li>
                <li><Link href="/tender" className="hover:text-white transition-colors">Installer Portal</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-3">Legal & Coverage</h4>
              <ul className="space-y-2 text-xs text-[#aebcbb]">
                <li>Western Power Grid (SWIS)</li>
                <li>CEC-Accredited Installer Network</li>
                <li>Community Escrow Trust Terms</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#879492]">
            <span>© {new Date().getFullYear()} Sunny State Quotes. All rights reserved.</span>
            <span>Western Australia Solar Procurement System</span>
          </div>
        </div>
      </footer>

    </main>
  );
}
