import { computeInterest } from './interest';
import { daysBetweenDates, computeDueDate } from './deadline';

export interface BuyerBill {
  id: string;
  invoiceNumber: string;
  invoiceDate: string; // YYYY-MM-DD
  acceptanceDate?: string; // YYYY-MM-DD
  hasWrittenAgreement?: boolean;
  agreedPaymentDays?: number | null;
  amountPaise: number;
  paidAmountPaise?: number;
  paymentDate?: string | null; // YYYY-MM-DD
  isMicroOrSmallSupplier: boolean; // Must be micro or small
}

export interface BillExposureReport {
  id: string;
  invoiceNumber: string;
  dueDate: string; // YYYY-MM-DD
  amountPaise: number;
  unpaidPaiseAtYearEnd: number;
  isDisallowedUnder43Bh: boolean;
  disallowedAmountPaise: number;
  statutoryInterestAccruedPaise: number;
  statutoryReason: string;
  taxTimingImpact: string;
}

export interface BuyerExposureSummary {
  financialYear: string;
  financialYearEnd: string;
  totalBills: number;
  disallowedBillsCount: number;
  totalInvoiceAmountPaise: number;
  totalDisallowedPaise: number;
  totalStatutoryInterestPaise: number;
  legalDisclaimer: string;
  bills: BillExposureReport[];
}

/**
 * Computes Section 43B(h) deduction disallowance exposure for a buyer's invoices
 * as of a specified financial year end (strictly 31 March).
 *
 * Statutory Rule (Income Tax Act Section 43B(h)):
 * An unpaid MSME bill beyond the legal limit is deductible only in the year it is
 * actually paid, so the buyer faces a tax-timing and cash-flow cost.
 * (Never describe this as a 30% tax on the full invoice).
 */
export function calculateExposure43bh(
  bills: BuyerBill[],
  fyEndStr: string = '2024-03-31',
  asOfDateStr?: string
): BuyerExposureSummary {
  const fyDate = fyEndStr.split('T')[0] ?? '2024-03-31';
  const asOf = asOfDateStr ? asOfDateStr.split('T')[0] : fyDate;

  // Determine financial year label (e.g. 2024-03-31 -> FY 2023-24)
  const [fyYearStr] = fyDate.split('-');
  const fyYear = Number(fyYearStr);
  const fyLabel = `FY ${fyYear - 1}-${String(fyYear).slice(-2)}`;

  let totalDisallowedPaise = 0;
  let totalInterestPaise = 0;
  let totalInvoiceAmountPaise = 0;
  let disallowedCount = 0;

  const billReports: BillExposureReport[] = bills.map((bill) => {
    totalInvoiceAmountPaise += bill.amountPaise;

    // 1. Compute Section 15 statutory due date
    const baseAcceptance = bill.acceptanceDate || bill.invoiceDate;
    const dueRes = computeDueDate({
      acceptanceDate: baseAcceptance,
      hasWrittenAgreement: bill.hasWrittenAgreement ?? false,
      agreedCreditDays: bill.agreedPaymentDays,
    });

    const dueDate = dueRes.dueDate;
    const paidAmount = bill.paidAmountPaise ?? 0;
    const paymentDate = bill.paymentDate ? bill.paymentDate.split('T')[0] : null;

    // Determine payment status on or before March 31
    const isPaidBeforeYearEnd = paymentDate !== null && paymentDate <= fyDate && paidAmount >= bill.amountPaise;
    const isPaidWithinDue = paymentDate !== null && paymentDate <= dueDate && paidAmount >= bill.amountPaise;

    let isDisallowed = false;
    let disallowedPaise = 0;
    let statutoryReason = '';
    let taxTimingImpact = '';

    if (!bill.isMicroOrSmallSupplier) {
      // Medium and Large suppliers are exempt from Section 43B(h)
      isDisallowed = false;
      disallowedPaise = 0;
      statutoryReason = 'Supplier is not a Micro or Small enterprise. Section 43B(h) does not apply.';
      taxTimingImpact = 'Fully deductible in the current financial year on accrual basis.';
    } else if (isPaidWithinDue) {
      // Paid on or before statutory due date
      isDisallowed = false;
      disallowedPaise = 0;
      statutoryReason = `Paid within statutory due date (${dueDate}).`;
      taxTimingImpact = 'Deductible in the year of accrual.';
    } else if (isPaidBeforeYearEnd) {
      // Paid after statutory due date, BUT still within the same financial year (before March 31)
      isDisallowed = false;
      disallowedPaise = 0;
      statutoryReason = `Paid after statutory due date (${dueDate}) but before financial year end (${fyDate}).`;
      taxTimingImpact = 'Deductible in current financial year since actual payment occurred prior to 31 March.';
    } else {
      // Unpaid by 31 March
      if (dueDate <= fyDate) {
        // Due date has already passed on or before 31 March
        isDisallowed = true;
        disallowedPaise = Math.max(0, bill.amountPaise - paidAmount);
        disallowedCount++;
        totalDisallowedPaise += disallowedPaise;
        statutoryReason = `Statutory due date was ${dueDate}. Bill remained unpaid as of financial year end (${fyDate}).`;
        taxTimingImpact =
          'An unpaid MSME bill beyond the legal limit is deductible only in the year it is actually paid, so the buyer faces a tax-timing and cash-flow cost.';
      } else {
        // Due date falls AFTER 31 March (e.g. invoice March 25, due April 9)
        // If paid within due date in the new FY, it is deductible in the current FY
        if (paymentDate && paymentDate <= dueDate) {
          isDisallowed = false;
          disallowedPaise = 0;
          statutoryReason = `Due date (${dueDate}) falls in subsequent FY and payment was settled within due date.`;
          taxTimingImpact = 'Deductible in current financial year.';
        } else {
          // If still unpaid past due date in new FY, disallowed in current FY
          isDisallowed = true;
          disallowedPaise = Math.max(0, bill.amountPaise - paidAmount);
          disallowedCount++;
          totalDisallowedPaise += disallowedPaise;
          statutoryReason = `Due date (${dueDate}) expired without payment. Section 43B(h) disallows deduction for ${fyLabel}.`;
          taxTimingImpact =
            'An unpaid MSME bill beyond the legal limit is deductible only in the year it is actually paid, so the buyer faces a tax-timing and cash-flow cost.';
        }
      }
    }

    // Compute statutory interest under Section 16 from due date to asOf date
    const interestCalc = computeInterest({
      principalPaise: bill.amountPaise,
      dueDate,
      asOfDate: asOf,
      paidPaise: paymentDate && paymentDate <= asOf ? paidAmount : 0,
    });

    totalInterestPaise += interestCalc.interestPaise;

    return {
      id: bill.id,
      invoiceNumber: bill.invoiceNumber,
      dueDate,
      amountPaise: bill.amountPaise,
      unpaidPaiseAtYearEnd: Math.max(0, bill.amountPaise - (isPaidBeforeYearEnd ? paidAmount : 0)),
      isDisallowedUnder43Bh: isDisallowed,
      disallowedAmountPaise: disallowedPaise,
      statutoryInterestAccruedPaise: interestCalc.interestPaise,
      statutoryReason,
      taxTimingImpact,
    };
  });

  return {
    financialYear: fyLabel,
    financialYearEnd: fyDate,
    totalBills: bills.length,
    disallowedBillsCount: disallowedCount,
    totalInvoiceAmountPaise,
    totalDisallowedPaise,
    totalStatutoryInterestPaise: totalInterestPaise,
    legalDisclaimer: 'Draft only. Review with a CA/lawyer before sending.',
    bills: billReports,
  };
}
