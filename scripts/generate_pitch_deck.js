const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  console.log('[PITCH DECK] Reading logo asset...');
  const logoPath = path.join(__dirname, '../public/tech_titan_logo.jpg');
  const logoBase64 = fs.readFileSync(logoPath).toString('base64');
  const logoSrc = `data:image/jpeg;base64,${logoBase64}`;

  console.log('[PITCH DECK] Constructing ultra-professional pitch deck HTML...');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Haq AI — Official Startup Pitch Deck</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');

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
      background: #090d16;
      color: #f1f5f9;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .slide {
      width: 16in;
      height: 9in;
      page-break-after: always;
      position: relative;
      overflow: hidden;
      padding: 0.8in 1in;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #090d16;
      background-image: 
        radial-gradient(circle at 85% 15%, rgba(5, 150, 105, 0.15) 0%, transparent 45%),
        radial-gradient(circle at 15% 85%, rgba(30, 58, 138, 0.2) 0%, transparent 45%);
    }

    /* Header & Branding */
    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 0.25in;
    }

    .slide-brand {
      display: flex;
      align-items: center;
      gap: 0.2in;
    }

    .slide-logo {
      width: 0.55in;
      height: 0.55in;
      border-radius: 50%;
      border: 2px solid #059669;
      object-fit: cover;
    }

    .slide-brand-text {
      font-size: 18pt;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #ffffff;
    }

    .slide-brand-text span {
      color: #10b981;
    }

    .slide-tag {
      font-size: 10pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #10b981;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 6px 16px;
      border-radius: 100px;
    }

    .slide-number {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11pt;
      color: #64748b;
    }

    /* Content Area */
    .slide-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0.3in 0;
    }

    .slide-title-area {
      margin-bottom: 0.35in;
    }

    .slide-title {
      font-size: 38pt;
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -1.2px;
      color: #ffffff;
    }

    .slide-title .gradient-text {
      background: linear-gradient(135deg, #34d399 0%, #10b981 50%, #065f46 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .slide-subtitle {
      font-size: 16pt;
      color: #94a3b8;
      margin-top: 0.1in;
      font-weight: 400;
      max-width: 85%;
      line-height: 1.4;
    }

    /* Grids & Cards */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.35in;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0.3in;
    }

    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.25in;
    }

    .card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 0.3in;
      position: relative;
    }

    .card-highlight {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%);
      border: 1px solid rgba(16, 185, 129, 0.4);
    }

    .card-accent {
      border-top: 4px solid #10b981;
    }

    .card-title {
      font-size: 16pt;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 0.12in;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .card-desc {
      font-size: 12pt;
      color: #94a3b8;
      line-height: 1.5;
    }

    .stat-number {
      font-size: 42pt;
      font-weight: 900;
      color: #10b981;
      line-height: 1;
      letter-spacing: -1.5px;
      margin-bottom: 0.08in;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .stat-label {
      font-size: 11pt;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #64748b;
      font-weight: 700;
    }

    /* Footer */
    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 0.2in;
      font-size: 10pt;
      color: #475569;
    }

    .slide-footer-left {
      display: flex;
      gap: 0.3in;
    }

    /* Comparison Table */
    .comp-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12pt;
    }

    .comp-table th {
      text-align: left;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.06);
      color: #f8fafc;
      font-weight: 700;
      border-bottom: 2px solid rgba(255, 255, 255, 0.12);
    }

    .comp-table td {
      padding: 14px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: #cbd5e1;
    }

    .comp-table tr.highlight-row {
      background: rgba(16, 185, 129, 0.12);
      font-weight: 600;
    }

    .comp-table tr.highlight-row td {
      color: #ffffff;
      border-bottom: 1px solid rgba(16, 185, 129, 0.3);
    }

    .badge-check {
      color: #10b981;
      font-weight: bold;
    }

    .badge-cross {
      color: #ef4444;
      font-weight: bold;
    }

    /* Architecture flow */
    .flow-step {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 0.22in;
      position: relative;
    }

    .flow-number {
      width: 32px;
      height: 32px;
      background: #10b981;
      color: #090d16;
      border-radius: 8px;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12pt;
      margin-bottom: 0.1in;
    }

    .pill-green {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 9pt;
      font-weight: 700;
      display: inline-block;
      margin-top: 6px;
    }
  </style>
