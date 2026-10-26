"use client";

import Link from "next/link";
import Funnel from "@/components/Funnel";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function AssessmentPage() {
  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#102022] font-sans">
      {/* Header */}
      <header className="site-header">
        <div className="container nav">
          <Link className="brand" href="/">
            <span className="brand-mark" aria-hidden="true"></span>
            <span>
              <span className="brand-name">Sunny State Quotes</span>
              <span className="brand-sub">WA Solar Assessments</span>
            </span>
          </Link>
          <div className="nav-cta">
            <Link className="btn btn-light text-xs" href="/">
              ← Back to Overview
            </Link>
          </div>
        </div>
      </header>

      {/* Main Assessment Intake */}
      <main className="py-12 md:py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Context Column */}
            <div className="lg:col-span-5">
              <div className="eyebrow mb-3">WA homeowner assessment</div>
              <h1 className="serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
                Let's define the project before we quote it.
              </h1>
              <p className="text-sm sm:text-base text-[#4f5c5f] leading-relaxed mb-8">
                Your intake information becomes the foundation of your engineering project brief. We capture key property and energy parameters, establish fixed equipment costs, then tender the build to vetted WA electrical companies.
              </p>

              <div className="bg-[#173335] text-white rounded-2xl p-6 sm:p-8 shadow-xl">
                <h3 className="font-serif text-xl sm:text-2xl font-bold mb-3">
                  Your information builds your engineering brief.
                </h3>
                <p className="text-xs sm:text-sm text-[#c7d2d1] leading-relaxed mb-6">
                  In under 60 seconds, we capture the essential property and tariff details needed to model your roof layout, rebate eligibility, and fixed build price—without sending salespeople to your door.
                </p>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">✓</span>
                    <span>Property + household consumption</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">✓</span>
                    <span>Bi-monthly bill + Synergy/Horizon tariff</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">✓</span>
                    <span>Roof material + electrical phasing</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">✓</span>
                    <span>100% private — never sold to multi-quote lead brokers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Multi-Step Interactive Funnel */}
            <div className="lg:col-span-7">
              <Funnel />
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#ddd7ca] py-8 bg-[#fbfaf7]">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#667376]">
          <span>© {new Date().getFullYear()} Sunny State Quotes</span>
          <Link href="/" className="hover:text-[#102022] font-semibold">
            Back to homepage →
          </Link>
        </div>
      </footer>
    </div>
  );
}
