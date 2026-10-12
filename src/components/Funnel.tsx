"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShieldCheck, ArrowRight, Home, Battery, Zap, MapPin, User, ChevronLeft, Loader2, Lock } from "lucide-react";

type LeadData = {
  homeowner: boolean | null;
  existingSystem: string;
  billSize: number;
  roofType: string;
  phasing: string;
  address: string;
  name: string;
  mobile: string;
  email: string;
  notes?: string;
};

export default function Funnel() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<LeadData>({
    homeowner: true,
    existingSystem: "None",
    billSize: 400,
    roofType: "Tile",
    phasing: "Single Phase",
    address: "",
    name: "",
    mobile: "",
    email: "",
    notes: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateData = (fields: Partial<LeadData>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData({ address: e.target.value });
  };

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setError("");
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const resData = await res.json();
      
      if (!res.ok) {
        throw new Error(resData.error || "Failed to submit assessment.");
      }
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please check your details and try again.");
      submitTimeoutRef.current = setTimeout(() => {
        setIsSubmitting(false);
      }, 2000);
      return;
    } 
    
    setIsSubmitting(false);
  };

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  if (isSuccess) {
    return (
      <div className="text-left py-8 px-6 sm:px-8 bg-white border border-[#ddd7ca] rounded-2xl shadow-xl">
        <div className="w-12 h-12 bg-[#1f6e58] text-white rounded-full flex items-center justify-center mb-5 text-xl font-bold shadow-md shadow-[#1f6e58]/20">
          <Check className="w-6 h-6 stroke-[3]" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102022] mb-3 leading-tight">
          Thank you for your submission.
        </h2>
        <p className="text-[#667376] text-base leading-relaxed mb-6 font-medium">
          A specialised design consultant will assist you in becoming a part of the Sunny State community.
        </p>
        <div className="bg-[#fbfaf7] border-l-4 border-[#df6f24] border-y border-r border-[#ddd7ca] rounded-xl p-4 sm:p-5 mb-6">
          <span className="text-xs uppercase tracking-wider font-extrabold text-[#df6f24] block mb-1">
            Project Intake Confirmed
          </span>
          <p className="text-xs text-[#667376] leading-relaxed">
            Your property and energy profile have been recorded. Our team will review your roof orientation, shading, and tariff structure to build your transparent project tender.
          </p>
        </div>
        <button
          onClick={() => { setIsSuccess(false); setStep(1); }}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#102022] hover:bg-[#172022] text-white font-bold text-sm transition-all shadow-md"
        >
          Submit Another Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#ddd7ca] rounded-2xl shadow-xl w-full mx-auto overflow-hidden relative">
      {/* Progress Bar */}
      <div className="bg-[#efe8da] h-2 w-full">
        <div 
          className="bg-[#df6f24] h-full transition-all duration-500 ease-out"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      <div className="p-6 md:p-8 min-h-[420px] flex flex-col">
        {step > 1 && (
          <button 
            onClick={prevStep}
            className="flex items-center text-[#667376] hover:text-[#102022] text-sm font-medium mb-4 transition-colors w-fit"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </button>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: Homeownership */}
          {step === 1 && (
            <motion.div key="step1" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-center w-12 h-12 bg-[#f6f3ec] text-[#df6f24] rounded-full mb-4 mx-auto border border-[#ddd7ca]">
                <Home className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center text-[#102022] mb-2">
                Do you own your home in WA?
              </h2>
              <p className="text-center text-[#667376] text-sm mb-6">This assessment is currently for homeowners.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => { updateData({ homeowner: true }); nextStep(); }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    data.homeowner === true
                      ? "border-[#df6f24] bg-[#fff7f0] ring-2 ring-[#df6f24]/20"
                      : "border-[#ddd7ca] bg-white hover:border-[#df6f24]"
                  }`}
                >
                  <strong className="block text-[#102022] text-sm font-bold">Yes, I own it</strong>
                  <span className="text-xs text-[#667376]">Continue to solar assessment</span>
                </button>

                <button
                  type="button"
                  onClick={() => { updateData({ homeowner: false }); nextStep(); }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    data.homeowner === false
                      ? "border-[#df6f24] bg-[#fff7f0] ring-2 ring-[#df6f24]/20"
                      : "border-[#ddd7ca] bg-white hover:border-[#df6f24]"
                  }`}
                >
                  <strong className="block text-[#102022] text-sm font-bold">No, I rent</strong>
                  <span className="text-xs text-[#667376]">Explore renter pathways</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Bill & Existing System */}
          {step === 2 && (
            <motion.div key="step2" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-center w-12 h-12 bg-[#f6f3ec] text-[#df6f24] rounded-full mb-4 mx-auto border border-[#ddd7ca]">
                <Zap className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center text-[#102022] mb-2">
                What is your bi-monthly power bill?
              </h2>
              <p className="text-center text-[#667376] text-sm mb-6">Select your typical Synergy or Horizon power bill.</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                {[
                  { label: "Under $250", value: 200 },
                  { label: "$250–$400", value: 350 },
                  { label: "$400–$600", value: 500 },
                  { label: "$600+", value: 750 },
                ].map((tier) => (
                  <button
                    key={tier.label}
                    type="button"
                    onClick={() => updateData({ billSize: tier.value })}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      data.billSize === tier.value
                        ? "border-[#df6f24] bg-[#fff7f0] text-[#df6f24] font-bold"
                        : "border-[#ddd7ca] bg-white text-[#102022] hover:border-[#df6f24]"
                    }`}
                  >
                    <span className="text-xs font-semibold block">{tier.label}</span>
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#102022] mb-2">Existing Solar Setup</label>
                <div className="grid grid-cols-3 gap-2">
                  {["None", "Solar Only", "Solar + Battery"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateData({ existingSystem: opt })}
                      className={`p-2.5 rounded-lg border text-center text-xs transition-all ${
                        data.existingSystem === opt
                          ? "border-[#df6f24] bg-[#fff7f0] text-[#df6f24] font-bold"
                          : "border-[#ddd7ca] bg-white text-[#667376] hover:border-[#df6f24]"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={nextStep}
                className="w-full bg-[#102022] hover:bg-[#172022] text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center text-sm shadow-md"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </motion.div>
          )}

          {/* STEP 3: Roof Type & Electrical Phase */}
          {step === 3 && (
            <motion.div key="step3" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col justify-center">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center text-[#102022] mb-2">
                What does your site look like?
              </h2>
              <p className="text-center text-[#667376] text-sm mb-6">Helps configure Western Power grid parameters.</p>

              <div className="mb-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#102022] mb-2">Roof Material</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Tile", "Colorbond", "Flat / Mixed", "Not sure"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => updateData({ roofType: r })}
                      className={`p-3 rounded-xl border text-center text-xs transition-all ${
                        data.roofType === r
                          ? "border-[#df6f24] bg-[#fff7f0] text-[#df6f24] font-bold"
                          : "border-[#ddd7ca] bg-white text-[#667376] hover:border-[#df6f24]"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#102022] mb-2">Electrical Phasing</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Single Phase", "3 Phase", "Not sure"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => updateData({ phasing: p })}
                      className={`p-3 rounded-xl border text-center text-xs transition-all ${
                        data.phasing === p
                          ? "border-[#df6f24] bg-[#fff7f0] text-[#df6f24] font-bold"
                          : "border-[#ddd7ca] bg-white text-[#667376] hover:border-[#df6f24]"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={nextStep}
                className="w-full bg-[#102022] hover:bg-[#172022] text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center text-sm shadow-md"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </motion.div>
          )}

          {/* STEP 4: Property Address */}
          {step === 4 && (
            <motion.div key="step4" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-center w-12 h-12 bg-[#f6f3ec] text-[#df6f24] rounded-full mb-4 mx-auto border border-[#ddd7ca]">
                <MapPin className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center text-[#102022] mb-2">
                Where is the property located?
              </h2>
              <p className="text-center text-[#667376] text-sm mb-6">Required to check local solar irradiance and grid connection rules.</p>
              
              <div className="mb-6">
                <input
                  type="text"
                  required
                  value={data.address}
                  onChange={handleAddressChange}
                  placeholder="e.g. 12 St Georges Terrace, Perth WA 6000"
                  className="w-full px-4 py-3 rounded-xl border border-[#ddd7ca] focus:border-[#df6f24] focus:ring-2 focus:ring-[#df6f24]/20 outline-none transition-all text-sm"
                />
              </div>

              <button
                disabled={data.address.length < 3}
                onClick={nextStep}
                className="w-full bg-[#102022] hover:bg-[#172022] disabled:bg-[#ddd7ca] disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center text-sm shadow-md"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </motion.div>
          )}

          {/* STEP 5: Contact Info */}
          {step === 5 && (
            <motion.form key="step5" onSubmit={submitLead} variants={slideVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-center w-12 h-12 bg-[#f6f3ec] text-[#df6f24] rounded-full mb-4 mx-auto border border-[#ddd7ca]">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center text-[#102022] mb-2">
                Where should we send the assessment?
              </h2>
              <p className="text-center text-[#667376] text-sm mb-4">Your details are kept confidential under our Epistemic Quarantine protocol.</p>
              
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-bold text-[#102022] mb-1">Full Name</label>
                  <input required maxLength={100} type="text" value={data.name} onChange={(e) => updateData({ name: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-[#ddd7ca] focus:border-[#df6f24] outline-none text-sm" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#102022] mb-1">Mobile Number</label>
                  <input required maxLength={20} pattern="^[0-9+\\s()-]+$" title="Valid phone number format only" type="tel" value={data.mobile} onChange={(e) => updateData({ mobile: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-[#ddd7ca] focus:border-[#df6f24] outline-none text-sm" placeholder="0400 000 000" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#102022] mb-1">Email Address</label>
                  <input required maxLength={150} type="email" value={data.email} onChange={(e) => updateData({ email: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-[#ddd7ca] focus:border-[#df6f24] outline-none text-sm" placeholder="john@example.com" />
                </div>
              </div>

              {error && <p className="text-red-600 text-xs mb-3 text-center">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#df6f24] hover:bg-[#c95716] text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center text-sm"
              >
                {isSubmitting ? "Transmitting Assessment..." : "Submit Solar Assessment →"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
