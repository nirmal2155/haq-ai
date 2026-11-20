# Haq AI — Statutory MSME Payment Rights & Sec 43B(h) Copilot
### Production-Grade · Demo-Ready · Startup Buildathon India 2026

Haq AI empowers Indian micro and small enterprises (MSMEs) to enforce their statutory payment rights under Sections 15, 16, & 17 of the MSMED Act, 2006 (mandatory 15/45-day deadline, 3× RBI compound interest) and exposes tax-timing disallowances under Section 43B(h) of the Income Tax Act for corporate buyers.

> **Mandatory Statutory Notice:**  
> *"Draft only. Review with a CA/lawyer before sending."*  
> Haq AI produces verifiable calculations, evidence packets, and statutory drafts. It does not provide legal advice or auto-file cases.

---

## 1. The Problem & Statutory Opportunity

- **₹10.7 Lakh Crore**: Estimated delayed payments owed to Indian MSMEs annually.
- **The Asymmetry**: Small suppliers hesitate to confront large buyers because hiring lawyers is expensive and relationship damage is feared.
- **The Law (MSMED Act 2006)**:
  - **Section 15**: Buyer must pay within agreed days ($\le 45$ days) or 15 days if no written agreement exists.
  - **Section 16**: Statutory compound interest at **3× the RBI bank rate** with monthly rests. This liability is non-waivable and cannot be deducted as a business expense.
- **The Tax Leverage (Section 43B(h))**:
  - Unpaid MSME bills outstanding past the Section 15 deadline at the end of the financial year (March 31) are disallowed as expenses for the buyer until paid, creating an immediate tax-timing and cash-flow penalty.

---

## 2. Core Architectural Pillars

```
+-------------------------------------------------------------------------+
|                              HAQ AI PLATFORM                            |
|                                                                         |
|  +--------------------------------+   +-------------------------------+ |
|  |     Deterministic Engine       |   |     Google Gemini 2.5 AI      | |
|  |    (Zero-Math Architecture)    |   |     (Multimodal & Tone)       | |
|  |                                |   |                               | |
|  |  * Decimal.js (Integer Paise)  |   |  * Multimodal Invoice OCR     | |
|  |  * MSMED s.15 Appointed Day    |   |  * Tone Translation (HI/GU)   | |
|  |  * 3x RBI Compound Interest    |   |  * Gemini Live Voice (Tokens) | |
|  |  * s.43B(h) Tax Disallowance   |   |  * Number Whitelist Guard     | |
|  +--------------------------------+   +-------------------------------+ |
|                 ^                                     ^                 |
|                 |                                     |                 |
|                 +------------------+------------------+                 |
|                                    |                                    |
|                      +---------------------------+                      |
|                      |   API Security Pipeline   |                      |
|                      |  (Auth, Zod, Rate Limit)  |                      |
|                      +---------------------------+                      |
|                                    |                                    |
|             +----------------------+----------------------+             |
|             v                                             v             |
|  +----------------------+                     +----------------------+  |
|  |   Cloud Firestore    |                     |    Cloud Storage     |  |
|  | (Strict Owner Rules) |                     |  (Magic-Byte Check)  |  |
|  +----------------------+                     +----------------------+  |
+-------------------------------------------------------------------------+
```

1. **Zero-Math AI**:
   - LLMs never compute money, dates, or interest.
   - All financial numbers, interest calculations, and due dates come from the pure TypeScript deterministic engine (`src/engine/`).
   - The Gemini assistant strictly validates that any number in its output exists in engine tool results (`verifyToolNumberIntegrity`).
2. **Human in the Loop**:
   - No notice, email, or WhatsApp reminder is ever sent automatically.
   - Reminders land in a human approval queue (`/approval`) requiring an explicit user tap.
3. **Multiset Token Parity**:
   - Translations of statutory notices into Hindi and Gujarati verify that every digit, date, and GSTIN appears with the exact same frequency as the English source template (`verifyExactMultisetMatch`).
4. **Security & DPDP First**:
   - 100% Zod validated routes, sliding-window rate limiting, and cross-tenant `403` isolation.
   - Automatic zero-PII structured JSON logging (`src/lib/logger.ts`).
   - Atomic Right to Erasure endpoint (`DELETE /api/user/data`).

---

## 3. Technology Stack

- **Framework**: Next.js 14 App Router, Strict TypeScript, Tailwind CSS, Lucide Icons.
- **Math Engine**: `Decimal.js` (28 digits precision, half-up rounding, integer paise).
- **AI Vision & Voice**: `@google/genai` (Gemini 2.5 Flash, WebRTC Live Voice with ephemeral tokens).
- **Backend & Cloud**: Google Cloud Run, Cloud Tasks, Cloud Scheduler, Secret Manager, Cloud Storage.
- **Database & Auth**: Firebase Auth, Cloud Firestore (Admin SDK, hardened security rules).
- **Quality & Testing**: Vitest (161+ tests, 100% engine branch coverage), Playwright E2E, ESLint.

---

## 4. Quickstart & Local Setup

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### 1. Clone & Install
```bash
git clone https://github.com/your-org/haq-ai.git
cd haq-ai
npm install
```

