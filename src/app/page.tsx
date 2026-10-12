"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <Link href="/tender">Installer Network</Link>
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
              <h3>Escrow</h3>
              <p>Contribute to the community protection mechanism attached to eligible jobs.</p>
            </div>
            <div className="process-step">
              <div className="process-num">05</div>
              <h3>Install</h3>
              <p>Move from a controlled project brief to a vetted electrical company.</p>
            </div>
          </div>
        </section>

        {/* Philosophy: Solar should be designed before it is sold */}
        <section id="philosophy" className="section">
          <div className="container">
            <div className="kicker-row">
              <div>
                <div className="eyebrow">A better way to go solar</div>
                <h2 className="serif">Solar should be designed<br />before it is sold.</h2>
              </div>
              <p>Instead of starting with a salesperson, we start with your house, energy use and project requirements — then build a transparent procurement pathway around it.</p>
            </div>
            <div className="grid-3">
              <div className="card">
                <div className="icon">⌂</div>
                <h3>Energy Profile</h3>
                <p>We analyse your home, bills and future needs so the system is sized around actual consumption rather than a generic package.</p>
              </div>
              <div className="card">
                <div className="icon">⌗</div>
                <h3>Build Cost</h3>
                <p>We calculate the intended equipment, labour and site extras before an installer is selected, creating a single project price.</p>
              </div>
              <div className="card">
                <div className="icon">↗</div>
                <h3>Installer Match</h3>
                <p>We tender the defined project to suitable, vetted WA electrical companies instead of auctioning a raw homeowner lead.</p>
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
              <div className="flow-box"><strong>Risk</strong><span className="muted">thin margin, weaker resilience.</span></div>
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
              <div className="eyebrow">SunnyEX tender board</div>
              <h2 className="serif" style={{ fontSize: "clamp(46px,5vw,70px)", lineHeight: 1.02, margin: "20px 0" }}>
                Your quote isn't sent to three salespeople.
              </h2>
              <p className="hero-lead" style={{ fontSize: "18px" }}>
                Once the project is designed and priced, it enters a controlled marketplace where vetted installers can review the scope and claim jobs that fit their capacity.
              </p>
              <div className="hero-actions">
                <Link className="btn btn-primary" href="/tender">Explore the Network →</Link>
                <a className="btn btn-light" href="#process">See SunnyEX</a>
              </div>
            </div>

            <div className="market-card">
              <div className="market-card-top">
                <div className="market-id">Project #SSQ-1047</div>
                <div className="pill-live">Live Tender</div>
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
                <Link className="btn btn-accent" href="/tender">Claim Project →</Link>
              </div>
              <div style={{ marginTop: "16px", fontSize: "11px", color: "#9eb0af" }}>
                Homeowner PII remains confidential until an eligible installer claims the project.
              </div>
            </div>
          </div>
        </section>

        {/* Vetted WA Installer Network */}
        <section className="section" style={{ background: "#f4f0e8" }}>
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

        {/* Community Escrow Trust */}
        <section id="escrow" className="section escrow">
          <div className="container escrow-box">
            <div>
              <div className="eyebrow">Community escrow trust</div>
              <h2 className="serif" style={{ fontSize: "clamp(46px,5vw,70px)", lineHeight: 1.02, margin: "18px 0" }}>
                Your installer can change.<br />
                <span style={{ color: "var(--orange)" }}>Your protection shouldn't.</span>
              </h2>
              <p className="hero-lead" style={{ fontSize: "17px" }}>
                A defined contribution is attached to participating projects so that the platform can maintain a collective protection mechanism for eligible warranty obligations. The trust model is designed around durability, transparency and long-term homeowner confidence.
              </p>
              <Link className="btn btn-outline" href="/assessment" style={{ marginTop: "24px" }}>
                Get Protected Build →
              </Link>
            </div>

            <div className="escrow-visual">
              <div className="escrow-ring">
                <div><b>ESCROW</b><small>community reserve</small></div>
              </div>
              <div className="escrow-link"></div>
              <div className="escrow-link two"></div>
              <div className="escrow-badge">Protection mechanism • subject to terms</div>
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
                <Link href="/tender">Installer Network</Link>
                <a href="#escrow">Escrow</a>
              </div>
            </div>
            <div>
              <strong>Resources</strong>
              <div className="footer-links" style={{ marginTop: "12px" }}>
                <a href="#finance">Finance</a>
                <Link href="/assessment">Assessment</Link>
                <Link href="/tender">SunnyEX</Link>
              </div>
            </div>
            <div>
              <strong>Company</strong>
              <div className="footer-links" style={{ marginTop: "12px" }}>
                <a href="#">Privacy</a>
                <a href="#">Terms</a>
                <a href="#">Contact</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Sunny State Quotes. All rights reserved.</span>
            <span>Western Australia Solar Procurement System</span>
          </div>
        </div>
      </footer>
    </>
  );
}
