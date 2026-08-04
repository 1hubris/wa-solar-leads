import Funnel from "@/components/Funnel";
import { Shield, Award, CheckCircle, Zap, Wrench, FileCheck, Lock, ArrowRight, UserCheck, Banknote, Star } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4f7f6] selection:bg-accent-500 selection:text-slate-900">
      
      {/* Heavy Navy Header (SolarQuotes Utility Style) */}
      <header className="w-full bg-primary-700 text-white border-b-4 border-accent-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent-500 rounded flex items-center justify-center shadow-lg">
                <Zap className="text-primary-900 w-7 h-7" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tight leading-none text-white">
                  WA SOLAR
                </span>
                <span className="font-semibold text-accent-400 text-sm tracking-widest uppercase leading-none mt-1">
                  Assessments
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
                Be sure to get the fairest price with the strongest products and warranties. We connect you with experienced design consultants who build a system designed for your personal consumption—removing overheads so massive savings are passed directly to you.
              </p>

              {/* Installer Trust Badge */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-primary-800/40 border border-primary-700/50 rounded-xl p-4 mb-10 w-fit mx-auto lg:mx-0 shadow-inner">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-5 h-5 ${i === 5 ? 'text-accent-500 fill-accent-500/50' : 'text-accent-500 fill-accent-500'}`} />
                  ))}
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

      {/* Trust Band (Logos) */}
      <section className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Utilizing premium tier-1 equipment and brands</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale">
            <div className="text-2xl font-black tracking-tighter text-slate-800">SOFAR</div>
            <div className="text-2xl font-black italic text-slate-800">Growatt</div>
            <div className="text-2xl font-extrabold tracking-widest text-slate-800">SOLAX</div>
            <div className="text-2xl font-bold font-serif text-slate-800">ALPHA</div>
            <div className="text-2xl font-semibold tracking-tight text-slate-800">SigenStor</div>
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
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-8">Flexible Payment Options Available</h2>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="flex flex-col items-center gap-2 grayscale hover:grayscale-0 transition duration-300 opacity-70 hover:opacity-100 cursor-default">
              <span className="text-2xl font-black text-[#00E5FF] tracking-tighter">plenti</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Green Loans</span>
            </div>
            <div className="flex flex-col items-center gap-2 grayscale hover:grayscale-0 transition duration-300 opacity-70 hover:opacity-100 cursor-default">
              <span className="text-2xl font-extrabold text-[#F55353] tracking-tight">brighte</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">0% Interest</span>
            </div>
            <div className="flex flex-col items-center gap-2 grayscale hover:grayscale-0 transition duration-300 opacity-70 hover:opacity-100 cursor-default">
              <span className="text-2xl font-black text-[#FF7A00] tracking-tighter">humm®</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Buy Now Pay Later</span>
            </div>
            <div className="flex flex-col items-center gap-2 grayscale hover:grayscale-0 transition duration-300 opacity-70 hover:opacity-100 cursor-default">
              <div className="flex items-center gap-1 text-2xl font-black text-green-600">
                <Banknote className="w-6 h-6"/> UPFRONT
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Cash Discounts</span>
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
          <p className="mb-4 font-semibold text-slate-300">© {new Date().getFullYear()} WA Solar Assessments. All rights reserved.</p>
          <p className="max-w-3xl mx-auto text-xs leading-relaxed opacity-60">
            This site is an independent solar information and design service. Your information is kept strictly confidential and is only used to find you the best product and company for your specific area in Western Australia. We adhere strictly to the Australian Privacy Principles and the Spam Act 2003.
          </p>
        </div>
      </footer>
    </main>
  );
}
