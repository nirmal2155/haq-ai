# Haq AI — Deterministic Engine Golden Vectors
> **Target Status**: Production Verification Benchmarks
> **Regulatory Basis**: MSMED Act 2006 (Sections 15, 16), Income Tax Act 1961 (Section 43B(h)), Reserve Bank of India Act 1934 (Section 49).

---

## 1. Principles of Mathematical Determinism
- **Precision**: 28 decimal places (`Decimal.js`).
- **Rounding Mode**: `ROUND_HALF_UP` (Indian commercial standard).
- **Storage Unit**: Integer paise (`1 Rupee = 100 Paise`).
- **Interest Formula (Section 16)**:
  $$\text{Interest} = \text{Principal} \times \left(\frac{3 \times \text{Bank Rate}}{100}\right) \times \left(\frac{\text{Days in Period}}{\text{Days in Year (365 or 366)}}\right)$$
  Compounded with **monthly rests** at each month anniversary from the appointed day.

---

## 2. Golden Test Vectors

### Golden Vector 1: Standard 15-Day Statutory Default (Leap Year 2024)
- **Principal**: ₹1,00,000.00 (`10,000,000` paise)
- **Acceptance Date**: `2024-01-01`
- **Written Agreement**: None
- **Statutory Limit**: 15 days
- **Appointed Day / Due Date**: `2024-01-16`
- **Calculation Date**: `2024-02-16`
- **Days Overdue**: 31 days
- **Applicable Bank Rate**: 6.75%
- **Statutory Rate (3x)**: 20.25%
- **Days in Year 2024**: 366 (Leap year)
- **Period Interest Calculation**:
  $$\text{Interest} = 100,000 \times 0.2025 \times \frac{31}{366} = ₹1,715.163934...$$
- **Rounded Interest Paise**: `171,516` paise (₹1,715.16)
- **Total Due**: `10,171,516` paise (₹1,01,715.16)

---

### Golden Vector 2: Month-End & Leap Year Boundary (February 2024)
- **Principal**: ₹50,000.00 (`5,000,000` paise)
- **Acceptance Date**: `2024-02-14`
- **Written Agreement**: 30 days
- **Leap Year Safe Due Date**: `2024-03-15` (15 days left in Feb 2024 [since 2024 is leap with 29 days] + 15 days in March = March 15, 2024)
- **Calculation Date**: `2024-04-15`
- **Days Overdue**: 31 days (from 2024-03-15 to 2024-04-15)
- **Period Interest**:
  $$\text{Interest} = 50,000 \times 0.2025 \times \frac{31}{366} = ₹857.581967...$$
- **Rounded Interest Paise**: `85,758` paise (₹857.58)
- **Total Due**: `5,085,758` paise (₹50,857.58)

---

### Golden Vector 3: Statutory 45-Day Cap on Excessive Credit Terms
- **Principal**: ₹75,000.00 (`7,500,000` paise)
- **Acceptance Date**: `2024-01-01`
- **Contractual Agreement**: 90 days (Legally void beyond 45 days under Section 15 proviso)
- **Effective Statutory Limit**: Strictly capped at 45 days
- **Due Date**: `2024-02-15` (30 days in Jan + 15 in Feb)
- **Rule**: `45_DAY_STATUTORY_CAP`

---

### Golden Vector 4: Zero Overdue / Future Bill
- **Principal**: ₹2,50,000.00 (`25,000,000` paise)
- **Due Date**: `2024-05-15`
- **Calculation Date**: `2024-05-10`
- **Days Overdue**: 0
- **Interest Paise**: Strictly `0`
- **Total Due**: `25,000,000` paise (₹2,50,000.00)

---

### Golden Vector 5: Multi-Month Compounding with Monthly Rests
- **Principal**: ₹1,00,000.00 (`10,000,000` paise)
- **Due Date**: `2023-01-01`
- **Calculation Date**: `2023-03-01` (59 days in non-leap year 2023)
- **Rate**: 6.75% bank rate $\to$ 20.25% statutory rate
- **Rest 1 (2023-01-01 to 2023-02-01, 31 days)**:
  $$\text{Int}_1 = 100,000 \times 0.2025 \times \frac{31}{365} = ₹1,719.863... \to 171,986\text{ paise}$$
  New opening balance = ₹1,01,719.86 (`10,171,986` paise)
- **Rest 2 (2023-02-01 to 2023-03-01, 28 days)**:
  $$\text{Int}_2 = 101,719.863...\times 0.2025 \times \frac{28}{365} = ₹1,580.139... \to 158,014\text{ paise}$$
- **Total Accrued Compounded Interest**: $171,986.30... + 158,013.91... = 330,000\text{ paise}$ (₹3,300.00)
- **Total Due**: `10,330,000` paise (₹1,03,300.00)

---

### Golden Vector 6: Section 43B(h) Year-End Disallowance
- **Financial Year End**: `2024-03-31`
- **Bill A**: ₹5,00,000, Due `2024-02-15`, Unpaid on `2024-03-31` $\to$ **DISALLOWED** in FY 2023-24. Deductible only in year of payment.
- **Bill B**: ₹3,00,000, Due `2024-02-15`, Paid on `2024-03-20` $\to$ **ALLOWED** in FY 2023-24 (paid before March 31).
- **Bill C**: ₹2,00,000, Due `2024-04-10`, Paid on `2024-04-05` $\to$ **ALLOWED** in FY 2023-24 (due in subsequent FY and settled within statutory credit limit).