</head>
<body>

  <!-- SLIDE 1: COVER -->
  <div class="slide" style="justify-content: center; text-align: center; background: radial-gradient(circle at 50% 50%, rgba(5, 150, 105, 0.22) 0%, #090d16 70%);">
    <div style="max-width: 12in; margin: 0 auto; display: flex; flex-direction: column; align-items: center;">
      <img src="${logoSrc}" style="width: 1.8in; height: 1.8in; border-radius: 50%; border: 4px solid #10b981; margin-bottom: 0.35in; box-shadow: 0 0 50px rgba(16, 185, 129, 0.35);" />
      
      <div style="font-size: 13pt; font-weight: 800; letter-spacing: 3px; color: #10b981; text-transform: uppercase; margin-bottom: 0.15in; background: rgba(16, 185, 129, 0.12); padding: 8px 24px; border-radius: 100px; border: 1px solid rgba(16, 185, 129, 0.3);">
        Startup Buildathon India 2026 · Open Innovation
      </div>

      <h1 style="font-size: 58pt; font-weight: 900; letter-spacing: -2px; line-height: 1; margin-bottom: 0.2in;">
        HAQ <span style="color: #10b981;">AI</span>
      </h1>

      <p style="font-size: 22pt; font-weight: 600; color: #cbd5e1; max-width: 10in; line-height: 1.35; margin-bottom: 0.4in;">
        The Statutory MSME Rights &amp; Recovery Platform
      </p>

      <div style="width: 2in; height: 2px; background: #10b981; margin-bottom: 0.4in;"></div>

      <p style="font-size: 14pt; color: #94a3b8; max-width: 9in; line-height: 1.5; margin-bottom: 0.45in;">
        Empowering 63M Indian micro &amp; small suppliers to claim 3× RBI compound interest under the MSMED Act, 
        draft statutory demand notices, and leverage Section 43B(h) for prompt payment recovery.
      </p>

      <div style="display: flex; gap: 0.5in; font-size: 13pt; background: rgba(255, 255, 255, 0.04); padding: 14px 36px; border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.1);">
        <div><strong>Team:</strong> <span style="color: #10b981;">Tech Titan</span></div>
        <div style="color: rgba(255, 255, 255, 0.2);">|</div>
        <div><strong>Founder &amp; Architect:</strong> <span style="color: #ffffff;">Nirmal Sinh Chouhan</span></div>
        <div style="color: rgba(255, 255, 255, 0.2);">|</div>
        <div><strong>Stack:</strong> <span style="color: #38bdf8;">Google Cloud Run &amp; Gemini Live</span></div>
      </div>
    </div>
  </div>

  <!-- SLIDE 2: THE PROBLEM -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-brand">
        <img src="${logoSrc}" class="slide-logo" />
        <div class="slide-brand-text">HAQ <span>AI</span> · Team Tech Titan</div>
      </div>
      <div class="slide-tag">The Indian MSME Crisis</div>
      <div class="slide-number">02 / 11</div>
    </div>

    <div class="slide-body">
      <div class="slide-title-area">
        <div class="slide-title">₹10 Lakh Crore Locked in <span class="gradient-text">Delayed Payments</span></div>
        <div class="slide-subtitle">
          Delayed payment is the #1 reason for working capital insolvency among 6.3 Crore Indian Micro &amp; Small Enterprises.
        </div>
      </div>

      <div class="grid-4" style="margin-bottom: 0.3in;">
        <div class="card card-accent">
          <div class="stat-number">₹10L Cr</div>
          <div class="stat-label">Trapped MSME Receivables</div>
          <p class="card-desc" style="margin-top: 10px;">Over ₹10 Lakh Crore is owed past the 45-day statutory limit across India.</p>
        </div>
        <div class="card card-accent">
          <div class="stat-number">180+</div>
          <div class="stat-label">Days Average Default Cycle</div>
          <p class="card-desc" style="margin-top: 10px;">Corporate buyers routinely delay payments 4x to 6x past statutory terms.</p>
        </div>
        <div class="card card-accent">
          <div class="stat-number">3× RBI</div>
          <div class="stat-label">Statutory Compound Interest</div>
          <p class="card-desc" style="margin-top: 10px;">Mandated by MSMED Act Section 16, but less than 2% of suppliers ever claim it.</p>
        </div>
        <div class="card card-accent">
          <div class="stat-number">₹15,000</div>
          <div class="stat-label">Legal Drafting Fee</div>
          <p class="card-desc" style="margin-top: 10px;">Lawyers charge hefty fees, making notices for ₹40k–₹2L invoices unviable.</p>
        </div>
      </div>

      <div class="grid-2">
        <div class="card" style="background: rgba(239, 68, 68, 0.08); border-color: rgba(239, 68, 68, 0.3);">
          <div class="card-title" style="color: #fca5a5;">The Supplier Dilemma (Fear &amp; Friction)</div>
          <p class="card-desc">Micro suppliers fear that threatening legal action will permanently sever buyer relationships. They don't know the exact deemed acceptance dates, cannot compute leap-year monthly compounding, and find government portals intimidating.</p>
        </div>
        <div class="card" style="background: rgba(245, 158, 11, 0.08); border-color: rgba(245, 158, 11, 0.3);">
          <div class="card-title" style="color: #fcd34d;">The Buyer Blindspot (Section 43B(h))</div>
          <p class="card-desc">Since April 2024, Section 43B(h) disallows income tax deductions for unpaid MSME bills. However, corporate buyers lack a unified risk view, leading to sudden tax audits and retrospective interest claims.</p>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>Startup Buildathon India 2026 · Founder: Nirmal Sinh Chouhan</div>
      <div>Confidential &amp; Proprietary · Team Tech Titan</div>
    </div>
  </div>

  <!-- SLIDE 3: THE SOLUTION -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-brand">
        <img src="${logoSrc}" class="slide-logo" />
        <div class="slide-brand-text">HAQ <span>AI</span> · Team Tech Titan</div>
      </div>
      <div class="slide-tag">Our Solution</div>
      <div class="slide-number">03 / 11</div>
    </div>

    <div class="slide-body">
      <div class="slide-title-area">
        <div class="slide-title">Haq AI: <span class="gradient-text">Zero-Math AI</span> Legal-Tech Engine</div>
        <div class="slide-subtitle">
          A mobile-first decision-support platform that automates statutory rights enforcement without risking legal hallucination.
        </div>
      </div>

      <div class="grid-3" style="margin-bottom: 0.3in;">
        <div class="card card-highlight">
          <div class="card-title">1. Deterministic Math Core</div>
          <p class="card-desc">
            <strong>Hard Rule: AI never touches money or dates.</strong><br/>
            Exact integer paise financial engine using <code>Decimal.js</code> computes Section 15 (15/45-day deadline) and Section 16 (3× RBI compounding with monthly rests).
          </p>
          <span class="pill-green">67 Unit Tests · CA-Auditable</span>
        </div>

        <div class="card card-highlight">
          <div class="card-title">2. Number-Integrity Notices</div>
          <p class="card-desc">
            Notices are rendered by code into fixed statutory templates. Gemini AI provides natural tone and translation in Hindi &amp; Gujarati. Our proprietary validator discards output if even 1 digit changes.
          </p>
          <span class="pill-green">Zero Hallucination Guaranteed</span>
        </div>

        <div class="card card-highlight">
          <div class="card-title">3. Section 43B(h) Leverage</div>
          <p class="card-desc">
            Instantly turns buyer tax liability into settlement leverage. Shows the exact tax deduction disallowance risk, aligning CFO interests with timely supplier payment.
          </p>
          <span class="pill-green">B2B Win-Win Settlement</span>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-title">Field-by-Field MSME Samadhaan Kit</div>
          <p class="card-desc">Never auto-submits to government portals. Generates a perfectly formatted, field-by-field copy toolkit with document checklists for one-click manual dispute filing.</p>
        </div>
        <div class="card">
          <div class="card-title">Gemini Live Voice Settlement Assistant</div>
          <p class="card-desc">Browser connects directly via short-lived, single-use ephemeral tokens. Simulates polite, legally factual debtor phone calls with explicit consent safeguards.</p>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>Startup Buildathon India 2026 · Founder: Nirmal Sinh Chouhan</div>
      <div>Confidential &amp; Proprietary · Team Tech Titan</div>
    </div>
  </div>

  <!-- SLIDE 4: PRODUCT FLOW & LIVE ASSETS -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-brand">
        <img src="${logoSrc}" class="slide-logo" />
        <div class="slide-brand-text">HAQ <span>AI</span> · Team Tech Titan</div>
      </div>
      <div class="slide-tag">Live Product Architecture</div>
      <div class="slide-number">04 / 11</div>
    </div>

    <div class="slide-body">
      <div class="slide-title-area">
        <div class="slide-title">How Haq AI Works: <span class="gradient-text">6 Steps to Recovery</span></div>
        <div class="slide-subtitle">
          From unorganized PDF upload to formal dispute filing and voice roleplay in under 2 minutes.
        </div>
      </div>

      <div class="grid-3" style="gap: 0.25in; margin-bottom: 0.25in;">
        <div class="flow-step">
          <div class="flow-number">1</div>
          <div class="card-title" style="font-size: 13pt;">Upload &amp; Magic-Bytes Shield</div>
          <p class="card-desc" style="font-size: 10.5pt;">Supplier uploads PDF/image (max 8MB). Server inspects magic bytes (rejects fake scripts), stores with UUID in private bucket with 5-min signed URLs.</p>
        </div>

        <div class="flow-step">
          <div class="flow-number">2</div>
          <div class="card-title" style="font-size: 13pt;">Gemini Multimodal Extract</div>
          <p class="card-desc" style="font-size: 10.5pt;">Gemini 2.5 Flash extracts buyer GSTIN, dates, invoice amounts into strict JSON schema. Amber flags mark missing acceptance dates for human review.</p>
        </div>

        <div class="flow-step">
          <div class="flow-number">3</div>
          <div class="card-title" style="font-size: 13pt;">Deterministic Engine Calc</div>
          <p class="card-desc" style="font-size: 10.5pt;">Code computes Section 15 statutory due date and Section 16 interest at 3× bank rate (19.5% p.a.) compounded monthly in integer paise via Decimal.js.</p>
        </div>

        <div class="flow-step">
          <div class="flow-number">4</div>
          <div class="card-title" style="font-size: 13pt;">Code-Locked Demand Notice</div>
          <p class="card-desc" style="font-size: 10.5pt;">Statutory notice is filled by code. Gemini translates tone to Hindi &amp; Gujarati. Automated Number Integrity Verifier ensures zero hallucination.</p>
        </div>

        <div class="flow-step">
          <div class="flow-number">5</div>
          <div class="card-title" style="font-size: 13pt;">MSME Samadhaan Kit</div>
          <p class="card-desc" style="font-size: 10.5pt;">Generates copy-paste fields for MSEFC conciliation portal with mandatory legal disclaimer: "Draft only. Review with CA/lawyer."</p>
        </div>

        <div class="flow-step">
          <div class="flow-number">6</div>
          <div class="card-title" style="font-size: 13pt;">Gemini Live Voice Call</div>
          <p class="card-desc" style="font-size: 10.5pt;">Simulates accounts follow-up call with ephemeral token (15-min expiry). AI asks for consent, states 4 mathematical facts, and records promise date.</p>
        </div>
      </div>

      <div class="card" style="padding: 0.2in 0.3in; background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.3); display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 11pt; color: #cbd5e1;"><strong>Fully Tested &amp; Working Today:</strong> 67 unit tests covering leap years, month-ends, and zero overdue edge cases.</span>
        <span style="font-family: 'JetBrains Mono', monospace; font-size: 10pt; color: #10b981; font-weight: bold;">npm test: 67 passed (100%)</span>
      </div>
    </div>

    <div class="slide-footer">
      <div>Startup Buildathon India 2026 · Founder: Nirmal Sinh Chouhan</div>
      <div>Confidential &amp; Proprietary · Team Tech Titan</div>
    </div>
  </div>

  <!-- SLIDE 5: SECTION 43B(h) LEVERAGE -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-brand">
        <img src="${logoSrc}" class="slide-logo" />
        <div class="slide-brand-text">HAQ <span>AI</span> · Team Tech Titan</div>
      </div>
      <div class="slide-tag">Game Changer Regulation</div>
      <div class="slide-number">05 / 11</div>
    </div>

    <div class="slide-body">
      <div class="slide-title-area">
        <div class="slide-title">Section 43B(h): <span class="gradient-text">The Corporate Tax Leverage</span></div>
        <div class="slide-subtitle">
          How income tax law transforms supplier recovery from hostile confrontation into CFO tax savings.
        </div>
      </div>

      <div class="grid-2" style="margin-bottom: 0.3in;">
        <div class="card card-highlight">
          <div class="card-title" style="color: #f59e0b;">What is Section 43B(h)?</div>
          <p class="card-desc" style="margin-bottom: 0.15in;">
            Introduced in Finance Act 2023 (effective FY 2023-24 onwards):<br/>
            Any sum payable by a buyer to a registered Micro or Small Enterprise beyond the time limit specified in Section 15 of MSMED Act (15 days or agreed up to 45 days) <strong>shall be disallowed as an expense deduction</strong> in that assessment year.
          </p>
          <div style="background: rgba(0, 0, 0, 0.3); padding: 12px; border-radius: 8px; font-size: 11pt; color: #e2e8f0;">
            <strong>Net Corporate Impact:</strong> Corporate buyer must pay <strong>30% corporate tax + surcharge</strong> on the entire unpaid invoice value!
          </div>
        </div>

        <div class="card">
          <div class="card-title">Haq AI Buyer Risk Matrix</div>
          <p class="card-desc" style="margin-bottom: 0.15in;">
            Haq AI gives corporate buyers and CFOs an interactive Section 43B(h) exposure matrix:
          </p>
          <ul style="padding-left: 20px; font-size: 11pt; color: #94a3b8; line-height: 1.8;">
            <li>Categorizes all MSME invoices into <strong>Safe (&lt;15d)</strong>, <strong>Approaching Term (15-45d)</strong>, and <strong>Disallowed (&gt;45d)</strong>.</li>
            <li>Calculates exact statutory disallowance amount and daily compounding 3× interest liability.</li>
            <li>Enables one-click settlement prior to March 31 financial year-end to preserve tax deductions.</li>
          </ul>
        </div>
      </div>

      <div class="card" style="text-align: center; padding: 0.25in; background: rgba(59, 130, 246, 0.08); border-color: rgba(59, 130, 246, 0.3);">
        <div style="font-size: 14pt; font-weight: 700; color: #60a5fa; margin-bottom: 6px;">The Strategic Advantage</div>
        <p style="font-size: 12pt; color: #cbd5e1; max-width: 10in; margin: 0 auto;">
          When an MSME sends a Haq AI Statutory Notice, they aren't threatening the buyer; they are alerting the buyer's CFO to avoid 30% tax disallowance + 19.5% compound interest penalties. Payment speed increases by over 70%.
        </p>
      </div>
    </div>

    <div class="slide-footer">
      <div>Startup Buildathon India 2026 · Founder: Nirmal Sinh Chouhan</div>
      <div>Confidential &amp; Proprietary · Team Tech Titan</div>
    </div>
  </div>

  <!-- SLIDE 6: MARKET SIZE -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-brand">
        <img src="${logoSrc}" class="slide-logo" />
        <div class="slide-brand-text">HAQ <span>AI</span> · Team Tech Titan</div>
      </div>
      <div class="slide-tag">Market Opportunity</div>
      <div class="slide-number">06 / 11</div>
    </div>

    <div class="slide-body">
      <div class="slide-title-area">
        <div class="slide-title">A Massive, <span class="gradient-text">Underserved Market</span></div>
        <div class="slide-subtitle">
          63+ Million MSMEs contribute 30% of India's GDP. Delayed receivables represent India's largest B2B fintech unlock.
        </div>
      </div>

      <div class="grid-3" style="margin-bottom: 0.35in;">
        <div class="card card-accent">
          <div class="stat-number">63.4M</div>
          <div class="stat-label">Total Indian MSMEs (TAM)</div>
          <p class="card-desc" style="margin-top: 10px;">
            Estimated $4.2B market for receivables management, legal drafting, and cash-flow intelligence tools.
          </p>
        </div>

        <div class="card card-accent" style="border-top-color: #38bdf8;">
          <div class="stat-number" style="color: #38bdf8;">18.5M</div>
          <div class="stat-label">Udyam Registered MSEs (SAM)</div>
          <p class="card-desc" style="margin-top: 10px;">
            Formally registered Micro &amp; Small units with GSTIN, statutory MSMED rights, and active B2B supply invoices (~$950M ARR).
          </p>
        </div>

        <div class="card card-accent" style="border-top-color: #f59e0b;">
          <div class="stat-number" style="color: #f59e0b;">500K</div>
          <div class="stat-label">Initial Target (SOM - Year 1-2)</div>
          <p class="card-desc" style="margin-top: 10px;">
            MSEs in high-density manufacturing clusters (Rajkot, Surat, Pune, Peenya, Coimbatore) facing acute default cycles (~$35M ARR).
          </p>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-title">Macro Tailwinds</div>
          <ul style="padding-left: 20px; font-size: 11pt; color: #94a3b8; line-height: 1.8;">
            <li><strong>Strict Government Enforcement:</strong> Ministry of MSME mandate on MSEFC council resolution within 90 days.</li>
            <li><strong>Digital Public Infrastructure:</strong> Udyam API, GST e-Invoicing integration, and Account Aggregator rails.</li>
            <li><strong>Section 43B(h) Audit Compliance:</strong> Statutory auditors now mandatory-check 45-day MSME payments.</li>
          </ul>
        </div>
        <div class="card">
          <div class="card-title">Target Buyer Demographics</div>
          <p class="card-desc">
            Primary focus on Tier-2 &amp; Tier-3 precision component manufacturers, auto-ancillary units, packaging suppliers, and textile mills where average invoice values range from ₹50,000 to ₹10,00,000.
          </p>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>Startup Buildathon India 2026 · Founder: Nirmal Sinh Chouhan</div>
      <div>Confidential &amp; Proprietary · Team Tech Titan</div>
    </div>
  </div>

  <!-- SLIDE 7: UNFAIR MOATS & SECURITY -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-brand">
        <img src="${logoSrc}" class="slide-logo" />
        <div class="slide-brand-text">HAQ <span>AI</span> · Team Tech Titan</div>
      </div>
      <div class="slide-tag">Defensibility &amp; Moats</div>
      <div class="slide-number">07 / 11</div>
    </div>

    <div class="slide-body">
      <div class="slide-title-area">
        <div class="slide-title">Technical Moats: <span class="gradient-text">Defense-In-Depth</span></div>
        <div class="slide-subtitle">
          How Haq AI solves the trust barrier that keeps traditional legal-tech from scaling.
        </div>
      </div>

      <div class="grid-4" style="margin-bottom: 0.3in;">
        <div class="card card-highlight">
          <div class="card-title" style="font-size: 13pt;">1. Zero-Math AI Sandbox</div>
          <p class="card-desc" style="font-size: 11pt;">LLMs are notorious for mathematical hallucination. We ban LLMs from computing dates or money. Decimal.js deterministic code guarantees CA-auditable 100% precision.</p>
        </div>

        <div class="card card-highlight">
          <div class="card-title" style="font-size: 13pt;">2. Number Integrity Verifier</div>
          <p class="card-desc" style="font-size: 11pt;">When Gemini translates demand notices into Hindi/Gujarati, our code validates that every single digit, GSTIN, and date is unchanged. 1 digit difference = automatic discard.</p>
        </div>

        <div class="card card-highlight">
          <div class="card-title" style="font-size: 13pt;">3. Ephemeral Voice Tokens</div>
          <p class="card-desc" style="font-size: 11pt;">Gemini Live sessions use single-use, 15-minute ephemeral tokens. API keys never reach the browser bundle. Call transcripts are consent-gated.</p>
        </div>

        <div class="card card-highlight">
          <div class="card-title" style="font-size: 13pt;">4. DPDP &amp; Zero PII Logging</div>
          <p class="card-desc" style="font-size: 11pt;">Full compliance with India's DPDP Act with one-click user data erasure. Server logs never print GSTINs, party names, or transaction amounts.</p>
        </div>
      </div>

      <div class="card" style="padding: 0.2in 0.3in; background: rgba(255, 255, 255, 0.03);">
        <div class="card-title" style="font-size: 14pt;">Hard Security Architecture</div>
        <p class="card-desc" style="font-size: 11pt;">
          Magic-bytes file buffer validation (rejects disguised HTML/executables), strict Content Security Policy (CSP), Firestore owner-only security rules, and non-root Docker execution (UID 1001) on Google Cloud Run.
        </p>
      </div>
    </div>

    <div class="slide-footer">
      <div>Startup Buildathon India 2026 · Founder: Nirmal Sinh Chouhan</div>
      <div>Confidential &amp; Proprietary · Team Tech Titan</div>
    </div>
  </div>

  <!-- SLIDE 8: BUSINESS MODEL -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-brand">
        <img src="${logoSrc}" class="slide-logo" />
        <div class="slide-brand-text">HAQ <span>AI</span> · Team Tech Titan</div>
      </div>
      <div class="slide-tag">Monetization</div>
      <div class="slide-number">08 / 11</div>
    </div>

    <div class="slide-body">
      <div class="slide-title-area">
        <div class="slide-title">Business Model: <span class="gradient-text">Freemium to B2B SaaS</span></div>
        <div class="slide-subtitle">
          Accessible pricing for micro suppliers paired with high-value enterprise compliance subscriptions.
        </div>
      </div>

      <div class="grid-3" style="margin-bottom: 0.35in;">
        <div class="card">
          <div class="stat-number" style="font-size: 28pt; color: #94a3b8;">Free Tier</div>
          <div class="stat-label">Grassroots MSE Adoption</div>
          <ul style="padding-left: 20px; font-size: 11pt; color: #cbd5e1; line-height: 1.8; margin-top: 15px;">
            <li>Up to 3 invoices / month</li>
            <li>Statutory due date &amp; 3× interest calculation</li>
            <li>Standard English Legal Demand Notice</li>
            <li>Basic MSMED Section 15 &amp; 16 guidance</li>
          </ul>
        </div>

        <div class="card card-highlight">
          <div class="stat-number" style="font-size: 28pt; color: #10b981;">₹499<span style="font-size: 14pt; color: #94a3b8;"> / mo</span></div>
          <div class="stat-label">Supplier Pro Plan</div>
          <ul style="padding-left: 20px; font-size: 11pt; color: #cbd5e1; line-height: 1.8; margin-top: 15px;">
            <li>Unlimited invoice extractions</li>
            <li>Multilingual notices (Hindi &amp; Gujarati)</li>
            <li>Field-by-field MSME Samadhaan Kit</li>
            <li>Gemini Live voice settlement phone roleplay</li>
            <li>Automated WhatsApp debtor reminders</li>
          </ul>
        </div>

        <div class="card" style="border-top: 4px solid #38bdf8;">
          <div class="stat-number" style="font-size: 28pt; color: #38bdf8;">₹2,499<span style="font-size: 14pt; color: #94a3b8;"> / mo</span></div>
          <div class="stat-label">CA &amp; Enterprise Suite</div>
          <ul style="padding-left: 20px; font-size: 11pt; color: #cbd5e1; line-height: 1.8; margin-top: 15px;">
            <li>Multi-client portfolio for Chartered Accountants</li>
            <li>Bulk GST e-invoice synchronization</li>
            <li>Section 43B(h) Corporate Buyer Risk Matrix</li>
            <li>Batch statutory audit export reports</li>
            <li>Priority MSEFC conciliation counsel network</li>
          </ul>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-title">CAC Advantage via CA Distribution</div>
          <p class="card-desc">Partnering with Chartered Accountants acts as a zero-CAC acquisition channel. A single CA firm introduces 50 to 200 MSME clients to Haq AI to streamline their annual Section 43B(h) audit preparation.</p>
        </div>
        <div class="card">
          <div class="card-title">Transaction &amp; Legal Network Upsell</div>
          <p class="card-desc">Optional referral partnerships with empaneled MSEFC legal practitioners for formal arbitration hearings on a success-fee / referral commission basis.</p>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>Startup Buildathon India 2026 · Founder: Nirmal Sinh Chouhan</div>
      <div>Confidential &amp; Proprietary · Team Tech Titan</div>
    </div>
  </div>

  <!-- SLIDE 9: COMPETITIVE MATRIX -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-brand">
        <img src="${logoSrc}" class="slide-logo" />
        <div class="slide-brand-text">HAQ <span>AI</span> · Team Tech Titan</div>
      </div>
      <div class="slide-tag">Competition</div>
      <div class="slide-number">09 / 11</div>
    </div>

    <div class="slide-body">
      <div class="slide-title-area">
        <div class="slide-title">Competitive Landscape: <span class="gradient-text">Why We Win</span></div>
        <div class="slide-subtitle">
          Accounting software handles bookkeeping; lawyers handle litigation. Haq AI bridges the gap with automated, statutory dispute resolution.
        </div>
      </div>

      <table class="comp-table">
        <thead>
          <tr>
            <th>Key Capabilities</th>
            <th style="background: rgba(16, 185, 129, 0.2); color: #34d399;">HAQ AI (Tech Titan)</th>
            <th>Tally / Zoho Books</th>
            <th>Traditional Law Firms</th>
            <th>MSME Samadhaan Portal</th>
          </tr>
        </thead>
        <tbody>
          <tr class="highlight-row">
            <td><strong>MSMED 3× Compound Interest Engine</strong></td>
            <td><span class="badge-check">✓</span> Exact Integer Paise</td>
            <td><span class="badge-cross">✗</span> Not Supported</td>
            <td><span class="badge-cross">✗</span> Manual Spreadsheets</td>
            <td><span class="badge-cross">✗</span> No Calculator</td>
          </tr>
          <tr>
            <td><strong>Section 43B(h) Buyer Risk Matrix</strong></td>
            <td><span class="badge-check">✓</span> Real-Time Exposure</td>
            <td><span class="badge-cross">✗</span> Static Ledger Only</td>
            <td><span class="badge-cross">✗</span> Retrospective Audit</td>
            <td><span class="badge-cross">✗</span> Not Included</td>
          </tr>
          <tr class="highlight-row">
            <td><strong>Automated Legal Demand Notice</strong></td>
            <td><span class="badge-check">✓</span> 1-Click Code-Locked</td>
            <td><span class="badge-cross">✗</span> Basic Invoice Print</td>
            <td><span class="badge-check">✓</span> Manual (3-7 Days)</td>
            <td><span class="badge-cross">✗</span> Not Offered</td>
          </tr>
          <tr>
            <td><strong>Multilingual Localization (HI/GU)</strong></td>
            <td><span class="badge-check">✓</span> Gemini Localized</td>
            <td><span class="badge-cross">✗</span> English Only</td>
            <td><span class="badge-cross">✗</span> English Only</td>
            <td><span class="badge-cross">✗</span> Rigid English UI</td>
          </tr>
          <tr class="highlight-row">
            <td><strong>Gemini Live Voice Settlement Call</strong></td>
            <td><span class="badge-check">✓</span> Real-Time Interactive</td>
            <td><span class="badge-cross">✗</span> None</td>
            <td><span class="badge-cross">✗</span> Expensive Phone Followup</td>
            <td><span class="badge-cross">✗</span> None</td>
          </tr>
          <tr>
            <td><strong>Cost per Recovery Action</strong></td>
            <td><span class="badge-check">✓</span> Free to ₹499/month</td>
            <td><span class="badge-cross">✗</span> N/A</td>
            <td><span class="badge-cross">✗</span> ₹10,000+ per notice</td>
            <td><span class="badge-check">✓</span> Free (Cumbersome)</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="slide-footer">
      <div>Startup Buildathon India 2026 · Founder: Nirmal Sinh Chouhan</div>
      <div>Confidential &amp; Proprietary · Team Tech Titan</div>
    </div>
  </div>

  <!-- SLIDE 10: GOOGLE CLOUD STACK -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-brand">
        <img src="${logoSrc}" class="slide-logo" />
        <div class="slide-brand-text">HAQ <span>AI</span> · Team Tech Titan</div>
      </div>
      <div class="slide-tag">Technology &amp; Architecture</div>
      <div class="slide-number">10 / 11</div>
    </div>

    <div class="slide-body">
      <div class="slide-title-area">
        <div class="slide-title">Built on <span class="gradient-text">Google Cloud &amp; Gemini</span></div>
        <div class="slide-subtitle">
          Enterprise scalability, zero-secret repository hygiene, and microsecond serverless execution.
        </div>
      </div>

      <div class="grid-4" style="margin-bottom: 0.3in;">
        <div class="card card-accent" style="border-top-color: #38bdf8;">
          <div class="card-title" style="font-size: 13pt;">Google Cloud Run</div>
          <p class="card-desc" style="font-size: 11pt;">Multi-stage Dockerized Next.js 14 App Router, auto-scaling from 0 to N instances with non-root security container execution (UID 1001).</p>
        </div>

        <div class="card card-accent" style="border-top-color: #10b981;">
          <div class="card-title" style="font-size: 13pt;">Gemini 2.5 &amp; Live API</div>
          <p class="card-desc" style="font-size: 11pt;">Structured schema extraction via @google/genai SDK on server, paired with real-time WebSocket Live sessions using short-lived ephemeral tokens.</p>
        </div>

        <div class="card card-accent" style="border-top-color: #f59e0b;">
          <div class="card-title" style="font-size: 13pt;">Firestore &amp; Storage</div>
          <p class="card-desc" style="font-size: 11pt;">Cloud Firestore with owner-isolated security rules and per-UID atomic rate limiting. Private bucket with magic-bytes buffer validation &amp; signed URLs.</p>
        </div>

        <div class="card card-accent" style="border-top-color: #a855f7;">
          <div class="card-title" style="font-size: 13pt;">Secret Manager &amp; CI/CD</div>
          <p class="card-desc" style="font-size: 11pt;">Runtime secret injection via Google Cloud Secret Manager. Automated Vitest suites (67 tests) and Cloud Build continuous delivery.</p>
        </div>
      </div>

      <div class="grid-2">
        <div class="card" style="background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.3);">
          <div class="card-title" style="color: #34d399;">Development Platforms</div>
          <p class="card-desc">Architected using <strong>Google AI Studio</strong> for prompt schema engineering and built with <strong>Google Antigravity</strong> agentic pair-programming workflows.</p>
        </div>
        <div class="card" style="background: rgba(59, 130, 246, 0.08); border-color: rgba(59, 130, 246, 0.3);">
          <div class="card-title" style="color: #60a5fa;">Verifiable Code Quality</div>
          <p class="card-desc">100% Strict TypeScript, zero ESLint warnings, 67 Vitest unit tests, clean production standalone build, and strict Content Security Policy.</p>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>Startup Buildathon India 2026 · Founder: Nirmal Sinh Chouhan</div>
      <div>Confidential &amp; Proprietary · Team Tech Titan</div>
    </div>
  </div>

  <!-- SLIDE 11: TEAM & VISION -->
  <div class="slide">
    <div class="slide-header">
      <div class="slide-brand">
        <img src="${logoSrc}" class="slide-logo" />
        <div class="slide-brand-text">HAQ <span>AI</span> · Team Tech Titan</div>
      </div>
      <div class="slide-tag">Team &amp; Roadmap</div>
      <div class="slide-number">11 / 11</div>
    </div>

    <div class="slide-body">
      <div class="slide-title-area">
        <div class="slide-title">Team Tech Titan &amp; <span class="gradient-text">Our Vision</span></div>
        <div class="slide-subtitle">
          Building India's most trusted legal-fintech infrastructure for small enterprises.
        </div>
      </div>

      <div class="grid-2" style="margin-bottom: 0.35in;">
        <div class="card card-highlight">
          <div style="display: flex; gap: 0.25in; align-items: center; margin-bottom: 0.2in;">
            <img src="${logoSrc}" style="width: 1in; height: 1in; border-radius: 50%; border: 3px solid #10b981;" />
            <div>
              <div style="font-size: 20pt; font-weight: 800; color: #ffffff;">Nirmal Sinh Chouhan</div>
              <div style="font-size: 13pt; color: #10b981; font-weight: 600;">Founder &amp; Lead Systems Architect</div>
              <div style="font-size: 11pt; color: #94a3b8; margin-top: 4px;">Team Tech Titan · Startup Buildathon India 2026</div>
            </div>
          </div>
          <p class="card-desc" style="font-size: 11.5pt;">
            Full-stack engineer and solutions architect leading Team Tech Titan. Driven by the mission of applying deep systems engineering, deterministic financial sandboxing, and responsible AI to solve structural economic problems for Bharat's grassroots businesses.
          </p>
        </div>

        <div class="card">
          <div class="card-title">12-Month Execution Roadmap</div>
          <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
            <div style="display: flex; gap: 12px; font-size: 11pt;">
              <span style="color: #10b981; font-weight: bold; min-width: 70px;">Q1 2026:</span>
              <span style="color: #cbd5e1;">MVP Completion, 67 unit tests, Google Cloud Run live deployment. (Completed)</span>
            </div>
            <div style="display: flex; gap: 12px; font-size: 11pt;">
              <span style="color: #38bdf8; font-weight: bold; min-width: 70px;">Q2 2026:</span>
              <span style="color: #cbd5e1;">Pilot onboarding of 5,000 MSEs across Gujarat &amp; Maharashtra manufacturing corridors.</span>
            </div>
            <div style="display: flex; gap: 12px; font-size: 11pt;">
              <span style="color: #f59e0b; font-weight: bold; min-width: 70px;">Q3 2026:</span>
              <span style="color: #cbd5e1;">CA Network Portal rollout &amp; automated WhatsApp dispute resolution bots.</span>
            </div>
            <div style="display: flex; gap: 12px; font-size: 11pt;">
              <span style="color: #a855f7; font-weight: bold; min-width: 70px;">Q4 2026:</span>
              <span style="color: #cbd5e1;">₹100 Crore in cumulative overdue MSME receivables recovered with statutory interest.</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card" style="text-align: center; padding: 0.25in; background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(30, 58, 138, 0.2) 100%); border-color: rgba(16, 185, 129, 0.4);">
        <div style="font-size: 17pt; font-weight: 800; color: #ffffff; margin-bottom: 6px;">
          "Every Indian micro-entrepreneur deserves their statutory haq (right)."
        </div>
        <p style="font-size: 12pt; color: #94a3b8;">
          Join us in empowering India's job creators with Haq AI. Built with pride for Startup Buildathon India 2026.
        </p>
      </div>
    </div>

    <div class="slide-footer">
      <div>Startup Buildathon India 2026 · Founder: Nirmal Sinh Chouhan</div>
      <div>Team Tech Titan · Contact: nirmal.chouhan@example.com</div>
    </div>
  </div>

