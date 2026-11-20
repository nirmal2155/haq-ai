# Haq AI — Legal Assumptions & Statutory Reference Table

> **Disclaimer:** Draft only. Review with a Chartered Accountant (CA) or legal counsel before relying on these parameters for statutory filings or formal dispute resolution.

This document records all statutory interpretations, legal assumptions, and versioned rate tables used across the Haq AI deterministic computation engine.

---

## 1. Versioned RBI Bank Rate Table

Under **Section 16 of the MSMED Act, 2006**, the applicable interest rate is:
> *"Three times of the bank rate notified by the Reserve Bank of India, compounded with monthly rests."*

The engine looks up the notified Bank Rate effective on the due date / period from this table:

| Effective As-Of Date | Notified RBI Bank Rate (%) | Statutory Multiplier | Effective Annual Rate (%) | Compounding Mode | Official Source / Notification | Status |
|---|---|---|---|---|---|---|
| **2023-02-08 to Present** | **6.75%** | 3× | **20.25%** | Monthly rests | [RBI Monetary Policy Statement / Section 49](https://www.rbi.org.in) | `[NEEDS-CA-REVIEW]` |
| **2022-12-07 to 2023-02-07** | 6.50% | 3× | 19.50% | Monthly rests | RBI Monetary Policy Resolution Dec 2022 | `[NEEDS-CA-REVIEW]` |
| **2022-09-30 to 2022-12-06** | 6.15% | 3× | 18.45% | Monthly rests | RBI Monetary Policy Resolution Sep 2022 | `[NEEDS-CA-REVIEW]` |
| **2022-08-05 to 2022-09-29** | 5.65% | 3× | 16.95% | Monthly rests | RBI Monetary Policy Resolution Aug 2022 | `[NEEDS-CA-REVIEW]` |
| **2022-06-08 to 2022-08-04** | 5.15% | 3× | 15.45% | Monthly rests | RBI Monetary Policy Resolution Jun 2022 | `[NEEDS-CA-REVIEW]` |
| **2020-05-22 to 2022-06-07** | 4.25% | 3× | 12.75% | Monthly rests | RBI Monetary Policy Resolution May 2020 | `[NEEDS-CA-REVIEW]` |

*Note on Default Config:* The default baseline config uses `bankRatePercent: 6.75` (or 6.50 conservative base), but all rates are configurable via the admin legal configuration object and are never hardcoded as arbitrary magic numbers inside business logic.

---

## 2. Core Legal Assumptions

### Assumption 1: MSMED Act Payment Timelines (Section 15)
* **Rule:** If there is no written agreement, payment is due within **15 days** from the date of acceptance or deemed acceptance.
* **Rule with Agreement:** If there is a written agreement, the agreed period cannot exceed **45 days** from the date of acceptance or deemed acceptance. Any contractual clause stipulating credit beyond 45 days is void to the extent of the excess.
* **Status:** `[NEEDS-CA-REVIEW]` — Conforms to Section 15 of MSMED Act, 2006.

### Assumption 2: Deemed Acceptance Definition (Section 2(b))
* **Rule:** "Day of deemed acceptance" means where no objection is made in writing by the buyer regarding the goods/services within 15 days of delivery, the day of actual delivery of goods or rendering of services.
* **Engine Implementation:** When acceptance date is not explicitly documented or no written objection was lodged within 15 days, `acceptanceDate` defaults to `invoiceDate` / delivery date, with `deemedAcceptance: true`.
* **Status:** `[NEEDS-CA-REVIEW]` — Conforms to Section 2(b) of MSMED Act, 2006.

### Assumption 3: Monthly Compounding Calculation (Section 16)
* **Rule:** Interest is payable from the appointed day (day after due date) until actual payment, with monthly rests.
* **Engine Implementation:** Each calendar month period computes interest on the cumulative balance (`unpaid principal + prior accrued interest`). Leap-year awareness is strictly enforced using `Date.UTC` with exact days in year (365 or 366).
* **Rounding:** Integer paise precision using `Decimal.js` with `ROUND_HALF_UP`.
* **Status:** `[NEEDS-CA-REVIEW]` — Consistent with MSEFC tribunal practices.

### Assumption 4: Section 43B(h) Income Tax Treatment
* **Rule:** An unpaid MSME bill beyond the statutory limit (15 or 45 days) is deductible only in the assessment year in which it is actually paid (on cash basis), rather than on accrual basis.
* **Legal Copy Mandate:** We explicitly describe Section 43B(h) as a **tax-timing and cash-flow cost** for the buyer (deferral of expense deduction to year of payment). We **never** state or claim "30% tax on the full invoice", as tax rates vary by corporate entity type, surcharge status, and deduction timing.
* **Status:** `[NEEDS-CA-REVIEW]` — Conforms to Finance Act 2023 amendment to Section 43B of the Income Tax Act, 1961.

### Assumption 5: Covered Enterprises (Micro & Small Only)
* **Rule:** The statutory protections under Section 15 & 16 of the MSMED Act and Section 43B(h) apply exclusively to registered **Micro** and **Small** enterprises possessing a valid Udyam Registration. They do **not** apply to Medium enterprises or unregistered entities.
* **Status:** `[NEEDS-CA-REVIEW]` — Clarified by Ministry of MSME OM No. 2/1(5)/2019-P&G/Policy.

---

## 3. Review Sign-Off Template

When conducting formal audit reviews with an empanelled CA / Advocate, update the status tags:
- `[NEEDS-CA-REVIEW]` (Pending Review)
- `[CA-VERIFIED: <Name>, <Membership No>, <Date>]` (Approved)