### 2. Environment Configuration
Copy the template and configure your keys:
```bash
cp .env.example .env.local
```
*(In development and test mode, mock implementations run automatically if API keys are not provided).*

### 3. Run Quality Verification
```bash
# Run unit & property tests (161 tests)
npm test

# Run TypeScript compilation check
npm run typecheck

# Run ESLint check
npm run lint
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Live Demo Guide for Pitch & Judges

### Demo Persona:
**Rajkot Precision Auto Engg Pvt Ltd** (Micro enterprise, Udyam: `UDYAM-GJ-01-0012345`).

### 5-Minute Pitch Narrative:
1. **The Overdue Invoice (`/`)**:
   - Supplier uploads an overdue invoice for `₹5,00,000` to buyer `Apex Heavy Engineering Ltd`.
   - Multimodal Gemini extracts the line items and dates; the engine determines the statutory appointed day (15 days under MSMED s.15).
2. **Deterministic Interest Calculation (`/cases`)**:
   - The engine computes statutory interest at **3× RBI bank rate (20.25% p.a.)** compounded monthly: **₹38,452** accrued over 92 days overdue.
   - Point out that this math was generated in `< 1ms` by pure code, not guessed by an LLM.
3. **Section 43B(h) Corporate Tax Disallowance**:
   - Explain the buyer leverage: Apex Heavy Engineering cannot deduct this ₹5,00,000 bill at year-end until paid.
4. **Human-in-the-Loop Approval Queue (`/approval`)**:
   - Show the polite, escalating reminder drafted by Gemini.
   - Demonstrate that nothing sends until the business owner taps **"Approve & Dispatch"**.
5. **MSME Samadhaan Kit & Evidence Pack (`/api/cases/case_demo_1/evidence-pack`)**:
   - Download the instant, court-ready PDF/HTML evidence pack with certified interest ledger and pre-filled copy-paste fields for the government MSME Samadhaan portal.
6. **Data Privacy & DPDP Erasure (`/settings`)**:
   - Demonstrate the language switcher (English, Hindi, Gujarati) with multiset token integrity.
   - Show the one-click **"Delete All Data & Account"** button fulfilling DPDP Act 2023 obligations.

---

## 6. Project Directory Structure

```
├── docs/                     # Legal assumptions, golden vectors, SLOs, architecture
│   ├── ARCHITECTURE.md       # High-level architecture and Mermaid diagrams
│   ├── SECURITY.md           # Defense-in-depth whitepaper & DPDP compliance
│   ├── SLO.md                # 99.9% availability targets & latency bounds
│   ├── LOAD_TEST.md          # 100 VU K6 load benchmark report
│   ├── GOLDEN_VECTORS.md     # Hand-calculated interest golden test cases
│   └── LEGAL_ASSUMPTIONS.md  # Statutory legal assumptions [NEEDS-CA-REVIEW]
├── src/
│   ├── ai/                   # Gemini 2.5 extraction, assistant, translation, voice
│   │   ├── assistant.ts      # Function calling with tool number whitelist check
│   │   ├── extractInvoice.ts # Multimodal invoice OCR with confidence scoring
│   │   ├── translate.ts      # Regional translation with multiset token parity
│   │   └── liveVoice.ts      # WebRTC ephemeral token issuer with consent gate
│   ├── app/                  # Next.js 14 App Router pages & secure API routes
│   │   ├── api/cases/        # Case CRUD and evidence pack generation
│   │   ├── api/ingest/email/ # Webhook for forward-to-haq email ingest
│   │   ├── api/payments/     # Bank statement CSV reconciliation
│   │   ├── api/reminders/    # Human-in-the-loop reminder approval
│   │   ├── api/scheduler/    # Daily 09:00 IST reminder job
│   │   ├── approval/         # Human approval queue UI
│   │   └── settings/         # Settings & DPDP right to erasure UI
│   ├── domain/               # Domain models, state machines, event ledger
│   ├── engine/               # Pure deterministic math engine (Zero-Math AI)
│   │   ├── deadline.ts       # Section 15 appointed day calculator
│   │   ├── interest.ts       # Section 16 compound interest calculator
│   │   ├── money.ts          # Integer paise & Decimal.js conversion
│   │   ├── rates.ts          # Versioned RBI bank rates table
│   │   ├── eligibility.ts    # MSMED micro/small eligibility checker
│   │   ├── paymentMatcher.ts # Bank statement reconciliation engine
│   │   └── exposure43bh.ts   # Section 43B(h) year-end tax assessment
│   ├── lib/                  # Auth, API security, circuit breaker, zero-PII logger
│   └── schemas/              # Strict Zod schemas for invoices, cases, notices
├── tests/                    # Vitest integration tests & Playwright E2E suites
└── infra/                    # Terraform Google Cloud Run & Cloud Tasks configs
```

---

## 7. License & Compliance Disclaimer

Copyright © 2026 Haq AI Team. Released under the Apache 2.0 License.

**Legal Disclaimer:** Haq AI is an automated drafting, statutory rights calculation, and evidence compilation system. It does not provide legal advice, legal representation, or tax filing services. Users should review all generated documents with a qualified Chartered Accountant (CA) or legal practitioner prior to formal transmission or portal submission.
