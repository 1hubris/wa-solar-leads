"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  return (
    <>
      {/* Site Header */}
      <header className="site-header">
        <div className="container nav">
          <Link className="brand" href="/">
            <span className="brand-mark" aria-hidden="true"></span>
            <span>
              <span className="brand-name">Sunny State Quotes</span>
              <span className="brand-sub">WA Solar Assessments</span>
            </span>
          </Link>

          <nav className={`nav-links ${mobileMenuOpen ? "!flex !flex-col !absolute !top-[68px] !left-0 !right-0 !bg-[#fbfaf7]/98 !p-6 !border-b !border-[#ddd7ca]" : ""}`}>
            <Link className="active" href="/">Home</Link>
            <a href="#process">How It Works</a>
            <a href="#philosophy">Why Us</a>
            <a href="#network">Installer Network</a>
            <a href="#finance">Finance</a>
            <a href="#escrow">Escrow</a>
          </nav>

          <div className="nav-cta">
            <Link className="btn btn-light" href="/assessment">Start Assessment</Link>
            <button className="menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
              ☰
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section with Architectural Solar House & Floating Cards */}
        <section className="hero">
          <div className="container hero-grid">
            
            {/* Left Column: Editorial Copy */}
            <div className="hero-copy">
              <div className="eyebrow">Independent solar design + procurement</div>
              <h1>
                Know what you need.<br />
                <span>Know what it should cost.</span>
              </h1>
              <p className="hero-lead">
                We assess your home and energy use, design the right solar system, establish a transparent build price, then tender the project to a vetted Western Australian electrical company.
              </p>
              <div className="hero-actions">
                <Link className="btn btn-primary" href="/assessment">
                  Start My Assessment <span>→</span>
                </Link>
                <a className="btn btn-light" href="#process">See How It Works</a>
              </div>
              <div className="hero-proof">
                <div className="proof">
                  <strong>4.4★+</strong>
                  <span>Minimum installer rating</span>
                </div>
                <div className="proof">
                  <strong>10 yr</strong>
                  <span>Workmanship target</span>
                </div>
                <div className="proof">
                  <strong>65+</strong>
                  <span>Verified reviews target</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Mock of the Solar Home & Floating Telemetry Cards */}
            <div className="hero-visual">
              <div className="home-scene">
                <div className="sky">
                  <div className="sun"></div>
                  <div className="hill"></div>
                  <div className="house">
                    <div className="roof"></div>
                    <div className="panel-grid">
                      <span></span><span></span><span></span><span></span>
                      <span></span><span></span><span></span><span></span>
                      <span></span><span></span><span></span><span></span>
                      <span></span><span></span><span></span><span></span>
                      <span></span><span></span><span></span><span></span>
                      <span></span><span></span><span></span><span></span>
                      <span></span><span></span><span></span><span></span>
                      <span></span><span></span><span></span><span></span>
                    </div>
                    <div className="window left"></div>
                    <div className="window right"></div>
                    <div className="door"></div>
                  </div>
                  <div className="lawn"></div>
                </div>
              </div>

              <div className="float-card card-energy">
                <span className="check">✓</span>
                <strong>Energy profile</strong>
                <span>Your home, bills and household needs.</span>
              </div>

              <div className="float-card card-design">
                <span className="check">✓</span>
                <strong>System design</strong>
                <span>Built around your actual energy use.</span>
              </div>

              <div className="float-card card-price">
                <span className="check">✓</span>
                <strong>Quoted build</strong>
                <span>Transparent system cost before installer selection.</span>
              </div>

              <div className="float-card card-escrow">
                <span className="check">✓</span>
                <strong>Escrow protection</strong>
                <span>Funds are structured to support eligible warranty obligations.</span>
              </div>

              <div className="float-card card-match">
                <span className="check">✓</span>
                <strong>Installer match</strong>
                <span>Vetted WA electrical companies matched to your project.</span>
              </div>
            </div>

          </div>
        </section>

        {/* 5-Step Process Strip */}
        <section id="process" className="process">
          <div className="container process-grid">
            <div className="process-step">
              <div className="process-num">01</div>
              <h3>Design First</h3>
              <p>Model the home and energy use before an installer enters the picture.</p>
            </div>
            <div className="process-step">
              <div className="process-num">02</div>
              <h3>Price Before Installer</h3>
              <p>Know the build economics before selecting who installs it.</p>
            </div>
            <div className="process-step">
              <div className="process-num">03</div>
              <h3>Tender the Project</h3>
              <p>Send a defined project into the SunnyEX installer marketplace.</p>
            </div>
            <div className="process-step">
              <div className="process-num">04</div>
              <h3>Escrow Reserve</h3>
              <p>Backed by an internal platform reserve allocated to eligible builds at no extra cost.</p>
            </div>
            <div className="process-step">
              <div className="process-num">05</div>
              <h3>Install</h3>
              <p>Move from a controlled project brief to a vetted electrical company.</p>
            </div>
          </div>
        </section>

        {/* Philosophy: No door knockers. Escrow-protected solar. */}
        <section id="philosophy" className="section">
          <div className="container">
            <div className="kicker-row">
              <div>
                <div className="eyebrow">A better way to go solar</div>
                <h2 className="serif">No door knockers.<br />Escrow-protected solar.</h2>
              </div>
              <p>Traditional solar companies inflate system prices to fund aggressive door knockers and high-pressure sales commissions. Our pricing architecture removes those commissions from the equation—allowing our in-house design consultants to deliver comfortable, accurate consultations, fair pricing, and Escrow-protected installs.</p>
            </div>
            <div className="grid-3">
              <div className="card">
                <div className="icon">⌂</div>
                <h3>No Bloated Commissions</h3>
                <p>By removing door knockers and aggressive sales-rep commissions from the equation, our pricing model keeps your solar installation fair, comfortable, and genuinely affordable.</p>
              </div>
              <div className="card">
                <div className="icon">⌗</div>
                <h3>Escrow Reserve First</h3>
                <p>Our Community Escrow Reserve is the core pillar of every build—allocating a dedicated orphaned-warranty reserve to eligible projects so you aren&apos;t left stranded if an original installer ever closes its doors.</p>
              </div>
              <div className="card">
                <div className="icon">↗</div>
                <h3>In-House Design &amp; Vetted Install</h3>
                <p>Our specialised in-house design consultants work with you comfortably to engineer the exact system your home needs, then dispatch the build to a vetted WA electrical company.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Industry Problem: The 3-quote race to the bottom */}
        <section className="section compare">
          <div className="container">
            <div className="kicker-row">
              <div>
                <div className="eyebrow">The industry problem</div>
                <h2 className="serif" style={{ color: "#fff" }}>The 3-quote race to the bottom.</h2>
              </div>
              <p className="muted">Sunny State Quotes replaces competitive discounting with a defined project, transparent economics and a controlled tender.</p>
            </div>
            <div className="flow">
              <div className="flow-box"><strong>Homeowner</strong><span className="muted">wants a fair system.</span></div>
              <div className="flow-arrow">→</div>
              <div className="flow-box"><strong>Raw lead</strong><span className="muted">sold to multiple installers.</span></div>
              <div className="flow-arrow">→</div>
              <div className="flow-box"><strong>Price war</strong><span className="muted">margin is the battleground.</span></div>
              <div className="flow-arrow">→</div>
              <div className="flow-box"><strong>Risk</strong><span className="muted">Corners get cut, subcontractors do half the job and you pay the price.</span></div>
            </div>
            <div className="rule" style={{ background: "rgba(255,255,255,.1)", margin: "42px 0" }}></div>
            <div className="flow">
              <div className="flow-box"><strong>Homeowner</strong><span className="muted">shares energy + property data.</span></div>
              <div className="flow-arrow">→</div>
              <div className="flow-box"><strong>Design</strong><span className="muted">the system is defined first.</span></div>
              <div className="flow-arrow">→</div>
              <div className="flow-box"><strong>SunnyEX</strong><span className="muted">qualified project tender.</span></div>
              <div className="flow-arrow">→</div>
              <div className="flow-box"><strong>Escrow</strong><span className="muted">protection mechanism.</span></div>
            </div>
          </div>
        </section>

        {/* SunnyEX Tender Board */}
        <section className="section">
          <div className="container market-shell">
            <div>
              <div className="eyebrow">Private installer dispatch</div>
              <h2 className="serif" style={{ fontSize: "clamp(46px,5vw,70px)", lineHeight: 1.02, margin: "20px 0" }}>
                Your quote isn't sent to three salespeople.
              </h2>
              <p className="hero-lead" style={{ fontSize: "18px" }}>
                Once your system is designed with our in-house consultant and priced transparently, it enters our private commercial marketplace where vetted WA electrical companies claim jobs that fit their capacity.
              </p>
            </div>

            <div className="market-card">
              <div className="market-card-top">
                <div className="market-id">Project #SSQ-1047</div>
                <div className="pill-live">Private Tender</div>
              </div>
              <div className="market-title">Perth Metro · Tile Roof · 3 Phase</div>
              <div className="market-meta">
                <span>13 × 475W</span>
                <span>Hybrid Inverter</span>
                <span>Battery</span>
                <span>Removal</span>
              </div>
              <div className="market-price">
                <div>
                  <small>Indicative project economics</small>
                  <strong>$4,200.00</strong>
                </div>
                <span className="btn btn-accent" style={{ pointerEvents: "none", cursor: "default" }}>Vetted Partners Only</span>
              </div>
              <div style={{ marginTop: "16px", fontSize: "11px", color: "#9eb0af" }}>
                Private B2B dispatch terminal — Homeowner PII remains quarantined until an accredited WA installer is assigned.
              </div>
            </div>
          </div>
        </section>

        {/* Vetted WA Installer Network */}
        <section id="network" className="section" style={{ background: "#f4f0e8" }}>
          <div className="container network">
            <div>
              <div className="eyebrow">Vetted WA installer network</div>
              <h2 className="serif" style={{ fontSize: "clamp(44px,5vw,68px)", lineHeight: 1.02, margin: "18px 0" }}>
                Then the build goes to the right installer.
              </h2>
              <p className="hero-lead" style={{ fontSize: "17px" }}>
                Your project is matched to a suitable electrical company based on location, system complexity and job requirements. Not a public directory — a controlled network.
              </p>
              <div className="tag" style={{ marginTop: "22px" }}>CEC-accredited partners</div>
            </div>

            <div className="network-diagram">
              <div className="node"><small>3 Phase</small><b>Switchboard requirement</b></div>
              <div className="node"><small>Battery</small><b>Storage installation</b></div>
              <div className="node"><small>Tile Roof</small><b>Roofing complexity</b></div>
              <div className="node"><small>Large System</small><b>High-capacity project</b></div>
              <div className="node"><small>Perth Metro</small><b>Service area</b></div>
              <div className="node"><small>Electrical Co.</small><b>Vetted WA partner</b></div>
              <div className="node"><small>Electrical Co.</small><b>Capacity available</b></div>
              <div className="node"><small>Electrical Co.</small><b>Project fit</b></div>
              <div className="network-center">
                SUNNYEX<span>pre-quoted project</span>
              </div>
            </div>
          </div>
        </section>

        {/* Community Escrow Reserve */}
        <section id="escrow" className="section escrow">
          <div className="container escrow-box">
            <div>
              <div className="eyebrow">Community escrow reserve</div>
              <h2 className="serif" style={{ fontSize: "clamp(46px,5vw,70px)", lineHeight: 1.02, margin: "18px 0" }}>
                Your installer can change.<br />
                <span style={{ color: "var(--orange)" }}>Your protection shouldn&apos;t.</span>
              </h2>
              <p className="hero-lead" style={{ fontSize: "17px" }}>
                On every participating build, Sunny State allocates a dedicated portion of its platform fee into our Community Protection Reserve to backstop eligible orphaned workmanship obligations if an assigned installer ever ceases trading. The reserve model is designed around durability, transparency, and long-term homeowner confidence.
              </p>
              <p style={{ marginTop: "14px", fontSize: "12px", lineHeight: 1.55, color: "#6e6a63", maxWidth: "560px" }}>
                *Incidental discretionary corporate reserve operated under s 763E of the <em>Corporations Act 2001</em> (Cth) covering verified orphaned installation workmanship up to $17,000 AUD if an accredited WA installer enters formal external administration. Provided in addition to statutory consumer guarantees under the Australian Consumer Law.{" "}
                <button
                  type="button"
                  onClick={() => setTermsModalOpen(true)}
                  style={{ background: "none", border: "none", padding: 0, color: "var(--orange)", textDecoration: "underline", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
                >
                  View Reserve Terms
                </button>
              </p>
              <Link className="btn btn-outline" href="/assessment" style={{ marginTop: "20px" }}>
                Get Protected Build →
              </Link>
            </div>

            <div className="escrow-visual">
              <div className="escrow-ring">
                <div><b>ESCROW</b><small>community reserve</small></div>
              </div>
              <div className="escrow-link"></div>
              <div className="escrow-link two"></div>
              <button
                type="button"
                onClick={() => setTermsModalOpen(true)}
                className="escrow-badge"
                style={{ cursor: "pointer", border: "none" }}
                title="View Community Protection Reserve Terms"
              >
                Protection mechanism • subject to terms
              </button>
            </div>
          </div>
        </section>

        {/* Finance Section */}
        <section id="finance" className="section finance">
          <div className="container">
            <div className="kicker-row">
              <div>
                <div className="eyebrow">Finance without the sales trap</div>
                <h2 className="serif">Choose how you pay.<br />Not which salesperson you get.</h2>
              </div>
              <p>Keep the system design and project price independent from the finance option. Explore home-loan pathways or specialist finance only after the build is understood.</p>
            </div>
            <div className="grid-3">
              <div className="card finance-card">
                <div className="icon">⌂</div>
                <h3>Home Energy Loan</h3>
                <p>Explore green loan options through a bank or mortgage provider.</p>
                <div className="rate">Home-loan pathway</div>
              </div>
              <div className="card finance-card">
                <div className="icon">◎</div>
                <h3>Green Mortgage Top-Up</h3>
                <p>Use available equity or an existing home loan structure where suitable.</p>
                <div className="rate">Flexible structure</div>
              </div>
              <div className="card finance-card">
                <div className="icon">▣</div>
                <h3>Unsecured Option</h3>
                <p>For homeowners who want a specialist application rather than a home-loan route.</p>
                <div className="rate">Specialist finance</div>
              </div>
            </div>
            <p className="finance-note">Rates, eligibility and lender availability change over time. Finance is optional and separate from system design.</p>
          </div>
        </section>

        {/* What You Actually Get */}
        <section className="section">
          <div className="container">
            <div className="kicker-row">
              <div>
                <div className="eyebrow">What you actually get</div>
                <h2 className="serif">One project brief.<br />One transparent pathway.</h2>
              </div>
              <p>From assessment to installer claim, the process is designed to reduce noise and keep the homeowner focused on the actual system, economics and outcome.</p>
            </div>
            <div className="grid-4">
              <div className="card">
                <div className="icon">01</div>
                <h3>Assess</h3>
                <p>Property, energy use, goals and site requirements.</p>
              </div>
              <div className="card">
                <div className="icon">02</div>
                <h3>Design</h3>
                <p>System architecture and equipment selection.</p>
              </div>
              <div className="card">
                <div className="icon">03</div>
                <h3>Quote</h3>
                <p>Defined build cost before installer matching.</p>
              </div>
              <div className="card">
                <div className="icon">04</div>
                <h3>Protect</h3>
                <p>Community escrow attached to eligible jobs.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Band */}
        <section className="section cta-band">
          <div className="container cta-wrap">
            <div>
              <div className="eyebrow">Take the first step</div>
              <h2 className="serif">Get the system designed before you buy it.</h2>
              <p>Start with a short WA homeowner assessment. The output is the project brief the rest of the process works from.</p>
            </div>
            <Link className="btn btn-accent" href="/assessment">
              Start My Solar Assessment →
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <Link className="brand" href="/">
                <span className="brand-mark" aria-hidden="true"></span>
                <span>
                  <span className="brand-name" style={{ color: "#fff" }}>Sunny State Quotes</span>
                  <span className="brand-sub" style={{ color: "#7f8d8b" }}>WA Solar Assessments</span>
                </span>
              </Link>
              <p style={{ maxWidth: "380px", color: "#99a8a5", fontSize: "13px", marginTop: "16px" }}>
                Independent solar information, design and procurement for Western Australian homeowners.
              </p>
            </div>
            <div>
              <strong>Explore</strong>
              <div className="footer-links" style={{ marginTop: "12px" }}>
                <a href="#process">How It Works</a>
                <a href="#philosophy">Why Us</a>
                <a href="#network">Installer Network</a>
                <a href="#escrow">Escrow</a>
              </div>
            </div>
            <div>
              <strong>Resources</strong>
              <div className="footer-links" style={{ marginTop: "12px" }}>
                <a href="#finance">Finance</a>
                <Link href="/assessment">Assessment</Link>
              </div>
            </div>
            <div>
              <strong>Company</strong>
              <div className="footer-links" style={{ marginTop: "12px" }}>
                <button type="button" onClick={() => setTermsModalOpen(true)} style={{ background: "none", border: "none", padding: 0, color: "inherit", cursor: "pointer", textAlign: "left", font: "inherit" }}>Privacy &amp; Data</button>
                <button type="button" onClick={() => setTermsModalOpen(true)} style={{ background: "none", border: "none", padding: 0, color: "inherit", cursor: "pointer", textAlign: "left", font: "inherit" }}>Reserve &amp; Platform Terms</button>
                <Link href="/assessment">Contact</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Sunny State Quotes. All rights reserved.</span>
            <span>Western Australia Solar Procurement System</span>
          </div>
        </div>
      </footer>

      {termsModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reserve-terms-title"
          onClick={() => setTermsModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(12, 18, 17, 0.72)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fbfaf7",
              color: "#14201f",
              maxWidth: "680px",
              width: "100%",
              maxHeight: "85vh",
              overflowY: "auto",
              borderRadius: "18px",
              padding: "32px",
              border: "1px solid #ddd7ca",
              boxShadow: "0 24px 60px rgba(0,0,0,0.35)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: "6px" }}>Statutory &amp; Reserve Governance</div>
                <h3 id="reserve-terms-title" className="serif" style={{ fontSize: "28px", margin: 0 }}>
                  Community Protection Reserve &amp; Platform Terms
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTermsModalOpen(false)}
                aria-label="Close terms"
                style={{ background: "#eee9dd", border: "none", borderRadius: "999px", width: "34px", height: "34px", cursor: "pointer", fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginTop: "20px", fontSize: "14px", lineHeight: 1.65, color: "#2d3a39", display: "grid", gap: "14px" }}>
              <p style={{ margin: 0 }}>
                <strong>1. Independent Design &amp; Procurement Role:</strong> Sunny State Quotes acts as an independent solar design, assessment, and commercial procurement clearinghouse. Your physical installation contract and statutory Electrical Safety Certificate (ESC) under the <em>Electricity (Licensing) Regulations 1991</em> (WA) are executed directly by the assigned CEC-accredited and WA-licensed electrical contractor.
              </p>
              <p style={{ margin: 0 }}>
                <strong>2. Incidental Corporate Reserve (s 763E Corporations Act 2001):</strong> On participating builds, Sunny State Quotes allocates $650 AUD from its internal platform clearing fee into its balance-sheet Community Protection Reserve (provisioned under AASB 137). The Reserve is an incidental, discretionary corporate warranty support mechanism under s 763E of the <em>Corporations Act 2001</em> (Cth)—not a standalone contract of insurance, managed investment scheme, or statutory trust.
              </p>
              <p style={{ margin: 0 }}>
                <strong>3. Three-Gate Orphaned Workmanship Eligibility:</strong> Reserve remediation is triggered where:
                <br />• <strong>Gate 1 (Formal Installer Insolvency):</strong> The original installing electrical company has entered formal ASIC external administration/liquidation (Form 505) and ceased holding an active WA electrical contractor licence (solvent installers remain contractually bound to remediate defects within 14 days).
                <br />• <strong>Gate 2 (Workmanship vs. OEM Hardware):</strong> The defect arises from orphaned installation workmanship that a secondary WA electrician cannot legally certify without system strip-and-replacement (pure hardware faults remain covered directly by the equipment manufacturer under s 271 of the Australian Consumer Law).
                <br />• <strong>Gate 3 (Per-Property Cap &amp; Solvency Floor):</strong> Approved orphaned system replacements are capped at <strong>$17,000 AUD</strong> (wholesale replacement value benchmarked up to a 13.2kW PV, 10kW Inverter, and 20kWh Battery system) and are disbursed from available Reserve funds above the platform&apos;s $50,000 AUD Solvency Floor.
              </p>
              <p style={{ margin: 0 }}>
                <strong>4. Australian Consumer Law Preservation:</strong> Nothing in these terms excludes, restricts, or modifies any statutory consumer guarantee, right, or remedy conferred by the Australian Consumer Law (Schedule 2 to the <em>Competition and Consumer Act 2010</em> (Cth)).
              </p>
            </div>

            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setTermsModalOpen(false)}
                className="btn btn-primary"
                style={{ cursor: "pointer" }}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
