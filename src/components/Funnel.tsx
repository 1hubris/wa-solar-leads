"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShieldCheck, ArrowRight, Home, Battery, Zap, MapPin, User, ChevronLeft, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type LeadData = {
  homeowner: boolean | null;
  existingSystem: string;
  billSize: number;
  address: string;
  name: string;
  mobile: string;
  email: string;
};

export default function Funnel() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<LeadData>({
    homeowner: null,
    existingSystem: "",
    billSize: 400,
    address: "",
    name: "",
    mobile: "",
    email: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // Address Autocomplete State
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const updateData = (fields: Partial<LeadData>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  // Address fetch logic
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    updateData({ address: query });
    
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (query.length > 4) {
      setIsSearchingAddress(true);
      searchTimeout.current = setTimeout(async () => {
        try {
          const waQuery = query.toLowerCase().includes("wa") || query.toLowerCase().includes("western australia") ? query : `${query}, Western Australia`;
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(waQuery)}&format=json&addressdetails=1&countrycodes=au&limit=5`);
          const results = await res.json();
          setAddressSuggestions(results);
          setShowSuggestions(true);
        } catch(err) {
          console.error("Address fetch error", err);
        } finally {
          setIsSearchingAddress(false);
        }
      }, 600);
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      setIsSearchingAddress(false);
    }
  };

  const selectAddress = (addr: string) => {
    updateData({ address: addr });
    setShowSuggestions(false);
  };

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) throw new Error("Failed to submit");
      setIsSuccess(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculate5YearLoss = (bimonthlyBill: number) => {
    const yearlyBill = bimonthlyBill * 6;
    const r = 1.03; // 3% inflation per year
    // Geometric series sum: a * (r^n - 1) / (r - 1)
    const total = yearlyBill * (Math.pow(r, 5) - 1) / (r - 1);
    return Math.round(total);
  };

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-12 px-6 solid-card">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Request Received!</h2>
        <p className="text-slate-600 text-lg mb-8">
          Thank you, {data.name}. Our WA solar assessment team will contact you shortly on {data.mobile}.
        </p>
      </div>
    );
  }

  return (
    <div className="solid-card w-full mx-auto overflow-hidden relative">
      {/* Progress Bar */}
      <div className="bg-slate-100 h-2 w-full">
        <div 
          className="bg-primary-600 h-full transition-all duration-500 ease-out"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      <div className="p-6 md:p-10 min-h-[420px] flex flex-col">
        {step > 1 && (
          <button 
            onClick={prevStep}
            className="flex items-center text-slate-400 hover:text-slate-600 text-sm font-medium mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </button>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: Homeownership */}
          {step === 1 && (
            <motion.div key="step1" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-full mb-6 mx-auto">
                <Home className="w-6 h-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-2">
                Do you own your home in WA?
              </h2>
              <p className="text-center text-slate-500 mb-8">This assessment is currently for homeowners only.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => { updateData({ homeowner: true }); nextStep(); }} className="py-4 px-6 rounded-xl border-2 border-slate-200 hover:border-primary-500 hover:bg-primary-50 transition-all font-semibold text-lg text-slate-700">
                  Yes, I own it
                </button>
                <button onClick={() => { updateData({ homeowner: false }); nextStep(); }} className="py-4 px-6 rounded-xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all font-semibold text-lg text-slate-700">
                  No, I rent
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Existing System */}
          {step === 2 && data.homeowner === true && (
            <motion.div key="step2" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-full mb-6 mx-auto">
                <Battery className="w-6 h-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-8">
                Do you already have solar or a battery?
              </h2>
              <div className="grid gap-3">
                {["None", "Solar Only", "Solar & Battery"].map((opt) => (
                  <button key={opt} onClick={() => { updateData({ existingSystem: opt }); nextStep(); }} className={cn("py-4 px-6 rounded-xl border-2 text-left font-medium text-lg transition-all", data.existingSystem === opt ? "border-primary-600 bg-primary-50 text-primary-900" : "border-slate-200 hover:border-primary-300 text-slate-700 hover:bg-slate-50")}>
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* DISQUALIFY STEP (Renters) */}
          {step === 2 && data.homeowner === false && (
            <motion.div key="disqualify" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col justify-center text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Sorry, this assessment is for homeowners.</h2>
              <p className="text-slate-600 mb-8">You may need your landlord's permission to install solar.</p>
              <button onClick={() => setStep(1)} className="text-primary-600 font-medium hover:underline">Start Over</button>
            </motion.div>
          )}

          {/* STEP 3: Bill Size (Slider) */}
          {step === 3 && (
            <motion.div key="step3" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-full mb-6 mx-auto">
                <Zap className="w-6 h-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-2">
                What is your average Synergy bi-monthly bill?
              </h2>
              <p className="text-center text-slate-500 mb-8">Move the slider to calculate your 5-year projected power costs.</p>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center text-slate-700 font-bold px-2">
                  <span className="text-slate-400">$100</span>
                  <span className="text-4xl text-primary-600">${data.billSize}</span>
                  <span className="text-slate-400">$1000+</span>
                </div>
                
                <input 
                  type="range" 
                  min="100" 
                  max="1000" 
                  step="50"
                  value={data.billSize}
                  onChange={(e) => updateData({ billSize: parseInt(e.target.value) })}
                  className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />

                <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-center mt-6 shadow-sm">
                  <p className="text-xs text-red-600 font-bold mb-1 uppercase tracking-wider">Projected 5-Year Synergy Cost</p>
                  <p className="text-5xl font-black text-red-700 my-2">
                    ${calculate5YearLoss(data.billSize).toLocaleString()}
                  </p>
                </div>
                
                <button onClick={nextStep} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center text-lg mt-4 shadow-lg shadow-primary-600/30">
                  Continue <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Address */}
          {step === 4 && (
            <motion.div key="step4" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-full mb-6 mx-auto">
                <MapPin className="w-6 h-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-8">
                Where is the property located?
              </h2>
              
              <div className="space-y-4 relative">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Property Address</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={data.address}
                      onChange={handleAddressChange}
                      onFocus={() => { if(addressSuggestions.length > 0) setShowSuggestions(true); }}
                      placeholder="Start typing your address..."
                      className="w-full px-4 py-3 pr-10 rounded-xl border-2 border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 outline-none transition-all text-lg"
                    />
                    {isSearchingAddress && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                      </div>
                    )}
                  </div>

                  {/* Autocomplete Dropdown */}
                  <AnimatePresence>
                    {showSuggestions && addressSuggestions.length > 0 && (
                      <motion.ul 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
                      >
                        {addressSuggestions.map((suggestion, idx) => (
                          <li 
                            key={idx}
                            onClick={() => selectAddress(suggestion.display_name)}
                            className="px-4 py-3 hover:bg-primary-50 cursor-pointer border-b border-slate-100 last:border-0 text-sm text-slate-700"
                          >
                            {suggestion.display_name}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
                
                <button disabled={data.address.length < 5} onClick={nextStep} className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center text-lg shadow-lg shadow-primary-600/30">
                  Continue <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: Contact Info */}
          {step === 5 && (
            <motion.form key="step5" onSubmit={submitLead} variants={slideVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-full mb-6 mx-auto">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-2">
                Who should we send the assessment to?
              </h2>
              <p className="text-center text-slate-500 mb-6">Your details are secure and will only be used for this assessment.</p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input required type="text" value={data.name} onChange={(e) => updateData({ name: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary-500 outline-none transition-all" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
                  <input required type="tel" value={data.mobile} onChange={(e) => updateData({ mobile: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary-500 outline-none transition-all" placeholder="0400 000 000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input required type="email" value={data.email} onChange={(e) => updateData({ email: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary-500 outline-none transition-all" placeholder="john@example.com" />
                </div>
              </div>

              <div className="flex items-start gap-3 mb-8 bg-green-50/50 p-4 rounded-xl border border-green-200">
                <Lock className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>Strict Privacy Guarantee:</strong> Your data is secured with bank-level encryption and will strictly <em>only</em> be used for the purpose of finding the best product and company for your specific area in WA.
                </p>
              </div>

              {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

              <button type="submit" disabled={isSubmitting} className="w-full bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-accent-500/30 flex items-center justify-center text-lg hover:scale-[1.02] active:scale-95">
                {isSubmitting ? "Processing..." : "Get My Assessment Now"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
