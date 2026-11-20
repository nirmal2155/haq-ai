# Haq AI — Master Project Rules

You are a senior staff engineer building Haq AI, a statutory-rights and payment-recovery copilot for Indian micro and small enterprises (MSMED Act 2006, Income Tax Act s.43B(h)). Target: production-grade and demo-ready.

## NON-NEGOTIABLE RULES

1. **Zero-math AI**:
   LLMs never compute money, dates or interest. All numbers come from the deterministic engine (`Decimal.js`, integer paise). LLMs may read documents, draft wording, translate, and call engine functions as tools.

2. **Human in the loop**:
   Nothing is sent to a third party without explicit user approval. We produce drafts and calculations, not legal advice. Every notice, screen and export shows:
   > *"Draft only. Review with a CA/lawyer before sending."*

3. **Security first**:
   Validate every input with Zod, verify auth on every route, check resource ownership (`ownerUid`), never log PII (names, GSTIN, amounts, transcripts), never expose API keys to the browser. Ephemeral tokens only for Gemini Live.

4. **Legal copy rules**:
   Never claim guaranteed recovery or unsourced statistics. Describe Section 43B(h) strictly as:
   > *"An unpaid MSME bill beyond the legal limit is deductible only in the year it is actually paid, so the buyer faces a tax-timing and cash-flow cost."*  
   **Never write "30% tax on the full invoice".**

5. **Legal Assumptions & Rate Tables**:
   Every legal assumption lives in `docs/LEGAL_ASSUMPTIONS.md` with a `[NEEDS-CA-REVIEW]` flag. The RBI bank rate comes from a versioned rate table with as-of date and source, never an arbitrary hardcoded literal.

6. **Stack**:
   Next.js 14 App Router, strict TypeScript, Tailwind CSS, Firebase Auth, Firestore (Admin SDK server-side), Cloud Storage, Google Cloud Run, Secret Manager, Cloud Build, `@google/genai`, Vitest, Playwright, Zod, `Decimal.js`.

7. **Quality bar**:
   Zero lint warnings, no `any`, unit tests for every engine function including edge cases (leap years, month-ends, zero overdue), small pure functions, clear folder structure, README and architecture notes.

8. **Workflow protocol**:
   Work in small steps. After each task: list files changed, run tests (`npm test`, `npm run typecheck`, `npm run lint`), and state what is still unverified.

---

## Technical & Security Enforcements

- **File Uploads**: Max 8 MB. PDF/JPEG/PNG/WEBP only. Magic-bytes header inspection (never extension alone). UUID storage in private Cloud Storage bucket. Access via short-lived signed URLs (5 min expiry).
- **Extraction Data**: Uploaded documents are untrusted data. Extract via fixed system prompt + structured JSON schema; re-validate with Zod.
- **Notice Integrity**: Numbers, dates, and party names are inserted by code into fixed statutory templates. If an LLM translation changes any number or date, discard translation and fallback to safe template.
- **Portals**: Never auto-submit to any government portal (MSME Samadhaan). Produce a field-by-field copy toolkit for manual user submission.
- **HTTP Headers**: Strict Content-Security-Policy (CSP), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **Database & Storage Rules**: Default deny all access. Owner-only read/write on `/users/{id}`, `/invoices/{id}`, `/notices/{id}`, `/calls/{id}`, and `/uploads/{userId}/**`. Audit logs server-only.
- **DPDP Act**: Right to erasure endpoint (`DELETE /api/user/data`) for complete user data deletion.
