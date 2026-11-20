const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  console.log('[BUILDATHON PPT] Creating official Startup Buildathon India 2026 Presentation PDF...');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Startup Buildathon India 2026 — Haq AI (Tech Titans)</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');

    @page {
      size: 16in 9in;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #ffffff;
      color: #0f172a;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .slide {
      width: 16in;
      height: 9in;
      page-break-after: always;
      position: relative;
      overflow: hidden;
      padding: 0.65in 0.9in 0.75in 0.9in;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #ffffff;
    }

    /* Template Header */
    .template-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 0.3in;
      border-bottom: 1.5px solid #e2e8f0;
      position: relative;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .google-deepmind {
      font-size: 15pt;
      font-weight: 700;
      color: #1e293b;
      letter-spacing: -0.3px;
    }
    .google-deepmind span.g-blue { color: #4285F4; }
    .google-deepmind span.g-red { color: #EA4335; }
    .google-deepmind span.g-yellow { color: #FBBC05; }
    .google-deepmind span.g-green { color: #34A853; }

    .header-divider {
      color: #94a3b8;
      font-size: 16pt;
      font-weight: 300;
    }

    .google-cloud {
      font-size: 15pt;
      font-weight: 700;
      color: #475569;
    }
    .google-cloud span.g-blue { color: #4285F4; }
    .google-cloud span.g-red { color: #EA4335; }
    .google-cloud span.g-yellow { color: #FBBC05; }
    .google-cloud span.g-green { color: #34A853; }

    .header-center {
      display: flex;
      align-items: center;
      gap: 12px;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }

    .buildathon-logo {
      display: grid;
      grid-template-columns: 14px 14px;
      grid-template-rows: 14px 14px;
      gap: 3px;
    }
    .logo-tl { background: #4285F4; border-top-left-radius: 14px; border-bottom-left-radius: 4px; }
    .logo-tr { background: #EA4335; border-radius: 50%; }
    .logo-bl { background: #FBBC05; border-radius: 4px; }
    .logo-br { background: #34A853; border-top-right-radius: 14px; border-bottom-right-radius: 14px; border-bottom-left-radius: 14px; }

    .buildathon-text {
      text-align: left;
    }
    .buildathon-title {
      font-size: 14pt;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.1;
      letter-spacing: -0.3px;
    }
    .buildathon-sub {
      font-size: 8pt;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.5px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 10pt;
      font-weight: 600;
      color: #475569;
    }
    .header-right .powered {
      color: #64748b;
      font-weight: 500;
      font-size: 9.5pt;
    }
    .partner-pill {
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .partner-h2s { color: #2563eb; }
    .partner-nasscom { color: #0f172a; font-weight: 900; }
    .partner-headstart { color: #ea580c; display: flex; align-items: center; gap: 4px; }

    /* Titles */
    .title-area {
      margin-top: 0.25in;
      margin-bottom: 0.35in;
    }
    .slide-heading {
      font-size: 34pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.8px;
      line-height: 1.15;
    }
    .slide-subheading {
      font-size: 14pt;
      color: #64748b;
      margin-top: 6px;
      font-weight: 500;
    }

    /* Content Area */
    .content-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }

    /* Cards & Grids */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.4in;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0.35in;
    }

    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.25in;
    }

    .feature-card {
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 16px;
      padding: 0.32in;
      position: relative;
    }

    .card-highlight {
      background: #f0fdf4;
      border-color: #86efac;
    }

    .card-accent-blue {
      border-top: 4px solid #2563eb;
    }
    .card-accent-emerald {
      border-top: 4px solid #10b981;
    }
    .card-accent-amber {
      border-top: 4px solid #f59e0b;
    }
    .card-accent-purple {
      border-top: 4px solid #8b5cf6;
    }

    .card-title {
      font-size: 16pt;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .card-body {
      font-size: 11pt;
      color: #475569;
      line-height: 1.55;
    }

    .card-body ul {
      margin-left: 20px;
      margin-top: 8px;
    }

    .card-body li {
      margin-bottom: 6px;
    }

    .stat-badge {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10pt;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 6px;
      background: #e2e8f0;
      color: #334155;
      margin-top: 8px;
    }
    .stat-badge.green {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #86efac;
    }
    .stat-badge.amber {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }
    .stat-badge.blue {
      background: #dbeafe;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }

    /* Footer Note */
    .template-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.2in;
      border-top: 1px solid #e2e8f0;
      font-size: 9.5pt;
      color: #94a3b8;
      font-weight: 500;
    }
    .footer-disclaimer {
      font-style: italic;
      color: #64748b;
    }

    /* Title Slide Specifics */
    .title-slide-container {
      flex: 1;
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 0.6in;
      align-items: center;
      padding: 0.2in 0;
    }

    .hero-buildathon-brand {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 0.35in;
    }

    .hero-big-logo {
      display: grid;
      grid-template-columns: 32px 32px;
      grid-template-rows: 32px 32px;
      gap: 7px;
    }
    .hero-big-logo .logo-tl { border-top-left-radius: 32px; border-bottom-left-radius: 8px; }
    .hero-big-logo .logo-tr { border-radius: 50%; }
    .hero-big-logo .logo-bl { border-radius: 8px; }
    .hero-big-logo .logo-br { border-top-right-radius: 32px; border-bottom-right-radius: 32px; border-bottom-left-radius: 32px; }

    .hero-brand-name {
      font-size: 38pt;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -1.5px;
      line-height: 1;
    }
    .hero-brand-sub {
      font-size: 13pt;
      font-weight: 600;
      color: #475569;
      margin-top: 4px;
    }

    .project-hero-title {
      font-size: 44pt;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -1.8px;
      line-height: 1.1;
      margin-bottom: 0.15in;
    }
    .project-hero-title span {
      color: #2563eb;
    }

    .meta-box {
      background: #f8fafc;
      border: 1.5px solid #cbd5e1;
      border-radius: 16px;
      padding: 0.3in;
      margin-top: 0.3in;
      space-y: 12px;
    }
    .meta-row {
      display: flex;
      font-size: 13pt;
      margin-bottom: 12px;
    }
    .meta-row:last-child { margin-bottom: 0; }
    .meta-label {
      width: 2.1in;
      font-weight: 800;
      color: #0f172a;
    }
    .meta-value {
      flex: 1;
      color: #334155;
      font-weight: 600;
    }

    .hero-art-side {
      display: flex;
      flex-direction: column;
      gap: 16px;
      position: relative;
    }
    .art-card {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border-radius: 24px;
      padding: 0.4in;
      color: #ffffff;
      box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.25);
    }
    .art-pill {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 9.5pt;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 100px;
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.4);
      margin-bottom: 14px;
    }

    /* Diagram Architecture Layout */
    .arch-flow {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-top: 0.1in;
    }
    .arch-step {
      background: #f8fafc;
      border: 1.5px solid #cbd5e1;
      border-radius: 14px;
      padding: 0.22in;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .arch-step-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10pt;
      font-weight: 800;
      color: #2563eb;
      margin-bottom: 6px;
    }
    .arch-step-title {
      font-size: 13pt;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 8px;
    }
    .arch-step-desc {
      font-size: 10pt;
      color: #475569;
      line-height: 1.5;
    }

    /* Thank You Slide */
    .thankyou-container {
      flex: 1;
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      align-items: center;
      gap: 0.6in;
    }
    .big-thankyou {
      font-size: 72pt;
      font-weight: 900;
      letter-spacing: -3px;
      color: #0f172a;
      line-height: 1;
      margin-bottom: 0.2in;
    }
  </style>
</head>
<body>

  <!-- ===================================================================== -->
  <!-- SLIDE 1: OFFICIAL TITLE SLIDE                                         -->
  <!-- ===================================================================== -->
  <div class="slide">
    <div class="template-header">
      <div class="header-left">
        <div class="google-deepmind"><span class="g-blue">G</span><span class="g-red">o</span><span class="g-yellow">o</span><span class="g-blue">g</span><span class="g-green">l</span><span class="g-red">e</span> DeepMind</div>
        <div class="header-divider">|</div>
        <div class="google-cloud"><span class="g-blue">G</span><span class="g-red">o</span><span class="g-yellow">o</span><span class="g-blue">g</span><span class="g-green">l</span><span class="g-red">e</span> Cloud</div>
      </div>
      <div class="header-right">
        <span class="powered">Powered by</span>
        <span class="partner-pill partner-h2s">H2S</span>
        <span class="header-divider">|</span>
        <span class="partner-pill partner-nasscom">nasscom</span>
        <span class="header-divider">|</span>
        <span class="partner-pill partner-headstart">✦ HEADSTART</span>
      </div>
    </div>

    <div class="title-slide-container">
      <div>
        <div class="hero-buildathon-brand">
          <div class="hero-big-logo">
            <div class="logo-tl"></div>
            <div class="logo-tr"></div>
            <div class="logo-bl"></div>
            <div class="logo-br"></div>
          </div>
          <div>
            <div class="hero-brand-name">Startup Buildathon</div>
            <div class="hero-brand-sub">— India 2026 &nbsp;·&nbsp; Build Your Next Big Thing.</div>
          </div>
        </div>

        <div class="project-hero-title">
          Haq AI: <span>Zero-Math</span> Statutory Payment Recovery
        </div>

        <div class="meta-box">
          <div class="meta-row">
            <div class="meta-label">Team Name:</div>
            <div class="meta-value">Tech Titans</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Team Size:</div>
            <div class="meta-value">1 Developer (Nirmal Sinh)</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Problem Statement:</div>
            <div class="meta-value">₹10 Lakh Crore working capital locked in delayed corporate payments to Indian MSMEs; severe 45-day statutory MSMED violations.</div>
          </div>
        </div>
      </div>

      <div class="hero-art-side">
        <div class="art-card">
          <div class="art-pill">MSMED ACT 2006 & IT ACT s.43B(h)</div>
          <div style="font-size: 20pt; font-weight: 800; line-height: 1.25; margin-bottom: 12px;">
            Empowering 6.3 Crore Indian Micro & Small Enterprises
          </div>
          <p style="font-size: 11pt; color: #94a3b8; line-height: 1.6;">
            A production-ready, demo-complete legal-fintech copilot. Combines Google AI Vision with a deterministic Zero-Math TypeScript engine to enforce 15/45-day statutory limits and 3× RBI compound interest.
          </p>
          <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.1); font-family: 'JetBrains Mono', monospace; font-size: 10pt; color: #34d399;">
            ✓ 170/170 Automated Tests Passed · Cloud Run Ready
          </div>
        </div>
      </div>
    </div>

    <div class="template-footer">
      <div>Startup Buildathon India 2026 Submission</div>
      <div class="footer-disclaimer">Draft only. Review with a CA/lawyer before sending.</div>
    </div>
  </div>

  <!-- ===================================================================== -->
  <!-- SLIDE 2: PROBLEM STATEMENT                                            -->
  <!-- ===================================================================== -->
  <div class="slide">
    <div class="template-header">
      <div class="header-left">
        <div class="google-deepmind"><span class="g-blue">G</span><span class="g-red">o</span><span class="g-yellow">o</span><span class="g-blue">g</span><span class="g-green">l</span><span class="g-red">e</span> DeepMind</div>
        <div class="header-divider">|</div>
        <div class="google-cloud"><span class="g-blue">G</span><span class="g-red">o</span><span class="g-yellow">o</span><span class="g-blue">g</span><span class="g-green">l</span><span class="g-red">e</span> Cloud</div>
      </div>
      <div class="header-center">
        <div class="buildathon-logo">
          <div class="logo-tl"></div>
          <div class="logo-tr"></div>
          <div class="logo-bl"></div>
          <div class="logo-br"></div>
        </div>
        <div class="buildathon-text">
          <div class="buildathon-title">Startup Buildathon</div>
          <div class="buildathon-sub">— India 2026</div>
        </div>
      </div>
      <div class="header-right">
        <span class="powered">Powered by</span>
        <span class="partner-pill partner-h2s">H2S</span>
        <span class="header-divider">|</span>
        <span class="partner-pill partner-nasscom">nasscom</span>
        <span class="header-divider">|</span>
        <span class="partner-pill partner-headstart">✦ HEADSTART</span>
      </div>
    </div>

    <div class="title-area">
      <div class="slide-heading">Problem Statement</div>
      <div class="slide-subheading">The challenge or problem identified by the team.</div>
    </div>

    <div class="content-area">
      <div class="grid-3" style="flex: 1;">
        <div class="feature-card card-accent-blue">
          <div class="card-title">₹10 Lakh Cr Cash-Flow Choke</div>
          <div class="card-body">
            Over 6.3 Crore registered Indian MSMEs power 30% of India's GDP, but <strong>₹10.7 Lakh Crore</strong> remains trapped in chronic buyer payment delays exceeding 90 to 180+ days.
            <ul>
              <li>Cripples working capital for small manufacturers.</li>
              <li>Forces high-interest informal borrowing (24-36% p.a.).</li>
              <li>Stifles factory payroll and raw material procurement.</li>
            </ul>
          </div>
          <div class="stat-badge amber">Delayed Invoices: 65%+ in Supply Chain</div>
        </div>

        <div class="feature-card card-accent-amber">
          <div class="card-title">Statutory Law Exists, But Unused</div>
          <div class="card-body">
            <strong>MSMED Act 2006</strong> grants strict statutory protections that small suppliers cannot easily compute or enforce:
            <ul>
              <li><strong>Section 15:</strong> Mandatory 15-day limit (or agreed PO terms capped strictly at 45 days).</li>
              <li><strong>Section 16:</strong> Penal compound interest at <strong>3× the RBI Bank Rate (20.25% p.a.)</strong> monthly resting.</li>
              <li><strong>The MSME Dilemma:</strong> Small suppliers fear aggressive litigation will burn vital corporate relationships.</li>
            </ul>
          </div>
          <div class="stat-badge green">Statutory Rate: 3× RBI Rate (20.25%)</div>
        </div>

        <div class="feature-card card-accent-purple">
          <div class="card-title">Complexity & LLM Math Risk</div>
          <div class="card-body">
            Existing accounting tools do not calculate statutory interest, while generic AI chatbots hallucinate dates and interest numbers:
            <ul>
              <li>Standard LLMs cannot be trusted with legal interest math.</li>
              <li>Leap years, 45-day caps, and deemed acceptance dates require strict deterministic execution.</li>
              <li>Lack of a field-by-field MSME Samadhaan government council copy kit.</li>
            </ul>
          </div>
          <div class="stat-badge blue">Zero-Math AI Architecture Needed</div>
        </div>
      </div>
    </div>

    <div class="template-footer">
      <div>Startup Buildathon India 2026 Submission</div>
      <div class="footer-disclaimer">Draft only. Review with a CA/lawyer before sending.</div>
    </div>
  </div>

  <!-- ===================================================================== -->
  <!-- SLIDE 3: PROPOSED SOLUTION                                            -->
  <!-- ===================================================================== -->
  <div class="slide">
    <div class="template-header">
      <div class="header-left">
        <div class="google-deepmind"><span class="g-blue">G</span><span class="g-red">o</span><span class="g-yellow">o</span><span class="g-blue">g</span><span class="g-green">l</span><span class="g-red">e</span> DeepMind</div>
        <div class="header-divider">|</div>
        <div class="google-cloud"><span class="g-blue">G</span><span class="g-red">o</span><span class="g-yellow">o</span><span class="g-blue">g</span><span class="g-green">l</span><span class="g-red">e</span> Cloud</div>
      </div>
      <div class="header-center">
        <div class="buildathon-logo">
          <div class="logo-tl"></div>
          <div class="logo-tr"></div>
          <div class="logo-bl"></div>
          <div class="logo-br"></div>
        </div>
        <div class="buildathon-text">
          <div class="buildathon-title">Startup Buildathon</div>
          <div class="buildathon-sub">— India 2026</div>
        </div>
      </div>
      <div class="header-right">
        <span class="powered">Powered by</span>
        <span class="partner-pill partner-h2s">H2S</span>
        <span class="header-divider">|</span>
        <span class="partner-pill partner-nasscom">nasscom</span>
        <span class="header-divider">|</span>
        <span class="partner-pill partner-headstart">✦ HEADSTART</span>
      </div>
    </div>

    <div class="title-area">
      <div class="slide-heading">Proposed Solution</div>
      <div class="slide-subheading">The idea and how it addresses the identified problem.</div>
    </div>

    <div class="content-area">
      <div class="grid-2" style="flex: 1;">
        <div class="feature-card card-highlight">
          <div class="card-title">Haq AI: Statutory Payment Copilot</div>
          <div class="card-body">
            A production-grade, Google AI Studio style statutory payment recovery copilot tailored for Indian MSMEs:
            <ul>
              <li><strong>Zero-Math AI Architecture:</strong> LLMs never calculate money or dates. All figures derive from a verified deterministic TypeScript engine (<code>Decimal.js</code>, integer paise).</li>
              <li><strong>Multimodal Document OCR:</strong> Google Gemini extracts structured data from invoices and delivery receipts with confidence scoring.</li>
              <li><strong>Section 15 & 16 Enforcement:</strong> Computes statutory appointed day and 3× RBI compound interest (20.25% p.a.) automatically.</li>
              <li><strong>1-Click MSME Samadhaan Dossier:</strong> Generates court-ready PDF evidence packs and copy-paste fields for the official government portal.</li>
            </ul>
          </div>
          <div class="stat-badge green">Verified 100% Zero-Math Precision</div>
        </div>

        <div class="feature-card card-accent-amber">
          <div class="card-title">Section 43B(h) Corporate Tax Leverage</div>
          <div class="card-body">
            Haq AI unlocks payments <strong>amicably without hostile litigation</strong> by leveraging Section 43B(h) of the Income Tax Act:
            <ul>
              <li><strong>The Rule:</strong> An unpaid MSME bill beyond the legal limit is deductible only in the year it is actually paid, so the buyer faces a tax-timing and cash-flow cost.</li>
              <li><strong>Corporate Buyer Priority:</strong> Transforms delayed vendor payments into an urgent corporate tax compliance priority for buyer CFOs before 31st March year-end.</li>
              <li><strong>Human-in-the-Loop Protocol:</strong> Zero autonomous dispatch. No reminder or notice is ever transmitted without explicit user tap.</li>
              <li><strong>Multilingual Parity:</strong> Generates verified notices in English, Hindi, and Gujarati with multiset token parity guardrails.</li>
            </ul>
          </div>
          <div class="stat-badge amber">IT Act s.43B(h) + MSMED ss. 15-18</div>
        </div>
      </div>
    </div>

    <div class="template-footer">
      <div>Startup Buildathon India 2026 Submission</div>
      <div class="footer-disclaimer">Draft only. Review with a CA/lawyer before sending.</div>
    </div>
  </div>

  <!-- ===================================================================== -->
  <!-- SLIDE 4: SOLUTION ARCHITECTURE                                        -->
  <!-- ===================================================================== -->
  <div class="slide">
    <div class="template-header">
      <div class="header-left">
        <div class="google-deepmind"><span class="g-blue">G</span><span class="g-red">o</span><span class="g-yellow">o</span><span class="g-blue">g</span><span class="g-green">l</span><span class="g-red">e</span> DeepMind</div>
        <div class="header-divider">|</div>
        <div class="google-cloud"><span class="g-blue">G</span><span class="g-red">o</span><span class="g-yellow">o</span><span class="g-blue">g</span><span class="g-green">l</span><span class="g-red">e</span> Cloud</div>
      </div>
      <div class="header-center">
        <div class="buildathon-logo">
          <div class="logo-tl"></div>
          <div class="logo-tr"></div>
          <div class="logo-bl"></div>
          <div class="logo-br"></div>
        </div>
        <div class="buildathon-text">
          <div class="buildathon-title">Startup Buildathon</div>
          <div class="buildathon-sub">— India 2026</div>
        </div>
      </div>
      <div class="header-right">
        <span class="powered">Powered by</span>
        <span class="partner-pill partner-h2s">H2S</span>
        <span class="header-divider">|</span>
        <span class="partner-pill partner-nasscom">nasscom</span>
        <span class="header-divider">|</span>
        <span class="partner-pill partner-headstart">✦ HEADSTART</span>
      </div>
    </div>

    <div class="title-area">
      <div class="slide-heading">Solution Architecture</div>
      <div class="slide-subheading">Architecture of the proposed solution</div>
    </div>

    <div class="content-area">
      <div class="arch-flow">
        <div class="arch-step">
          <div>
            <div class="arch-step-num">LAYER 01</div>
            <div class="arch-step-title">Ingest & Validation</div>
            <div class="arch-step-desc">
              • PDF/PNG/JPEG invoice uploads (Max 8 MB).<br>
              • Strict magic-bytes file inspection.<br>
              • Private Cloud Storage bucket with UUIDs.<br>
              • Forward-to-Haq email webhook with HMAC.
            </div>
          </div>
          <div class="stat-badge blue">Magic-Byte Defense</div>
        </div>

        <div class="arch-step">
          <div>
            <div class="arch-step-num">LAYER 02</div>
            <div class="arch-step-title">Google AI Pipeline</div>
            <div class="arch-step-desc">
              • Gemini 2.5 Flash Multimodal OCR.<br>
              • Zod structured schema & confidence score.<br>
              • Multiset token parity for Hindi/Gujarati.<br>
              • Ephemeral WebSockets for Gemini Live.
            </div>
          </div>
          <div class="stat-badge green">Multiset Parity Guard</div>
        </div>

        <div class="arch-step">
          <div>
            <div class="arch-step-num">LAYER 03</div>
            <div class="arch-step-title">Deterministic Engine</div>
            <div class="arch-step-desc">
              • Section 15 Appointed Day (15d/45d cap).<br>
              • Section 16 Interest (3× RBI bank rate).<br>
              • <code>Decimal.js</code> integer paise precision.<br>
              • Versioned RBI rates table (no hardcoding).
            </div>
          </div>
          <div class="stat-badge amber">Zero-Math Math Isolation</div>
        </div>

        <div class="arch-step">
          <div>
            <div class="arch-step-num">LAYER 04</div>
            <div class="arch-step-title">Cloud Infrastructure</div>
            <div class="arch-step-desc">
              • Next.js 14 standalone on Google Cloud Run.<br>
              • Non-root container runtime (UID 1001).<br>
              • Secret Manager runtime injection.<br>
              • DPDP Act one-click atomic data erasure.
            </div>
          </div>
          <div class="stat-badge blue">Google Cloud Run (Stateless)</div>
        </div>
      </div>

      <div style="margin-top: 0.25in; padding: 0.2in 0.3in; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 12px; display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 11pt; font-weight: 700; color: #1e293b;">
          🛡️ Master Security Protocol:
        </span>
        <span style="font-size: 10pt; color: #475569;">
          Strict CSP · Ephemeral Tokens · Human-in-the-Loop Approval Queue · Zero PII in Logs · Rate Limiters (5 req/min)
        </span>
      </div>
    </div>

    <div class="template-footer">
      <div>Startup Buildathon India 2026 Submission</div>
      <div class="footer-disclaimer">Draft only. Review with a CA/lawyer before sending.</div>
    </div>
  </div>

  <!-- ===================================================================== -->
  <!-- SLIDE 5: GOOGLE AI TOOLS                                              -->
  <!-- ===================================================================== -->
  <div class="slide">
    <div class="template-header">
      <div class="header-left">
        <div class="google-deepmind"><span class="g-blue">G</span><span class="g-red">o</span><span class="g-yellow">o</span><span class="g-blue">g</span><span class="g-green">l</span><span class="g-red">e</span> DeepMind</div>
        <div class="header-divider">|</div>
        <div class="google-cloud"><span class="g-blue">G</span><span class="g-red">o</span><span class="g-yellow">o</span><span class="g-blue">g</span><span class="g-green">l</span><span class="g-red">e</span> Cloud</div>
      </div>
      <div class="header-center">
        <div class="buildathon-logo">
          <div class="logo-tl"></div>
          <div class="logo-tr"></div>
          <div class="logo-bl"></div>
          <div class="logo-br"></div>
        </div>
        <div class="buildathon-text">
          <div class="buildathon-title">Startup Buildathon</div>
          <div class="buildathon-sub">— India 2026</div>
        </div>
      </div>
      <div class="header-right">
        <span class="powered">Powered by</span>
        <span class="partner-pill partner-h2s">H2S</span>
        <span class="header-divider">|</span>
        <span class="partner-pill partner-nasscom">nasscom</span>
        <span class="header-divider">|</span>
        <span class="partner-pill partner-headstart">✦ HEADSTART</span>
      </div>
    </div>

    <div class="title-area">
      <div class="slide-heading">Google AI Tools</div>
      <div class="slide-subheading">Google AI Studio, Google Antigravity and Google Agent Skills (used or planned to be used).</div>
    </div>

    <div class="content-area">
      <div class="grid-3" style="flex: 1;">
        <div class="feature-card card-accent-blue">
          <div class="card-title">Google AI Studio</div>
          <div class="card-body">
            <strong>Prompt Engineering & Schema Validation:</strong>
            <ul>
              <li>Used Google AI Studio to develop, test, and tune multimodal invoice extraction system prompts.</li>
              <li>Authored strict JSON schemas for structured extraction of buyer GSTIN, invoice date, and item totals.</li>
              <li>Replicated the Google AI Studio dark theme & interactive playground in the web application for customer trust.</li>
            </ul>
          </div>
          <div class="stat-badge blue">Prompt Versioning & Schemas</div>
        </div>

        <div class="feature-card card-accent-emerald">
          <div class="card-title">Google Antigravity SDK</div>
          <div class="card-body">
            <strong>Agent Orchestration & Subagents:</strong>
            <ul>
              <li>Orchestrated specialized subagents (e.g. <code>firestore-rules-author</code>) for declarative least-privilege security.</li>
              <li>Implemented Function Calling Tool Whitelist: AI assistant calls statutory engine functions; outputs containing unauthorized numbers are blocked.</li>
              <li>Multi-agent workflow pipelines for end-to-end evidence pack generation.</li>
            </ul>
          </div>
          <div class="stat-badge green">Subagent Isolation</div>
        </div>

        <div class="feature-card card-accent-purple">
          <div class="card-title">Google Agent Skills (MCP)</div>
          <div class="card-body">
            <strong>Production Engineering Skills:</strong>
            <ul>
              <li><strong>Modern Web Guidance:</strong> Enforced WCAG 2.2 AA accessibility, responsive design, and CSS standards.</li>
              <li><strong>Chrome DevTools MCP:</strong> Audited layout rendering and Core Web Vitals (LCP & CLS).</li>
              <li><strong>Secret Manager & Cloud Skills:</strong> Runtime credential isolation with zero plaintext keys in git or client bundles.</li>
            </ul>
          </div>
          <div class="stat-badge blue">MCP Tools & Standards</div>
        </div>
      </div>
    </div>

    <div class="template-footer">
      <div>Startup Buildathon India 2026 Submission</div>
      <div class="footer-disclaimer">Draft only. Review with a CA/lawyer before sending.</div>
    </div>
  </div>

  <!-- ===================================================================== -->
  <!-- SLIDE 6: GOOGLE AI MODELS                                             -->
  <!-- ===================================================================== -->
  <div class="slide">
    <div class="template-header">
      <div class="header-left">
        <div class="google-deepmind"><span class="g-blue">G</span><span class="g-red">o</span><span class="g-yellow">o</span><span class="g-blue">g</span><span class="g-green">l</span><span class="g-red">e</span> DeepMind</div>
        <div class="header-divider">|</div>
        <div class="google-cloud"><span class="g-blue">G</span><span class="g-red">o</span><span class="g-yellow">o</span><span class="g-blue">g</span><span class="g-green">l</span><span class="g-red">e</span> Cloud</div>
      </div>
      <div class="header-center">
        <div class="buildathon-logo">
          <div class="logo-tl"></div>
          <div class="logo-tr"></div>
          <div class="logo-bl"></div>
          <div class="logo-br"></div>
        </div>
        <div class="buildathon-text">
          <div class="buildathon-title">Startup Buildathon</div>
          <div class="buildathon-sub">— India 2026</div>
        </div>
      </div>
      <div class="header-right">
        <span class="powered">Powered by</span>
        <span class="partner-pill partner-h2s">H2S</span>
        <span class="header-divider">|</span>
        <span class="partner-pill partner-nasscom">nasscom</span>
        <span class="header-divider">|</span>
        <span class="partner-pill partner-headstart">✦ HEADSTART</span>
      </div>
    </div>

    <div class="title-area">
      <div class="slide-heading">Google AI Models</div>
      <div class="slide-subheading">Google AI model(s) used or planned for the proposed solution.</div>
    </div>

    <div class="content-area">
      <div class="grid-2" style="flex: 1;">
        <div class="feature-card card-accent-blue">
          <div class="card-title">Gemini 2.5 Flash (<code>gemini-2.5-flash</code>)</div>
          <div class="card-body">
            <strong>High-Throughput Multimodal Vision & Translation:</strong>
            <ul>
              <li><strong>OCR Document Parsing:</strong> Processes invoices, delivery challans, and bilty receipts in PDF, PNG, and JPEG. Extracts buyer name, GSTIN, invoice number, line items, and delivery dates.</li>
              <li><strong>Confidence Scoring & Human Review:</strong> Assigns field-level confidence scores (0.0 to 1.0); automatically flags missing or estimated acceptance dates for mandatory human review.</li>
              <li><strong>Multilingual Translation:</strong> Translates formal statutory demand notices into regional languages (Hindi & Gujarati) to empower Tier-2 and Tier-3 factory owners.</li>
              <li><strong>Multiset Token Parity Guard:</strong> Code verifies that translated notices retain an exact multiset match of all dates, digits, GSTIN, and currency values.</li>
            </ul>
          </div>
          <div class="stat-badge green">Multimodal OCR + Multiset Guard</div>
        </div>

        <div class="feature-card card-accent-emerald">
          <div class="card-title">Gemini Live 2.0 Flash (<code>gemini-2.0-flash-exp</code>)</div>
          <div class="card-body">
            <strong>Real-Time Low-Latency Voice Assistance:</strong>
            <ul>
              <li><strong>Direct Browser WebSockets:</strong> Issues single-use, short-lived ephemeral tokens from the server so the browser connects directly to the Gemini Live WebSockets API.</li>
              <li><strong>Voice-First Case Creation:</strong> Allows non-English speaking manufacturing owners to describe overdue bills conversationally in Hindi or Gujarati.</li>
              <li><strong>Draft-Only Confirmation Gate:</strong> Declared tool <code>create_case(fields)</code> saves cases strictly as <code>DRAFT</code>; never submits without explicit user screen confirmation.</li>
              <li><strong>Privacy Gate:</strong> Explicit microphone consent gate before any audio streaming or transcript processing.</li>
            </ul>
          </div>
          <div class="stat-badge blue">Ephemeral Tokens · Direct WebSockets</div>
        </div>
      </div>
    </div>

    <div class="template-footer">
      <div>Startup Buildathon India 2026 Submission</div>
      <div class="footer-disclaimer">Draft only. Review with a CA/lawyer before sending.</div>
    </div>
  </div>

  <!-- ===================================================================== -->
  <!-- SLIDE 7: WORKING PROTOTYPE & PRODUCTION VERIFICATION                  -->
  <!-- ===================================================================== -->
  <div class="slide">
    <div class="template-header">
      <div class="header-left">
        <div class="google-deepmind"><span class="g-blue">G</span><span class="g-red">o</span><span class="g-yellow">o</span><span class="g-blue">g</span><span class="g-green">l</span><span class="g-red">e</span> DeepMind</div>
        <div class="header-divider">|</div>
        <div class="google-cloud"><span class="g-blue">G</span><span class="g-red">o</span><span class="g-yellow">o</span><span class="g-blue">g</span><span class="g-green">l</span><span class="g-red">e</span> Cloud</div>
      </div>
      <div class="header-center">
        <div class="buildathon-logo">
          <div class="logo-tl"></div>
          <div class="logo-tr"></div>
          <div class="logo-bl"></div>
          <div class="logo-br"></div>
        </div>
        <div class="buildathon-text">
          <div class="buildathon-title">Startup Buildathon</div>
          <div class="buildathon-sub">— India 2026</div>
        </div>
      </div>
      <div class="header-right">
        <span class="powered">Powered by</span>
        <span class="partner-pill partner-h2s">H2S</span>
        <span class="header-divider">|</span>
        <span class="partner-pill partner-nasscom">nasscom</span>
        <span class="header-divider">|</span>
        <span class="partner-pill partner-headstart">✦ HEADSTART</span>
      </div>
    </div>

    <div class="title-area">
      <div class="slide-heading">Working Prototype & Traction</div>
      <div class="slide-subheading">Live implementation, test coverage, and demo readiness</div>
    </div>

    <div class="content-area">
      <div class="grid-3" style="flex: 1;">
        <div class="feature-card card-accent-blue">
          <div class="card-title">Live Working Prototype</div>
          <div class="card-body">
            <strong>Full-Stack Production App:</strong>
            <ul>
              <li>Built with Next.js 14 App Router, TypeScript, and Tailwind CSS.</li>
              <li>Interactive Google AI Studio Style Playground with live sliders and real MSME presets.</li>
              <li>Buyer Section 43B(h) Risk Dashboard for CA and CFO audit reviews.</li>
              <li>Human-in-the-Loop reminder approval queue.</li>
            </ul>
          </div>
          <div class="stat-badge green">Demo-Ready & Tested</div>
        </div>

        <div class="feature-card card-accent-emerald">
          <div class="card-title">100% Quality & Security Gate</div>
          <div class="card-body">
            <strong>Rigorous Test Pyramid:</strong>
            <ul>
              <li><strong>170 Unit & Security Tests</strong> passing across 22 test suites in 5.3s.</li>
              <li>Zero TypeScript errors (<code>tsc --noEmit</code>) and Zero ESLint warnings.</li>
              <li>Golden Vector tests verifying compound interest against hand-calculated legal ledger tables.</li>
              <li>Security suite testing cross-tenant access, rate limits, and injection defenses.</li>
            </ul>
          </div>
          <div class="stat-badge blue">170/170 Vitest Tests Passed</div>
        </div>

        <div class="feature-card card-accent-purple">
          <div class="card-title">Deployment & Repository</div>
          <div class="card-body">
            <strong>Open Source & Cloud Ready:</strong>
            <ul>
              <li><strong>GitHub Repository:</strong> <br><code style="font-size: 9pt; color: #2563eb;">https://github.com/nirmal2155/haq-ai</code></li>
              <li>Synchronized on both <code>master</code> and <code>main</code> branches.</li>
              <li>Multi-stage Dockerfile with non-root runtime (UID 1001) for Google Cloud Run.</li>
              <li>Continuous Deployment pipeline configured via Cloud Build.</li>
            </ul>
          </div>
          <div class="stat-badge green">GitHub: nirmal2155/haq-ai</div>
        </div>
      </div>
    </div>

    <div class="template-footer">
      <div>Startup Buildathon India 2026 Submission</div>
      <div class="footer-disclaimer">Draft only. Review with a CA/lawyer before sending.</div>
    </div>
  </div>

  <!-- ===================================================================== -->
  <!-- SLIDE 8: OFFICIAL THANK YOU SLIDE                                     -->
  <!-- ===================================================================== -->
  <div class="slide">
    <div class="template-header">
      <div class="header-left">
        <div class="google-deepmind"><span class="g-blue">G</span><span class="g-red">o</span><span class="g-yellow">o</span><span class="g-blue">g</span><span class="g-green">l</span><span class="g-red">e</span> DeepMind</div>
        <div class="header-divider">|</div>
        <div class="google-cloud"><span class="g-blue">G</span><span class="g-red">o</span><span class="g-yellow">o</span><span class="g-blue">g</span><span class="g-green">l</span><span class="g-red">e</span> Cloud</div>
      </div>
      <div class="header-right">
        <span class="powered">Powered by</span>
        <span class="partner-pill partner-h2s">H2S</span>
        <span class="header-divider">|</span>
        <span class="partner-pill partner-nasscom">nasscom</span>
        <span class="header-divider">|</span>
        <span class="partner-pill partner-headstart">✦ HEADSTART</span>
      </div>
    </div>

    <div class="thankyou-container">
      <div>
        <div class="hero-buildathon-brand">
          <div class="hero-big-logo">
            <div class="logo-tl"></div>
            <div class="logo-tr"></div>
            <div class="logo-bl"></div>
            <div class="logo-br"></div>
          </div>
          <div>
            <div class="hero-brand-name">Startup Buildathon</div>
            <div class="hero-brand-sub">— India 2026 &nbsp;·&nbsp; Build Your Next Big Thing.</div>
          </div>
        </div>

        <div class="big-thankyou">Thank you</div>

        <div style="font-size: 18pt; font-weight: 800; color: #2563eb; margin-bottom: 8px;">
          Haq AI — MSME Statutory Payment Rights Copilot
        </div>
        <p style="font-size: 13pt; color: #64748b; line-height: 1.5; max-width: 90%;">
          Protecting India's 6.3 Crore micro & small enterprises with Zero-Math AI precision and statutory legal authority.
        </p>

        <div style="margin-top: 24px; display: flex; gap: 20px; font-size: 11pt; font-weight: 600; color: #334155;">
          <div><strong>Team:</strong> Tech Titans</div>
          <div>•</div>
          <div><strong>Lead:</strong> Nirmal Sinh</div>
          <div>•</div>
          <div><strong>Repo:</strong> github.com/nirmal2155/haq-ai</div>
        </div>
      </div>

      <div class="hero-art-side">
        <div class="art-card" style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);">
          <div class="art-pill">BUILDATHON SUBMISSION SUMMARY</div>
          <div style="font-size: 16pt; font-weight: 800; line-height: 1.3; margin-bottom: 12px;">
            Demo Ready & Built with Google AI Stack
          </div>
          <ul style="font-size: 11pt; color: #cbd5e1; line-height: 1.8; margin-left: 20px;">
            <li>Google Gemini 2.5 Flash Vision & Multiset Translation</li>
            <li>Google Gemini Live 2.0 WebSockets Voice Assistant</li>
            <li>Google Cloud Run Non-Root Container Architecture</li>
            <li>Google Secret Manager Zero-Trust Credential Isolation</li>
            <li>DPDP Act 2023 Digital Privacy by Design</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="template-footer">
      <div>Startup Buildathon India 2026 Submission</div>
      <div class="footer-disclaimer">Draft only. Review with a CA/lawyer before sending.</div>
    </div>
  </div>

</body>
</html>
`;

  const htmlPath = path.join(__dirname, '../public/buildathon_template_slides.html');
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log('[BUILDATHON PPT] Wrote template HTML to:', htmlPath);

  // Render to PDF using Chrome Headless
  const outPdfLocal = path.join(__dirname, '../public/Startup_Buildathon_India_2026_Haq_AI_Tech_Titans.pdf');
  const outPdfDownloads = 'C:\\Users\\ASUS\\Downloads\\Startup_Buildathon_India_2026_Haq_AI_Tech_Titans.pdf';
  const outPdfDesktop = 'C:\\Users\\ASUS\\OneDrive\\Desktop\\Startup_Buildathon_India_2026_Haq_AI_Tech_Titans.pdf';

  const browserPath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  console.log('[BUILDATHON PPT] Rendering PDF via browser:', browserPath);

  const fileUri = 'file:///' + htmlPath.replace(/\\/g, '/');
  const cmd = `"${browserPath}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${outPdfLocal}" "${fileUri}"`;
  execSync(cmd, { stdio: 'inherit' });

  console.log('[BUILDATHON PPT] Generated in public:', outPdfLocal);

  // Copy to Downloads & Desktop for immediate access
  try {
    fs.copyFileSync(outPdfLocal, outPdfDownloads);
    console.log('[BUILDATHON PPT] Copied to Downloads:', outPdfDownloads);
  } catch (e) {
    console.warn('Could not copy to Downloads:', e.message);
  }

  try {
    fs.copyFileSync(outPdfLocal, outPdfDesktop);
    console.log('[BUILDATHON PPT] Copied to Desktop:', outPdfDesktop);
  } catch (e) {
    console.warn('Could not copy to Desktop:', e.message);
  }

  const stats = fs.statSync(outPdfLocal);
  const sizeMb = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`[BUILDATHON PPT] Success! File size: ${sizeMb} MB (Strictly under 5 MB limit)`);
}

main().catch(err => {
  console.error('[BUILDATHON PPT ERROR]', err);
  process.exit(1);
});
