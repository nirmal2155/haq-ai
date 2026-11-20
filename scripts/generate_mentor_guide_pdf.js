const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  console.log('[MENTOR GUIDE] Reading logo asset...');
  const logoPath = path.join(__dirname, '../public/tech_titan_logo.jpg');
  const logoBase64 = fs.readFileSync(logoPath).toString('base64');
  const logoSrc = `data:image/jpeg;base64,${logoBase64}`;

  console.log('[MENTOR GUIDE] Building comprehensive Founder & Mentor Handbook HTML...');

  const html = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>Haq AI — Founder & Mentor Pitch Handbook</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');

    @page {
      size: A4 portrait;
      margin: 18mm 16mm 18mm 16mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', 'Noto Sans Devanagari', -apple-system, sans-serif;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.55;
      font-size: 10pt;
    }

    .page-break {
      page-break-after: always;
      break-after: page;
    }

    /* Cover Page */
    .cover {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 250mm;
      padding: 20mm 10mm;
      text-align: center;
      background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      border-radius: 12px;
    }

    .cover-logo {
      width: 85px;
      height: 85px;
      border-radius: 50%;
      border: 3px solid #10b981;
      margin: 0 auto 15px auto;
      object-fit: cover;
    }

    .cover-tag {
      display: inline-block;
      font-size: 9pt;
      font-weight: 800;
      letter-spacing: 2px;
      color: #10b981;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 6px 16px;
      border-radius: 50px;
      text-transform: uppercase;
      margin-bottom: 20px;
    }

    .cover-title {
      font-size: 34pt;
      font-weight: 900;
      letter-spacing: -1px;
      line-height: 1.15;
      margin-bottom: 12px;
      color: #ffffff;
    }

    .cover-title span {
      color: #10b981;
    }

    .cover-subtitle {
      font-size: 13pt;
      font-weight: 600;
      color: #94a3b8;
      max-width: 520px;
      margin: 0 auto 25px auto;
      line-height: 1.4;
    }

    .cover-divider {
      width: 60px;
      height: 3px;
      background: #10b981;
      margin: 0 auto 25px auto;
    }

    .cover-meta {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 14px 20px;
      max-width: 460px;
      margin: 0 auto;
      text-align: left;
      font-size: 10pt;
    }

    .cover-meta-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .cover-meta-row:last-child {
      border-bottom: none;
    }

    .cover-meta-label {
      color: #94a3b8;
    }

    .cover-meta-val {
      font-weight: 700;
      color: #ffffff;
    }

    /* Standard Page Layout */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 8px;
      margin-bottom: 16px;
      font-size: 8.5pt;
      color: #64748b;
    }

    .page-header-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 800;
      color: #0f172a;
    }

    .page-header-logo {
      width: 18px;
      height: 18px;
      border-radius: 50%;
    }

    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
      margin-top: 20px;
      font-size: 8pt;
      color: #94a3b8;
    }

    /* Section Styles */
    h1.sec-title {
      font-size: 18pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sec-badge {
      display: inline-block;
      font-size: 8pt;
      font-weight: 800;
      color: #059669;
      background: #ecfdf5;
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid #a7f3d0;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .sec-desc {
      font-size: 9.5pt;
      color: #475569;
      margin-bottom: 16px;
    }

    /* Cards & Boxes */
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 12px;
    }

    .card-emerald {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }

    .card-amber {
      background: #fffbeb;
      border-color: #fde68a;
    }

    .card-blue {
      background: #f0f9ff;
      border-color: #bae6fd;
    }

    .card-title {
      font-size: 11pt;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .card-body {
      font-size: 9.5pt;
      color: #334155;
    }

    /* Q&A Component */
    .qa-box {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      margin-bottom: 14px;
      overflow: hidden;
    }

    .qa-q {
      background: #0f172a;
      color: #ffffff;
      padding: 9px 13px;
      font-weight: 700;
      font-size: 10pt;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .qa-q-num {
      background: #10b981;
      color: #090d16;
      border-radius: 4px;
      font-size: 8pt;
      font-weight: 900;
      padding: 2px 6px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .qa-a {
      background: #ffffff;
      padding: 11px 13px;
      font-size: 9.2pt;
      color: #1e293b;
      line-height: 1.5;
    }

    .qa-highlight {
      background: #f1f5f9;
      border-left: 3px solid #10b981;
      padding: 6px 10px;
      margin: 8px 0;
      font-size: 8.8pt;
      color: #0f172a;
      font-weight: 600;
    }

    /* Tables */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.8pt;
      margin: 12px 0;
    }

    table.data-table th {
      background: #1e293b;
      color: #ffffff;
      padding: 7px 10px;
      text-align: left;
      font-weight: 700;
    }

    table.data-table td {
      padding: 7px 10px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }

    table.data-table tr:nth-child(even) td {
      background: #f8fafc;
    }

    .badge-yes {
      color: #059669;
      font-weight: 800;
    }

    .badge-no {
      color: #dc2626;
      font-weight: 800;
    }

    /* Key Metrics */
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 14px;
    }

    .metric-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px;
      text-align: center;
    }

    .metric-val {
      font-size: 16pt;
      font-weight: 900;
      color: #059669;
      line-height: 1.1;
    }

    .metric-lbl {
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      margin-top: 4px;
    }

    ul.bullet-list {
      padding-left: 18px;
      margin: 6px 0;
    }

    ul.bullet-list li {
      margin-bottom: 4px;
      font-size: 9.2pt;
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover page-break">
    <div>
      <div class="cover-tag">Startup Buildathon India 2026 · Official Guide</div>
      <img src="${logoSrc}" class="cover-logo" />
      <h1 class="cover-title">HAQ <span>AI</span></h1>
      <p class="cover-subtitle">Founder's Master Pitch &amp; Mentor Q&amp;A Handbook</p>
      <div class="cover-divider"></div>
      <p style="font-size: 11pt; color: #cbd5e1; max-width: 500px; margin: 0 auto; line-height: 1.5;">
        A complete, doubt-clearing guide for presentations, mentor evaluations, and investor questioning.
      </p>
    </div>

    <div class="cover-meta">
      <div class="cover-meta-row">
        <span class="cover-meta-label">Project / Startup:</span>
        <span class="cover-meta-val">Haq AI</span>
      </div>
      <div class="cover-meta-row">
        <span class="cover-meta-label">Team Name:</span>
        <span class="cover-meta-val">Tech Titan</span>
      </div>
      <div class="cover-meta-row">
        <span class="cover-meta-label">Founder &amp; Architect:</span>
        <span class="cover-meta-val">Nirmal Sinh Chouhan</span>
      </div>
      <div class="cover-meta-row">
        <span class="cover-meta-label">Primary Track:</span>
        <span class="cover-meta-val">Cloud Tech &amp; DevOps / Open Innovation</span>
      </div>
      <div class="cover-meta-row">
        <span class="cover-meta-label">Core Mission:</span>
        <span class="cover-meta-val">MSME Payment Enforcement (MSMED Act &amp; 43B(h))</span>
      </div>
    </div>

    <div style="font-size: 8pt; color: #64748b;">
      Confidential &amp; Proprietary · Prepared for City Pitch &amp; National Judging Rounds
    </div>
  </div>

  <!-- PAGE 1: IDEA IN SIMPLE WORDS -->
  <div class="page-break">
    <div class="page-header">
      <div class="page-header-brand">
        <img src="${logoSrc}" class="page-header-logo" />
        <span>HAQ AI · Team Tech Titan</span>
      </div>
      <div>Section 1: The Core Idea</div>
    </div>

    <span class="sec-badge">Fundamental Concept</span>
    <h1 class="sec-title">1. मेरा आइडिया क्या है? (What is Haq AI?)</h1>
    <p class="sec-desc">
      Haq AI भारत के 6.3 करोड़ सूक्ष्म और लघु उद्योगों (Micro &amp; Small Enterprises) के लिए एक <strong>Deterministic Legal-Tech &amp; Cashflow Recovery Platform</strong> है।
    </p>

    <div class="metric-grid">
      <div class="metric-box">
        <div class="metric-val">₹10L Cr</div>
        <div class="metric-lbl">Locked Receivables</div>
      </div>
      <div class="metric-box">
        <div class="metric-val">63.4M</div>
        <div class="metric-lbl">Indian MSMEs</div>
      </div>
      <div class="metric-box">
        <div class="metric-val">45 Days</div>
        <div class="metric-lbl">Statutory Limit</div>
      </div>
      <div class="metric-box">
        <div class="metric-val">3× RBI</div>
        <div class="metric-lbl">Compound Interest</div>
      </div>
    </div>

    <div class="card card-emerald">
      <div class="card-title">💡 आसान भाषा में समझें (The 1-Minute Concept)</div>
      <div class="card-body">
        मान लीजिए राजकोट में एक छोटी लेथ मशीन फैक्ट्री है जो पुणे की एक बड़ी ऑटोमोबाइल कंपनी को ₹2,00,000 के गियर पार्ट्स बेचती है। बड़ी कंपनी 30 दिन का वादा करके 6 महीने (180 दिन) तक पेमेंट नहीं करती। 
        <br/><br/>
        छोटा सप्लायर दो कारणों से चुप रहता है:
        <ul class="bullet-list">
          <li><strong>डर:</strong> अगर वकील से नोटिस भेजा, तो बड़ी कंपनी आगे ऑर्डर देना बंद कर देगी।</li>
          <li><strong>खर्च:</strong> वकील एक नोटिस बनाने का ही ₹10,000 मांगता है, और ब्याज की जटिल गणित किसी को नहीं आती।</li>
        </ul>
        <strong>Haq AI यहाँ क्या करता है?</strong> छोटा सप्लायर सिर्फ अपने बिल की फोटो खींचता है। Haq AI 2 मिनट में MSMED Act 2006 के तहत उसका कानूनन <strong>3 गुना चक्रवृद्धि ब्याज</strong> जोड़कर लीगल नोटिस बनाता है, और खरीदार कंपनी को इनकम टैक्स <strong>Section 43B(h)</strong> का ऐसा रिस्क दिखाता है कि बड़ी कंपनी खुद फोन करके पेमेंट रिलीज करती है!
      </div>
    </div>

    <div class="card card-blue">
      <div class="card-title">⚖️ दो कानूनी पिलर जो Haq AI को ताकत देते हैं</div>
      <div class="card-body">
        <strong>1. MSMED Act 2006 (धारा 15 और 16):</strong><br/>
        बिना एग्रीमेंट 15 दिन और एग्रीमेंट होने पर अधिकतम 45 दिन में पेमेंट अनिवार्य है। 45 दिन बाद RBI बैंक रेट का 3 गुना ब्याज (लगभग 19.5% सालाना, हर महीने कंपाउंड) देना कानूनन बाउंड है।
        <br/><br/>
        <strong>2. Income Tax Act Section 43B(h) (अप्रैल 2024 से लागू):</strong><br/>
        अगर किसी बायर ने MSME सप्लायर का बिल 45 दिन के अंदर क्लियर नहीं किया, तो बायर उस खर्च को टैक्स डिडक्शन में नहीं दिखा सकता! यानी बायर को उस बिल पर <strong>30% कॉर्पोरेट टैक्स + पेनल्टी</strong> अपनी जेब से भरनी पड़ेगी।
      </div>
    </div>

    <div class="page-footer">
      <div>Founder: Nirmal Sinh Chouhan (Tech Titan)</div>
      <div>Page 2 of 6</div>
    </div>
  </div>

  <!-- PAGE 2: HOW IT WORKS & ARCHITECTURE -->
  <div class="page-break">
    <div class="page-header">
      <div class="page-header-brand">
        <img src="${logoSrc}" class="page-header-logo" />
        <span>HAQ AI · Team Tech Titan</span>
      </div>
      <div>Section 2: System Architecture</div>
    </div>

    <span class="sec-badge">How It Works</span>
    <h1 class="sec-title">2. यह कैसे काम करता है? (Step-by-Step Architecture)</h1>
    <p class="sec-desc">
      Haq AI का पूरा वर्कफ़्लो 6 स्टेप्स में बना है, जिसमें "Zero-Math AI" और हाई-सिक्योरिटी क्लाउड का पालन किया गया है:
    </p>

    <div class="card">
      <div class="card-title">Step 1: Upload &amp; Magic-Bytes Buffer Shield</div>
      <div class="card-body">
        यूजर PDF या फोटो अपलोड करता है (Max 8 MB)। सर्वर फाइल एक्सटेंशन पर भरोसा नहीं करता; वह फाइल के पहले बाइट्स (%PDF, JPEG हेडर) चेक करता है ताकि कोई वायरस/HTML इंजेक्ट न हो सके। फाइल्स Google Cloud Storage के प्राइवेट बकेट में UUID के साथ सेव होती हैं और 5 मिनट के साइन्ड URL से ही सर्व होती हैं।
      </div>
    </div>

    <div class="card">
      <div class="card-title">Step 2: Google Gemini Multimodal Document Extraction</div>
      <div class="card-body">
        Google Gemini 2.5 Flash API इनवॉइस को स्कैन करके खरीदार का नाम, GSTIN, बिल नंबर, बिल डेट और अमाउंट को स्ट्रक्चर्ड JSON में निकालता है। स्क्रीन पर यूजर को डेटा वेरिफाई और एडिट करने का मौका मिलता है (Human-in-the-Loop)।
      </div>
    </div>

    <div class="card card-emerald">
      <div class="card-title">Step 3: Deterministic Financial Engine (No AI Math!)</div>
      <div class="card-body">
        <strong>सबसे बड़ा नियम: AI कभी भी पैसे या ब्याज कैलकुलेट नहीं करता।</strong><br/>
        पैसे और ब्याज की गणना शुद्ध कोडिंग इंजन (<code>Decimal.js</code>) से होती है। यह पैसे-पैसे का सटीक हिसाब, लीप-ईयर और मंथली कंपाउंडिंग निकालता है। (67 यूनिट टेस्ट्स से पूरी तरह प्रमाणित)।
      </div>
    </div>

    <div class="card">
      <div class="card-title">Step 4: Code-Injected Legal Notices &amp; Integrity Verifier</div>
      <div class="card-body">
        कानूनी नोटिस का ढांचा कोड द्वारा भरा जाता है। Gemini AI इसका अनुवाद हिंदी और गुजराती में करता है। हमारा <strong>Number Integrity Verifier</strong> चेक करता है कि AI ने कोई भी नंबर या तारीख बदली तो नहीं—अगर 1 डिजिट भी बदली, तो ट्रांसलेशन तुरंत रिजेक्ट होकर सेफ ओरिजिनल टेम्पलेट लग जाता है।
      </div>
    </div>

    <div class="card">
      <div class="card-title">Step 5: Corporate Buyer Section 43B(h) Risk Matrix</div>
      <div class="card-body">
        बायर के लिए एक लाइव डैशबोर्ड है जो दिखाता है कि कौन-सा बिल 15 दिन पार कर चुका है और किस पर 30% टैक्स डिडक्शन खत्म हो रहा है। इससे बायर विवाद करने के बजाय 31 मार्च से पहले खुद बिल चुकाने की कोशिश करता है।
      </div>
    </div>

    <div class="card">
      <div class="card-title">Step 6: Gemini Live Voice Settlement Simulation</div>
      <div class="card-body">
        Google Gemini Live WebSockets और अल्पकालिक (15 मिनट) Ephemeral Tokens का उपयोग करके बायर की एकाउंट्स टीम के साथ एक शिष्ट और तथ्यपरक बातचीत सिमुलेट की जाती है।
      </div>
    </div>

    <div class="page-footer">
      <div>Founder: Nirmal Sinh Chouhan (Tech Titan)</div>
      <div>Page 3 of 6</div>
    </div>
  </div>

  <!-- PAGE 3: WHY IT IS UNIQUE & MOATS -->
  <div class="page-break">
    <div class="page-header">
      <div class="page-header-brand">
        <img src="${logoSrc}" class="page-header-logo" />
        <span>HAQ AI · Team Tech Titan</span>
      </div>
      <div>Section 3: Competitive Advantage</div>
    </div>

    <span class="sec-badge">Differentiation &amp; Moats</span>
    <h1 class="sec-title">3. यह दूसरों से अलग क्यों है? (Why It Is Unique)</h1>
    <p class="sec-desc">
      मार्केट में एकाउंटिंग सॉफ्टवेयर हैं और वकील भी हैं, लेकिन Haq AI उनके बीच की सबसे बड़ी खाई को पाटता है:
    </p>

    <table class="data-table">
      <thead>
        <tr>
          <th>पैरामीटर</th>
          <th>Tally / Zoho Books</th>
          <th>पारंपरिक वकील (Lawyer)</th>
          <th>सरकारी Samadhaan</th>
          <th>HAQ AI (Tech Titan)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>फोकस</strong></td>
          <td>सिर्फ बहीखाता (Accounting)</td>
          <td>मुकदमेबाजी (Litigation)</td>
          <td>शिकायत फॉर्म भरना</td>
          <td><strong>पेमेंट रिकवरी &amp; सेटलमेंट</strong></td>
        </tr>
        <tr>
          <td><strong>3× कंपाउंड ब्याज</strong></td>
          <td><span class="badge-no">✗ नहीं है</span></td>
          <td><span class="badge-no">✗ मैन्युअल एक्सेल</span></td>
          <td><span class="badge-no">✗ कोई टूल नहीं</span></td>
          <td><span class="badge-yes">✓ 100% सटीक पैसे-इंजन</span></td>
        </tr>
        <tr>
          <td><strong>Section 43B(h) टैक्स रिस्क</strong></td>
          <td><span class="badge-no">✗ बेसिक लेजर</span></td>
          <td><span class="badge-no">✗ साल के अंत में</span></td>
          <td><span class="badge-no">✗ नहीं</span></td>
          <td><span class="badge-yes">✓ लाइव बायर रिस्क मैट्रिक्स</span></td>
        </tr>
        <tr>
          <td><strong>लीगल नोटिस की लागत</strong></td>
          <td><span class="badge-no">✗ नहीं बनाता</span></td>
          <td>₹5,000 – ₹15,000</td>
          <td><span class="badge-no">✗ नहीं बनाता</span></td>
          <td><strong>फ्री से मात्र ₹499/महीना</strong></td>
        </tr>
        <tr>
          <td><strong>भाषा सपोर्ट</strong></td>
          <td>अंग्रेजी</td>
          <td>अंग्रेजी</td>
          <td>कठिन अंग्रेजी पोर्टल</td>
          <td><strong>हिंदी, गुजराती, इंग्लिश</strong></td>
        </tr>
        <tr>
          <td><strong>वॉयस AI असिस्टेंट</strong></td>
          <td><span class="badge-no">✗ नहीं</span></td>
          <td><span class="badge-no">✗ नहीं</span></td>
          <td><span class="badge-no">✗ नहीं</span></td>
          <td><strong>Gemini Live Voice</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="card card-amber" style="margin-top: 15px;">
      <div class="card-title">🛡️ हमारे 4 तकनीकी सुरक्षा कवच (Unfair Moats)</div>
      <div class="card-body">
        <ul class="bullet-list">
          <li><strong>Zero-Math AI Sandbox:</strong> आम चैटबॉट संख्याओं में गलतियाँ (hallucination) करते हैं। Haq AI में AI सिर्फ टेक्स्ट समझता है; गणित 100% कोडेड डेसिमल इंजन से होता है।</li>
          <li><strong>Number Integrity Verifier:</strong> अगर ट्रांसलेशन के दौरान किसी भी AI मॉडल ने एक भी रुपया, जीएसटी नंबर या तारीख बदल दी, तो सिस्टम उसे तुरंत ब्लॉक कर देता है।</li>
          <li><strong>Ephemeral Token Architecture:</strong> Gemini Live वॉयस कॉल के लिए ब्राउज़र में कभी भी API Key नहीं भेजी जाती; सिर्फ 15 मिनट का वन-टाइम टोकन जनरेट होता है।</li>
          <li><strong>DPDP Act &amp; Zero PII:</strong> सर्वर लॉग में कोई नाम या जीएसटी नंबर नहीं छपता; यूजर डेटा को डिलीट करने का वन-क्लिक ऑप्शन मौजूद है।</li>
        </ul>
      </div>
    </div>

    <div class="page-footer">
      <div>Founder: Nirmal Sinh Chouhan (Tech Titan)</div>
      <div>Page 4 of 6</div>
    </div>
  </div>

  <!-- PAGE 4: TOP MENTOR & JUDGE QUESTIONS (PART 1) -->
  <div class="page-break">
    <div class="page-header">
      <div class="page-header-brand">
        <img src="${logoSrc}" class="page-header-logo" />
        <span>HAQ AI · Team Tech Titan</span>
      </div>
      <div>Section 4: Mentor Q&amp;A (Part 1)</div>
    </div>

    <span class="sec-badge">Evaluation Defense</span>
    <h1 class="sec-title">4. मेंटर्स और जजों के टॉप सवाल और सटीक जवाब</h1>
    <p class="sec-desc">
      जब भी कोई जज या मेंटर आपसे तीखे सवाल पूछे, तो आपको आत्मविश्वास के साथ ये जवाब देने हैं:
    </p>

    <!-- Q1 -->
    <div class="qa-box">
      <div class="qa-q">
        <span class="qa-q-num">Q1</span>
        <span>"मार्केट में Tally और Zoho Books पहले से हैं, तो व्यापारी तुम्हारा ऐप क्यों इस्तेमाल करेगा?"</span>
      </div>
      <div class="qa-a">
        <strong>सटीक जवाब:</strong><br/>
        "सर, Tally और Zoho केवल अकाउंटिंग और टैक्स फाइलिंग के बहीखाते हैं। वे यह तो बता देते हैं कि ₹2 लाख लेना बाकी है, लेकिन वे MSMED Act 2006 के तहत 3 गुना चक्रवृद्धि ब्याज कैलकुलेट नहीं कर सकते, न ही वे कानूनी डिमांड नोटिस बनाते हैं, और न ही बायर को Section 43B(h) का टैक्स नुकसान दिखाते हैं। 
        <div class="qa-highlight">
          Tally केवल बीमारी का रिकॉर्ड रखता है; Haq AI उस बीमारी की कानूनी और आर्थिक दवाई देता है।"
        </div>
      </div>
    </div>

    <!-- Q2 -->
    <div class="qa-box">
      <div class="qa-q">
        <span class="qa-q-num">Q2</span>
        <span>"अगर AI ने कानूनी नोटिस में कोई गलत तारीख या गलत रकम लिख दी, तो क्या सप्लायर कोर्ट में नहीं फंस जाएगा?"</span>
      </div>
      <div class="qa-a">
        <strong>सटीक जवाब:</strong><br/>
        "सर, यही हमारे सिस्टम का सबसे बड़ा इनोवेशन है—<strong>Zero-Math AI</strong>। हमने अपने कोड में हार्ड रूल बनाया है कि AI कभी भी तारीख, पैसे या ब्याज की गणना नहीं कर सकता। पूरी गणना हमारे डिटरमिनिस्टिक डेसिमल इंजन (<code>Decimal.js</code>) से होती है।
        <div class="qa-highlight">
          इसके अलावा, हमारा 'Number Integrity Verifier' अनुवाद के बाद हर एक डिजिट और डेट को मैच करता है। अगर AI ने एक भी अंक बदला, तो वह अनुवाद तुरंत रद्द हो जाता है।"
        </div>
      </div>
    </div>

    <!-- Q3 -->
    <div class="qa-box">
      <div class="qa-q">
        <span class="qa-q-num">Q3</span>
        <span>"बड़ा कॉर्पोरेट बायर एक छोटे सप्लायर के Haq AI नोटिस को देखकर डरेगा क्यों? वो इग्नोर क्यों नहीं कर देगा?"</span>
      </div>
      <div class="qa-a">
        <strong>सटीक जवाब:</strong><br/>
        "सर, बायर सप्लायर से नहीं, बल्कि <strong>Income Tax Section 43B(h)</strong> से डरता है। 
        अगर बायर 45 दिन में MSME का पेमेंट नहीं करता, तो इनकम टैक्स विभाग उस खर्च पर बायर का टैक्स डिडक्शन रद्द कर देता है, जिससे बायर को 30% अतिरिक्त टैक्स भरना पड़ता है। 
        <div class="qa-highlight">
          हमारा नोटिस विवाद पैदा नहीं करता, बल्कि बायर के CFO को यह समझाता है कि ₹2 लाख का बिल तुरंत चुकाने में उसका ₹60,000 का टैक्स बच रहा है!"
        </div>
      </div>
    </div>

    <!-- Q4 -->
    <div class="qa-box">
      <div class="qa-q">
        <span class="qa-q-num">Q4</span>
        <span>"तुम्हारा बिजनेस मॉडल क्या है? तुम पैसा कैसे कमाओगे?"</span>
      </div>
      <div class="qa-a">
        <strong>सटीक जवाब:</strong><br/>
        "हमारा फ्रीमियम SaaS (B2B) मॉडल है:
        <ul class="bullet-list">
          <li><strong>Free Tier:</strong> हर छोटे व्यापारी के लिए 3 इनवॉइस प्रति माह, ड्यू डेट और बेसिक ब्याज गणना पूरी तरह फ्री।</li>
          <li><strong>Supplier Pro (₹499/महीना):</strong> अनलिमिटेड इनवॉइस, हिंदी/गुजराती नोटिस, MSME Samadhaan किट और AI वॉयस कॉल।</li>
          <li><strong>CA &amp; Enterprise Dashboard (₹2,499/महीना):</strong> चार्टर्ड एकाउंटेंट्स (CAs) के लिए मल्टी-क्लाइंट 43B(h) ऑडिट पोर्टल।</li>
        </ul>"
      </div>
    </div>

    <div class="page-footer">
      <div>Founder: Nirmal Sinh Chouhan (Tech Titan)</div>
      <div>Page 5 of 6</div>
    </div>
  </div>

  <!-- PAGE 5: TOP MENTOR & JUDGE QUESTIONS (PART 2) -->
  <div class="page-break">
    <div class="page-header">
      <div class="page-header-brand">
        <img src="${logoSrc}" class="page-header-logo" />
        <span>HAQ AI · Team Tech Titan</span>
      </div>
      <div>Section 5: Mentor Q&amp;A (Part 2)</div>
    </div>

    <!-- Q5 -->
    <div class="qa-box">
      <div class="qa-q">
        <span class="qa-q-num">Q5</span>
        <span>"सरकारी MSME Samadhaan पोर्टल तो फ्री है, तो लोग तुम्हारे पास क्यों आएंगे?"</span>
      </div>
      <div class="qa-a">
        <strong>सटीक जवाब:</strong><br/>
        "सर, सरकारी Samadhaan पोर्टल सिर्फ एक ऑनलाइन शिकायत पेटी (filing window) है। वह आपको यह नहीं बताता कि आपके बिल पर कितना 3× ब्याज बन रहा है, न ही वह फॉर्म भरने से पहले बायर को लीगल नोटिस भेजता है। Samadhaan का फॉर्म भरना छोटे व्यापारी के लिए बहुत जटिल है।
        <div class="qa-highlight">
          Haq AI सरकारी पोर्टल पर जाने से पहले ही 80% मामलों को बिना केस लड़े आपसी बातचीत और 43B(h) के जरिए सुलझा देता है, और अगर केस करना भी पड़े तो एक-क्लिक कॉपी किट तैयार करके देता है।"
        </div>
      </div>
    </div>

    <!-- Q6 -->
    <div class="qa-box">
      <div class="qa-q">
        <span class="qa-q-num">Q6</span>
        <span>"तुम्हारा टेक्निकल स्टैक क्या है और Google Cloud का क्या रोल है?"</span>
      </div>
      <div class="qa-a">
        <strong>सटीक जवाब:</strong><br/>
        "सर, हमने इसे पूरी तरह क्लाउड-नेटिव और डेवऑप्स बेस्ट प्रैक्टिसेज पर बनाया है:
        <ul class="bullet-list">
          <li><strong>Frontend &amp; Backend:</strong> Next.js 14 (App Router) + Strict TypeScript.</li>
          <li><strong>AI Engine:</strong> Google Gemini 2.5 Flash (स्ट्रक्चर्ड स्कीमा एक्सट्रैक्शन) और Gemini Live (वॉयस कॉल).</li>
          <li><strong>Google Cloud Platform (GCP):</strong> Google Cloud Run पर डॉकर कंटेनर (Zero to N ऑटो-स्केलिंग), Cloud Storage (मैजिक-बाइट्स वेरिफिकेशन), और Google Cloud Firestore.</li>
          <li><strong>Quality:</strong> 67 यूनिट टेस्ट्स विटेस्ट (Vitest) में 100% पास हैं।"</li>
        </ul>
      </div>
    </div>

    <!-- Q7 -->
    <div class="qa-box">
      <div class="qa-q">
        <span class="qa-q-num">Q7</span>
        <span>"क्या तुम लीगल एडवाइस दे रहे हो? क्या इससे कोई बार काउंसिल या कानूनी अड़चन आएगी?"</span>
      </div>
      <div class="qa-a">
        <strong>सटीक जवाब:</strong><br/>
        "सर, बिल्कुल नहीं। Haq AI कोई लॉ फर्म नहीं है और न ही हम वकालत का दावा करते हैं। यह एक <strong>'Drafting &amp; Decision-Support Tool'</strong> है। हमारे हर एक स्क्रीन, नोटिस और किट पर साफ डिस्क्लेमर लिखा होता है: <em>'Draft only. Review with a CA/lawyer before sending.'</em> हम केवल गणित और ड्राफ्टिंग को ऑटोमेट करते हैं।"
      </div>
    </div>

    <!-- Q8 -->
    <div class="qa-box">
      <div class="qa-q">
        <span class="qa-q-num">Q8</span>
        <span>"छोटे व्यापारियों तक कैसे पहुंचोगे? तुम्हारी Go-To-Market (GTM) स्ट्रेटेजी क्या है?"</span>
      </div>
      <div class="qa-a">
        <strong>सटीक जवाब:</strong><br/>
        "सर, हमारा मुख्य डिस्ट्रीब्यूशन चैनल <strong>चार्टर्ड एकाउंटेंट्स (CAs) और टैक्स प्रैक्टिशनर्स</strong> हैं। एक सीए के पास 100 से 200 MSME क्लाइंट्स होते हैं। सीए को अपने क्लाइंट्स की 43B(h) ऑडिट रिपोर्ट तैयार करने के लिए Haq AI की सख्त जरूरत है। इसके अलावा हम राजकोट, सूरत, पुणे और पीन्या जैसे मैन्युफैक्चरिंग क्लस्टर्स और एमएसएमई एसोसिएशनों के जरिए सीधे सप्लायर्स को ऑनबोर्ड कर रहे हैं।"
      </div>
    </div>

    <div class="page-footer">
      <div>Founder: Nirmal Sinh Chouhan (Tech Titan)</div>
      <div>Page 6 of 6</div>
    </div>
  </div>

</body>
</html>`;

  const htmlPath = path.join(__dirname, '../public/mentor_guide_temp.html');
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log('[MENTOR GUIDE] Wrote guide HTML to:', htmlPath);

  // Render PDF via Headless Chrome into public folder
  const outPdfLocal = path.join(__dirname, '../public/Haq_AI_Mentor_Pitch_Guide_Nirmal_Sinh.pdf');
  const outPdfDownloads = 'C:\\Users\\ASUS\\Downloads\\Haq_AI_Mentor_Pitch_Guide_Nirmal_Sinh.pdf';
  const outPdfDesktop = 'C:\\Users\\ASUS\\OneDrive\\Desktop\\Haq_AI_Mentor_Pitch_Guide_Nirmal_Sinh.pdf';

  const browserPath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  console.log('[MENTOR GUIDE] Rendering PDF via browser:', browserPath);

  const fileUri = 'file:///' + htmlPath.replace(/\\/g, '/');
  const cmd = `"${browserPath}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${outPdfLocal}" "${fileUri}"`;
  execSync(cmd, { stdio: 'inherit' });

  console.log('[MENTOR GUIDE] Generated in public:', outPdfLocal);

  // Copy to Downloads & Desktop
  try {
    fs.copyFileSync(outPdfLocal, outPdfDownloads);
    console.log('[MENTOR GUIDE] Copied to Downloads:', outPdfDownloads);
  } catch (e) {
    console.warn('Could not copy to Downloads:', e.message);
  }

  try {
    fs.copyFileSync(outPdfLocal, outPdfDesktop);
    console.log('[MENTOR GUIDE] Copied to Desktop:', outPdfDesktop);
  } catch (e) {
    console.warn('Could not copy to Desktop:', e.message);
  }

  const stats = fs.statSync(outPdfLocal);
  console.log(`[MENTOR GUIDE] Success! File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(err => {
  console.error('[MENTOR GUIDE ERROR]', err);
  process.exit(1);
});