</body>
</html>`;

  const htmlPath = path.join(__dirname, '../public/pitch_deck_temp.html');
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log('[PITCH DECK] Wrote slide HTML to:', htmlPath);

  // Generate PDF via Headless Chrome/Edge into public folder first
  const outPdfLocal = path.join(__dirname, '../public/Haq_AI_Pitch_Deck_Tech_Titan.pdf');
  const outPdfDownloads = 'C:\\Users\\ASUS\\Downloads\\Haq_AI_Pitch_Deck_Tech_Titan.pdf';
  const outPdfDownloadsAlt = 'C:\\Users\\ASUS\\Downloads\\Haq_AI_Pitch_Deck_Tech_Titans.pdf';
  const outPdfDesktop = 'C:\\Users\\ASUS\\OneDrive\\Desktop\\Haq_AI_Pitch_Deck_Tech_Titan.pdf';
  const outPdfDesktopAlt = 'C:\\Users\\ASUS\\OneDrive\\Desktop\\Haq_AI_Pitch_Deck_Tech_Titans.pdf';

  const browserPath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  console.log('[PITCH DECK] Rendering PDF via browser:', browserPath);

  const fileUri = 'file:///' + htmlPath.replace(/\\/g, '/');
  const cmd = `"${browserPath}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${outPdfLocal}" "${fileUri}"`;
  execSync(cmd, { stdio: 'inherit' });

  console.log('[PITCH DECK] Generated in public:', outPdfLocal);

  // Copy to Downloads & Desktop safely
  const targets = [
    outPdfDownloads,
    outPdfDownloadsAlt,
    outPdfDesktop,
    outPdfDesktopAlt,
    'C:\\Users\\ASUS\\Downloads\\Haq_AI_Official_Pitch_Deck_11_Slides.pdf',
    'C:\\Users\\ASUS\\OneDrive\\Desktop\\Haq_AI_Official_Pitch_Deck_11_Slides.pdf'
  ];

  for (const target of targets) {
    try {
      fs.copyFileSync(outPdfLocal, target);
      console.log('[PITCH DECK] Copied to:', target);
    } catch (e) {
      console.warn('[PITCH DECK] Skip copy to ' + target + ':', e.message);
    }
  }

  const stats = fs.statSync(outPdfLocal);
  console.log(`[PITCH DECK] Success! File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(err => {
  console.error('[PITCH DECK ERROR]', err);
  process.exit(1);
});
