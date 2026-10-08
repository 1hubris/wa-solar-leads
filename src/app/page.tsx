import Funnel from "@/components/Funnel";
import { Shield, Award, CheckCircle, Zap, Wrench, FileCheck, Lock, ArrowRight, UserCheck, Banknote, Star, Sun } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4f7f6] selection:bg-accent-500 selection:text-slate-900">
      
      {/* Heavy Navy Header (SolarQuotes Utility Style) */}
      <header className="w-full bg-primary-700 text-white border-b-4 border-accent-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center shadow-lg border-2 border-primary-900">
                <Sun className="text-primary-900 w-7 h-7" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tight leading-none text-white">
                  SUNNY STATE
                </span>
                <span className="font-bold text-accent-400 text-sm tracking-widest uppercase leading-none mt-1">
                  Quotes
                </span>
              </div>
            </div>

            {/* Header Right: Trust Signals & CTA */}
            <div className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Shield className="w-5 h-5 text-green-400"/>
                <span>100% Free & Secure</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Award className="w-5 h-5 text-accent-400"/>
                <span>CEC Accredited Network</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Split Hero Section */}
      <section className="bg-primary-600 relative overflow-hidden py-12 md:py-20 border-b border-primary-900 shadow-xl">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Left Column: Copywriting */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-primary-800/50 border border-primary-500/30 text-accent-400 text-xs font-bold uppercase tracking-widest mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500"></span>
                </span>
                Now Serving Western Australia
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                Don't be misinformed <br className="hidden md:block"/>
                <span className="text-accent-500 underline decoration-accent-500/30 underline-offset-8">and overpay.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-6 font-medium">
                Be sure to get the fairest price with the strongest products and warranties. We connect you with experienced design consultants who build a system designed for your personal consumption—removing overheads so massive savings are passed directly to you. All installations are backed by our Community Escrow Trust, guaranteeing your insurance and warranty for the long term.
              </p>

              {/* Installer Trust Badge */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-primary-800/40 border border-primary-700/50 rounded-xl p-4 mb-10 w-fit mx-auto lg:mx-0 shadow-inner">
                <div className="flex gap-1">
                  {[1,2,3,4].map(i => (
                    <Star key={i} className="w-5 h-5 text-accent-500 fill-accent-500" />
                  ))}
                  <div className="relative w-5 h-5">
                    <Star className="w-5 h-5 text-accent-500 absolute inset-0" />
                    <div className="absolute inset-0 overflow-hidden w-[50%]">
                      <Star className="w-5 h-5 text-accent-500 fill-accent-500" />
                    </div>
                  </div>
                </div>
                <div className="text-center sm:text-left text-white leading-tight">
                  <span className="font-bold text-sm block">Minimum 4.4★ Installer Rating</span>
                  <span className="text-xs text-slate-300 font-medium">10-Year Warranties • 65+ Verified Reviews</span>
                </div>
              </div>

              <div className="hidden lg:flex flex-col gap-4">
                <div className="flex items-center gap-3 text-slate-200">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <span className="font-semibold">System designed specifically for your bi-monthly bill</span>
                </div>
                <div className="flex items-center gap-3 text-slate-200">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <span className="font-semibold">We quote the build before matching with an installer</span>
                </div>
                <div className="flex items-center gap-3 text-slate-200">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <span className="font-semibold">Strict vetting of qualified electrical companies</span>
                </div>
                <div className="flex items-center gap-3 text-slate-200">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <span className="font-semibold">Guaranteed insurance backed by our Community Escrow Trust</span>
                </div>
              </div>
            </div>

            {/* Right Column: The Funnel Mechanic */}
            <div className="w-full lg:w-[500px] flex-shrink-0">
              <div className="bg-accent-500 text-primary-900 font-black text-center py-4 rounded-t-xl text-xl shadow-lg border-b-4 border-accent-600">
                CHECK YOUR ELIGIBILITY NOW
              </div>
              {/* Funnel Component will naturally have a solid white background now */}
              <div className="-mt-1 relative z-20">
                <Funnel />
              </div>
              <div className="bg-white rounded-b-xl px-6 py-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 shadow-xl">
                <Lock className="w-4 h-4 text-green-500" />
                256-bit Secure Assessment Form
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Finance Bypass Banner */}
      <section className="bg-white border-b border-slate-200 py-10 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-800 font-extrabold text-xl md:text-2xl mb-2">
            Partner with your home loan provider to dodge finance fees and save thousands.
          </p>
          <p className="text-slate-500 font-medium text-sm md:text-base mb-8">
            Enjoy 0% vendor markups and the freedom to <strong className="text-primary-600">pay out early with zero penalties.</strong>
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <img src="/commbank.svg" alt="CommBank" className="h-5 md:h-[26px] w-auto object-contain" />
                <span className="text-2xl font-black text-[#FFCC00] tracking-tighter">CommBank</span>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">3.99% p.a. Loan</span>
            </div>
            <div className="hidden md:block w-px h-10 bg-slate-200"></div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <img src="/nab.svg" alt="NAB" className="h-6 md:h-8 w-auto object-contain" />
                <span className="text-2xl font-extrabold text-[#D50000] tracking-tight">nab</span>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Green Finance</span>
            </div>
            <div className="hidden md:block w-px h-10 bg-slate-200"></div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <img src="/westpac.svg" alt="Westpac" className="h-[14px] md:h-[19px] w-auto object-contain" />
                <span className="text-2xl font-black text-slate-800 tracking-tight">Westpac</span>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Eco Loan</span>
            </div>
            <div className="hidden md:block w-px h-10 bg-slate-200"></div>
            <div className="flex flex-col items-center justify-center h-[44px]">
              <span className="text-2xl font-black text-emerald-500 tracking-tighter">Green Brokers</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">~6.9% Unsecured</span>
            </div>
          </div>
        </div>
      </section>

      {/* Hardware Tiers Matrix */}
      <section className="bg-white border-b border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Utilizing premium tier-1 equipment and brands</h2>
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800">Choose your performance tier</h3>
          </div>

          <div className="overflow-x-auto pb-4">
            <div className="min-w-[800px] border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-slate-50">
              
              {/* Header Row (Tiers) */}
              <div className="grid grid-cols-4 bg-slate-100 border-b border-slate-200">
                <div className="p-4"></div>
                <div className="p-4 text-center border-l border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tier 1</div>
                  <div className="text-lg font-black text-slate-800">Value</div>
                </div>
                <div className="p-4 text-center border-l border-slate-200 bg-blue-50/50">
                  <div className="text-xs font-bold text-blue-500 uppercase tracking-widest">Tier 2</div>
                  <div className="text-lg font-black text-blue-900">Advanced</div>
                </div>
                <div className="p-4 text-center border-l border-slate-200 bg-purple-50/50">
                  <div className="text-xs font-bold text-purple-500 uppercase tracking-widest">Tier 3</div>
                  <div className="text-lg font-black text-purple-900">Premium</div>
                </div>
              </div>

              {/* Row 1: Panels */}
              <div className="grid grid-cols-4 border-b border-slate-200 bg-white">
                <div className="p-6 flex items-center justify-start border-r border-slate-200 bg-slate-50">
                  <span className="font-bold text-slate-700 uppercase tracking-widest text-sm">Solar Panels</span>
                </div>
                <div className="p-6 flex flex-wrap justify-center gap-4 items-center opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition duration-300">
                  <span className="font-bold text-slate-800 text-lg">JinkoSolar</span>
                  <span className="font-bold text-slate-800 text-lg">Trina Solar</span>
                  <span className="font-extrabold text-slate-800 text-lg">LONGi</span>
                </div>
                <div className="p-6 flex flex-wrap justify-center gap-4 items-center border-l border-slate-200 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition duration-300">
                  <span className="font-bold text-slate-800 text-lg">QCELLS</span>
                  <span className="font-bold italic text-slate-800 text-lg">REC</span>
                  <span className="font-semibold text-slate-800 text-lg">Hyundai</span>
                </div>
                <div className="p-6 flex flex-wrap justify-center gap-4 items-center border-l border-slate-200 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition duration-300">
                  <span className="font-bold text-slate-800 text-lg">SunPower</span>
                  <span className="font-bold italic text-slate-800 text-lg">REC (Alpha)</span>
                </div>
              </div>

              {/* Row 2: Inverters */}
              <div className="grid grid-cols-4 border-b border-slate-200 bg-white">
                <div className="p-6 flex items-center justify-start border-r border-slate-200 bg-slate-50">
                  <span className="font-bold text-slate-700 uppercase tracking-widest text-sm">Inverters</span>
                </div>
                <div className="p-6 flex flex-wrap justify-center gap-4 items-center opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition duration-300">
                  <span className="font-black text-slate-800 text-lg">GoodWe</span>
                  <span className="font-black italic text-slate-800 text-lg">Growatt</span>
                  <span className="font-black tracking-tighter text-slate-800 text-lg">SOFAR</span>
                  <span className="font-extrabold tracking-widest text-slate-800 text-lg">SOLAX</span>
                </div>
                <div className="p-6 flex flex-wrap justify-center gap-4 items-center border-l border-slate-200 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition duration-300">
                  <span className="font-black text-slate-800 text-lg">SUNGROW</span>
                  <span className="font-bold text-slate-800 text-lg">HUAWEI</span>
                  <span className="font-black tracking-widest text-slate-800 text-lg">FRONIUS</span>
                </div>
                <div className="p-6 flex flex-wrap justify-center gap-4 items-center border-l border-slate-200 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition duration-300">
                  <span className="font-extrabold text-slate-800 text-lg">ENPHASE</span>
                  <span className="font-bold text-slate-800 text-lg">SolarEdge</span>
                </div>
              </div>

              {/* Row 3: Batteries */}
              <div className="grid grid-cols-4 bg-white">
                <div className="p-6 flex items-center justify-start border-r border-slate-200 bg-slate-50">
                  <span className="font-bold text-slate-700 uppercase tracking-widest text-sm">Batteries</span>
                </div>
                <div className="p-6 flex flex-wrap justify-center gap-4 items-center opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition duration-300">
                  <span className="font-bold font-serif text-slate-800 text-lg">ALPHA</span>
                  <span className="font-black text-slate-800 text-lg">GoodWe</span>
                  <span className="font-black italic text-slate-800 text-lg">Growatt</span>
                </div>
                <div className="p-6 flex flex-wrap justify-center gap-4 items-center border-l border-slate-200 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition duration-300">
                  <span className="font-black text-slate-800 text-lg">SUNGROW</span>
                  <span className="font-bold text-slate-800 text-lg">HUAWEI</span>
                </div>
                <div className="p-6 flex flex-wrap justify-center gap-4 items-center border-l border-slate-200 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition duration-300">
                  <span className="font-black tracking-tighter text-slate-800 text-lg">TESLA</span>
                  <span className="font-semibold tracking-tight text-slate-800 text-lg">SigenStor</span>
                  <span className="font-extrabold text-slate-800 text-lg">ENPHASE</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* "How It Works" / Value Proposition Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#f4f7f6]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary-700 mb-4">
              A smarter way to buy solar in WA.
            </h2>
            <div className="h-1 w-20 bg-accent-500 mx-auto rounded"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
              <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center mb-6">
                <UserCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">1. Expert Design First</h3>
              <p className="text-slate-600 leading-relaxed">
                Experienced design consultants analyze your specific energy consumption. We design your system and calculate your exact ROI before you speak to any installers.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 relative transform md:-translate-y-4 shadow-md border-t-4 border-t-accent-500">
              <div className="w-14 h-14 bg-accent-100 text-accent-600 rounded-lg flex items-center justify-center mb-6">
                <Banknote className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">2. We Cut The Overhead</h3>
              <p className="text-slate-600 leading-relaxed">
                We remove the bloated sales commissions and unnecessary overheads typical in the solar industry, passing those massive savings directly onto you.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">3. Vetted Installers</h3>
              <p className="text-slate-600 leading-relaxed">
                We quote the build and match you exclusively with CEC Accredited, in-house electrical companies providing 10-year warranties. We strictly only partner with installers who maintain a minimum 4.4-star rating online across at least 65 verified reviews.
              </p>
            </div>
          </div>
        </div>
      </section>
      

      {/* Payment Options */}
      <section className="bg-white py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold text-slate-500 mb-8 max-w-2xl mx-auto">
            0% Vendor Markups. 100% Transparency. <span className="text-primary-600">Pay out your system early with zero penalties.</span>
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 mb-12">
            <div className="flex flex-col items-center gap-2 grayscale hover:grayscale-0 transition duration-300 opacity-70 hover:opacity-100 cursor-default">
              <div className="flex items-center gap-2">
                <img src="/commbank.svg" alt="CommBank" className="h-4 md:h-[20px] w-auto object-contain" />
                <span className="text-2xl font-black text-[#FFCC00] tracking-tighter">CommBank</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">3.99% Home Energy Loan</span>
            </div>
            <div className="flex flex-col items-center gap-2 grayscale hover:grayscale-0 transition duration-300 opacity-70 hover:opacity-100 cursor-default">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <img src="/nab.svg" alt="NAB" className="h-5 md:h-6 w-auto object-contain" />
                  <img src="/westpac.svg" alt="Westpac" className="h-[10px] md:h-[12px] w-auto object-contain" />
                </div>
                <span className="text-2xl font-extrabold text-[#D50000] tracking-tight">NAB / Westpac</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Green Mortgage Top-Ups</span>
            </div>
            <div className="flex flex-col items-center gap-2 grayscale hover:grayscale-0 transition duration-300 opacity-70 hover:opacity-100 cursor-default h-[36px] justify-center">
              <span className="text-2xl font-black text-emerald-500 tracking-tighter">Green Brokers</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Unsecured Personal Loans</span>
            </div>
            <div className="flex flex-col items-center gap-2 grayscale hover:grayscale-0 transition duration-300 opacity-70 hover:opacity-100 cursor-default">
              <div className="flex items-center gap-1 text-2xl font-black text-blue-600">
                <Banknote className="w-6 h-6"/> UPFRONT
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Direct Cash Transfers</span>
            </div>
          </div>
          
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-6 border-t border-slate-100 pt-8 max-w-xl mx-auto">Alternative Solar Finance Providers</h3>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition duration-300 scale-90 cursor-default">
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-blue-800 tracking-tighter">plenti</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-extrabold text-emerald-500 tracking-tight">brighte</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-orange-500 tracking-tighter">humm®</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-primary-800">
        <div className="max-w-7xl mx-auto text-center text-sm">
          <div className="flex items-center justify-center gap-2 mb-6 text-slate-500">
            <Lock className="w-4 h-4" />
            <span>Your data is secured with 256-bit encryption</span>
          </div>
          <p className="mb-4 font-semibold text-slate-300">© {new Date().getFullYear()} Sunny State Quotes. All rights reserved.</p>
          <p className="max-w-3xl mx-auto text-xs leading-relaxed opacity-60">
            This site is an independent solar information and design service. Your information is kept strictly confidential and is only used to find you the best product and company for your specific area in Western Australia. We adhere strictly to the Australian Privacy Principles and the Spam Act 2003.
          </p>
        </div>
      </footer>
    </main>
  );
}

