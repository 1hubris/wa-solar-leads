import re
import codecs

with codecs.open("src/app/pricing/page.tsx", "r", "utf-8") as f:
    code = f.read()

# 1. Update Vendor Logic to include Interest Rate (Lines 114 to 164)
block1_old = """  // 4. Automated Finance Matrix Resolution (High-Precision)
  let vendorFeePct = 0;
  
  if (financeVendor === "Plenti") {"""
block1_new = """  // 4. Automated Finance Matrix Resolution (High-Precision)
  let vendorFeePct = 0;
  let customerInterestRate = 0;
  
  if (financeVendor === "CommBank") {
    customerInterestRate = 0.0399;
  } else if (financeVendor === "NAB_Westpac") {
    customerInterestRate = 0.0599;
  } else if (financeVendor === "Broker") {
    customerInterestRate = 0.0699;
  } else if (financeVendor === "Plenti") {"""
code = code.replace(block1_old, block1_new)

# 1b. Fix Plenti/Brighte/Humm/Zip Green loans to have a customerInterestRate
code = code.replace(
    """if (loanType === "Standard Green Loan") vendorFeePct = 0.015;""",
    """if (loanType === "Standard Green Loan") { vendorFeePct = 0.015; customerInterestRate = 0.0999; }"""
)
code = code.replace(
    """if (loanType === "Standard Interest") vendorFeePct = 0.02;""",
    """if (loanType === "Standard Interest") { vendorFeePct = 0.02; customerInterestRate = 0.0999; }"""
)
code = code.replace(
    """if (loanType === "Standard Interest") vendorFeePct = 0.035;""",
    """if (loanType === "Standard Interest") { vendorFeePct = 0.035; customerInterestRate = 0.0999; }"""
)

# 2. Add Monthly Repayment math right after actualVendorFeeAmount
block2_old = """  // The actual dollar amount the Finance Company will deduct from the final financed quote
  const actualVendorFeeAmount = sellPrice * vendorFeePct;
  const cashReceivedFromFinance = sellPrice - actualVendorFeeAmount;"""
block2_new = """  // The actual dollar amount the Finance Company will deduct from the final financed quote
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
  }"""
code = code.replace(block2_old, block2_new)

# 3. Update handleVendorChange
block3_old = """  const handleVendorChange = (vendor: string) => {
    setFinanceVendor(vendor);
    if (vendor === "Cash" || vendor === "CommBank" || vendor === "NAB_Westpac" || vendor === "Broker") {
      setLoanType("");
      setLoanTerm(0);
    } else {
      setLoanType("0% Interest");
      setLoanTerm(36);
    }
  };"""
block3_new = """  const handleVendorChange = (vendor: string) => {
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
  };"""
code = code.replace(block3_old, block3_new)

# 4. Update the Select dropdown for Loan Type
block4_old = """                        <select 
                          value={loanType} 
                          onChange={(e) => handleLoanTypeChange(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-slate-200 focus:border-primary-500 text-sm outline-none bg-white"
                        >
                          <option value="0% Interest">0% Interest</option>
                          {financeVendor !== "Humm" && <option value="Standard Green Loan">Standard Green Loan</option>}
                        </select>"""
block4_new = """                        <select 
                          value={loanType} 
                          onChange={(e) => handleLoanTypeChange(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-slate-200 focus:border-primary-500 text-sm outline-none bg-white disabled:bg-slate-50 disabled:text-slate-500"
                          disabled={financeVendor === "CommBank" || financeVendor === "NAB_Westpac" || financeVendor === "Broker"}
                        >
                          {financeVendor === "CommBank" || financeVendor === "NAB_Westpac" || financeVendor === "Broker" ? (
                            <option value={loanType}>{loanType}</option>
                          ) : (
                            <>
                              <option value="0% Interest">0% Interest</option>
                              {financeVendor !== "Humm" && <option value="Standard Green Loan">Standard Green Loan</option>}
                            </>
                          )}
                        </select>"""
code = code.replace(block4_old, block4_new)

# 5. Update the Term Length dropdown
block5_old = """                          {loanType === "0% Interest" ? (
                            <>
                              <option value="12">12 Months</option>
                              <option value="24">24 Months</option>
                              <option value="36">36 Months</option>
                              <option value="48">48 Months</option>
                              <option value="60">60 Months</option>
                              <option value="72">72 Months</option>
                              <option value="84">84 Months (7 Years)</option>
                              <option value="120">120 Months (10 Years)</option>
                            </>
                          ) : (
                            <>
                              <option value="36">36 Months (Standard)</option>
                              <option value="60">60 Months (Standard)</option>
                              <option value="84">84 Months (Standard)</option>
                              <option value="120">120 Months (Standard)</option>
                            </>
                          )}"""
block5_new = """                          {financeVendor === "CommBank" || financeVendor === "NAB_Westpac" || financeVendor === "Broker" ? (
                            <>
                              <option value="36">36 Months (3 Years)</option>
                              <option value="60">60 Months (5 Years)</option>
                              <option value="84">84 Months (7 Years)</option>
                              <option value="120">120 Months (10 Years)</option>
                            </>
                          ) : loanType === "0% Interest" ? (
                            <>
                              <option value="12">12 Months</option>
                              <option value="24">24 Months</option>
                              <option value="36">36 Months</option>
                              <option value="48">48 Months</option>
                              <option value="60">60 Months</option>
                              <option value="72">72 Months</option>
                              <option value="84">84 Months (7 Years)</option>
                              <option value="120">120 Months (10 Years)</option>
                            </>
                          ) : (
                            <>
                              <option value="36">36 Months (Standard)</option>
                              <option value="60">60 Months (Standard)</option>
                              <option value="84">84 Months (Standard)</option>
                              <option value="120">120 Months (Standard)</option>
                            </>
                          )}"""
code = code.replace(block5_old, block5_new)

# 6. Update the Quote display
block6_old = """                <div className="border-t border-primary-700 pt-3 flex justify-between text-lg font-bold text-accent-400">
                  <span>Final Customer Quote (Out of Pocket)</span>
                  <span>${sellPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="text-right text-xs text-slate-500 font-semibold mt-1">
                  (Absolute Minimum Floor: ${netFloorPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})
                </div>"""
block6_new = """                <div className="border-t border-primary-700 pt-3 flex justify-between text-lg font-bold text-accent-400">
                  <span>Final Customer Quote (Principal)</span>
                  <span>${sellPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                {financeVendor !== "Cash" && loanTerm > 0 && (
                  <div className="mt-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                      <span>Interest Rate (Est.)</span>
                      <span>{customerInterestRate > 0 ? (customerInterestRate * 100).toFixed(2) + "% p.a." : "0% Interest"} over {loanTerm} months</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-white mb-2">
                      <span>Estimated Monthly Repayment</span>
                      <span className="text-emerald-400">${monthlyRepayment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} /mo</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-700 pt-2 mt-2">
                      <span>Total Repayable (Gross Cost)</span>
                      <span>${totalCustomerCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                  </div>
                )}
                <div className="text-right text-xs text-slate-500 font-semibold mt-3">
                  (Absolute Minimum Floor: ${netFloorPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})
                </div>"""
code = code.replace(block6_old, block6_new)

with codecs.open("src/app/pricing/page.tsx", "w", "utf-8") as f:
    f.write(code)
print("Updated successfully")
