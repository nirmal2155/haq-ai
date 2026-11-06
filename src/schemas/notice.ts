import { formatPaiseToINR, paiseToRupees } from '../engine/money';

export interface NoticeData {
  supplierName: string;
  supplierUdyam?: string;
  buyerName: string;
  buyerGstin?: string | null;
  invoiceNo: string;
  invoiceDate: string;
  acceptanceDate: string;
  statutoryDueDate: string;
  amountPaise: number;
  paidPaise: number;
  unpaidPaise: number;
  daysOverdue: number;
  bankRatePercent: number;
  effectiveRatePercent: number;
  interestPaise: number;
  totalPaise: number;
  noticeDate: string;
}

export const STATUTORY_NOTICE_TEMPLATE = `
LEGAL DEMAND NOTICE UNDER SECTIONS 15 & 16 OF THE MICRO, SMALL AND MEDIUM ENTERPRISES DEVELOPMENT (MSMED) ACT, 2006

Date: {{noticeDate}}

To,
The Accounts & Finance Department / Board of Directors
{{buyerName}}
GSTIN: {{buyerGstin}}

From,
{{supplierName}}
Udyam Registration No: {{supplierUdyam}}

SUBJECT: DEMAND NOTICE FOR OUTSTANDING STATUTORY PAYMENT WITH COMPOUND INTEREST UNDER SECTION 15 & 16 OF THE MSMED ACT, 2006

Dear Sir / Madam,

1. We are a registered Micro / Small Enterprise registered under the Micro, Small and Medium Enterprises Development Act, 2006 (MSMED Act) having Udyam Registration No: {{supplierUdyam}}.

2. Under the supply of goods / services rendered to your esteemed organization, we raised Tax Invoice No: {{invoiceNo}} dated {{invoiceDate}} for the principal sum of {{principalRupeesFormatted}} (Paise: {{amountPaise}}).

3. The said goods/services were duly accepted / deemed accepted on {{acceptanceDate}}. As per Section 15 of the MSMED Act, the statutory payment period mandates payment within fifteen (15) days or within the mutually agreed period capped strictly at a maximum of forty-five (45) days. Consequently, the statutory due date was {{statutoryDueDate}}.

4. To date, payment of {{unpaidRupeesFormatted}} remains unpaid and has been in default for {{daysOverdue}} days overdue beyond the statutory deadline.

5. In accordance with Section 16 of the MSMED Act, 2006:
"Where any buyer fails to make payment of the amount to the supplier, as required under section 15, the buyer shall, notwithstanding anything contained in any agreement between the buyer and the supplier, be liable to pay compound interest with monthly rests to the supplier on that amount from the appointed day or date immediately following the date agreed upon, at three times of the bank rate notified by the Reserve Bank."

6. At the notified RBI Bank Rate of {{bankRatePercent}}% per annum, the applicable statutory interest rate is {{effectiveRatePercent}}% per annum compounded with monthly rests. As of {{noticeDate}}, the accrued statutory compound interest stands at {{interestRupeesFormatted}} (Paise: {{interestPaise}}), bringing the total statutory claim to {{totalRupeesFormatted}} (Paise: {{totalPaise}}).

7. NOTE REGARDING SECTION 43B(h) OF THE INCOME TAX ACT, 1961:
Failure to clear outstanding payments due to registered MSMEs within the statutory period under the MSMED Act results in disallowance of the entire expense deduction in your income tax computations for the assessment year.

8. DEMAND:
We hereby call upon you to remit the total outstanding amount of {{totalRupeesFormatted}} to our designated bank account within seven (7) days of receipt of this notice, failing which we shall be constrained to initiate formal conciliation and arbitration proceedings before the MSME Facilitation Council (MSEFC) via the MSME Samadhaan portal without further reference to you.

Sincerely,
For {{supplierName}}
Authorized Signatory

DISCLAIMER: DRAFT ONLY. REVIEW WITH A CA/LAWYER BEFORE SENDING.
`.trim();

export function renderNoticeTemplate(data: NoticeData): string {
  const principalRupees = paiseToRupees(data.amountPaise);
  const unpaidRupees = paiseToRupees(data.unpaidPaise);
  const interestRupees = paiseToRupees(data.interestPaise);
  const totalRupees = paiseToRupees(data.totalPaise);

  return STATUTORY_NOTICE_TEMPLATE
    .replace(/\{\{noticeDate\}\}/g, data.noticeDate)
    .replace(/\{\{buyerName\}\}/g, data.buyerName)
    .replace(/\{\{buyerGstin\}\}/g, data.buyerGstin || 'NOT PROVIDED')
    .replace(/\{\{supplierName\}\}/g, data.supplierName)
    .replace(/\{\{supplierUdyam\}\}/g, data.supplierUdyam || 'UDYAM-REG-REGISTERED')
    .replace(/\{\{invoiceNo\}\}/g, data.invoiceNo)
    .replace(/\{\{invoiceDate\}\}/g, data.invoiceDate)
    .replace(/\{\{acceptanceDate\}\}/g, data.acceptanceDate)
    .replace(/\{\{statutoryDueDate\}\}/g, data.statutoryDueDate)
    .replace(/\{\{principalRupeesFormatted\}\}/g, formatPaiseToINR(data.amountPaise))
    .replace(/\{\{unpaidRupeesFormatted\}\}/g, formatPaiseToINR(data.unpaidPaise))
    .replace(/\{\{amountPaise\}\}/g, String(data.amountPaise))
    .replace(/\{\{daysOverdue\}\}/g, String(data.daysOverdue))
    .replace(/\{\{bankRatePercent\}\}/g, data.bankRatePercent.toFixed(2))
    .replace(/\{\{effectiveRatePercent\}\}/g, data.effectiveRatePercent.toFixed(2))
    .replace(/\{\{interestRupeesFormatted\}\}/g, formatPaiseToINR(data.interestPaise))
    .replace(/\{\{interestPaise\}\}/g, String(data.interestPaise))
    .replace(/\{\{totalRupeesFormatted\}\}/g, formatPaiseToINR(data.totalPaise))
    .replace(/\{\{totalPaise\}\}/g, String(data.totalPaise));
}

/**
 * Hard security rule:
 * Numbers and dates are inserted by code into fixed templates.
 * If LLM alters ANY number, date or critical identifier during translation,
 * the translation must be discarded and replaced with the safe deterministic template.
 */
export function verifyNumberIntegrity(
  originalTemplate: string,
  translatedText: string,
  criticalTokens: string[]
): { intact: boolean; missingTokens: string[] } {
  const missingTokens: string[] = [];

  for (const token of criticalTokens) {
    if (!token || token.trim() === '') continue;
    // Check if token exists in translated text
    if (!translatedText.includes(token)) {
      missingTokens.push(token);
    }
  }

  return {
    intact: missingTokens.length === 0,
    missingTokens,
  };
}
