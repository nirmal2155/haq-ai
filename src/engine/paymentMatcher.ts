import { rupeesToPaise } from './money';
import { Case } from '@/domain/types';

export interface BankTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amountPaise: number;
  type: 'CR' | 'DR';
  rawLine?: string;
}

export interface ProposedPaymentMatch {
  caseId: string;
  invoiceNumber: string;
  buyerName: string;
  transaction: BankTransaction;
  matchType: 'EXACT_AMOUNT_AND_DESC' | 'EXACT_AMOUNT' | 'TDS_ADJUSTED' | 'DESCRIPTION_ONLY';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  principalPaise: number;
  paymentPaise: number;
  discrepancyPaise: number;
  reason: string;
}

/**
 * Parses bank statement CSV text into typed transactions.
 * Supports standard CSV columns: Date, Description, Amount, Type (CR/DR)
 */
export function parseBankStatementCsv(csvText: string): BankTransaction[] {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/['"]/g, ''));
  const dateIdx = headers.findIndex((h) => h.includes('date'));
  const descIdx = headers.findIndex((h) => h.includes('desc') || h.includes('narration') || h.includes('particular'));
  const amountIdx = headers.findIndex((h) => h.includes('amount') || h.includes('credit') || h.includes('cr'));
  const typeIdx = headers.findIndex((h) => h.includes('type') || h.includes('dr/cr'));

  const transactions: BankTransaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim().replace(/['"]/g, ''));
    if (cols.length < 2) continue;

    const rawDate = dateIdx !== -1 ? cols[dateIdx] : cols[0];
    const desc = descIdx !== -1 ? cols[descIdx] : cols[1];
    const rawAmt = amountIdx !== -1 ? cols[amountIdx] : cols[2];
    const rawType = typeIdx !== -1 ? cols[typeIdx] : 'CR';

    try {
      const amountPaise = rupeesToPaise(rawAmt);
      const isCredit = rawType.toUpperCase().includes('CR') || !rawType.toUpperCase().includes('DR');

      transactions.push({
        id: `txn_${i}`,
        date: rawDate,
        description: desc,
        amountPaise,
        type: isCredit ? 'CR' : 'DR',
        rawLine: lines[i],
      });
    } catch {
      // Skip non-numeric lines (subheaders, footers)
      continue;
    }
  }

  return transactions;
}

/**
 * Pure deterministic matcher that proposes matches between incoming credits
 * and active open recovery cases.
 * Strictly presents proposals for human confirmation.
 */
export function matchBankTransactionsToCases(
  transactions: BankTransaction[],
  openCases: Case[]
): {
  proposedMatches: ProposedPaymentMatch[];
  unmatchedCredits: BankTransaction[];
} {
  const proposedMatches: ProposedPaymentMatch[] = [];
  const creditTxns = transactions.filter((t) => t.type === 'CR');
  const matchedTxnIds = new Set<string>();

  for (const c of openCases) {
    if (c.state === 'PAID' || c.state === 'CLOSED') continue;

    const unpaidPaise = Math.max(0, c.principalAmountPaise - c.paidAmountPaise);

    for (const txn of creditTxns) {
      if (matchedTxnIds.has(txn.id)) continue;

      const descUpper = txn.description.toUpperCase();
      const invNumClean = c.invoiceNumber.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const buyerNameWords = c.buyerName.toUpperCase().split(/\s+/).filter((w) => w.length > 3);

      const hasInvMatch = invNumClean.length > 2 && descUpper.includes(invNumClean);
      const hasBuyerMatch = buyerNameWords.some((word) => descUpper.includes(word));
      const isExactAmount = txn.amountPaise === unpaidPaise;

      // Check standard Indian TDS deduction rates (TDS 194C @ 1% or 2%, 194J @ 10%)
      const isTds1Pct = Math.abs(txn.amountPaise - Math.round(unpaidPaise * 0.99)) <= 100;
      const isTds2Pct = Math.abs(txn.amountPaise - Math.round(unpaidPaise * 0.98)) <= 100;
      const isTds10Pct = Math.abs(txn.amountPaise - Math.round(unpaidPaise * 0.90)) <= 100;
      const isTdsAdjusted = isTds1Pct || isTds2Pct || isTds10Pct;

      if (isExactAmount && (hasInvMatch || hasBuyerMatch)) {
        proposedMatches.push({
          caseId: c.id,
          invoiceNumber: c.invoiceNumber,
          buyerName: c.buyerName,
          transaction: txn,
          matchType: 'EXACT_AMOUNT_AND_DESC',
          confidence: 'HIGH',
          principalPaise: unpaidPaise,
          paymentPaise: txn.amountPaise,
          discrepancyPaise: 0,
          reason: `Exact amount match with invoice reference (${c.invoiceNumber}) found in statement narrative.`,
        });
        matchedTxnIds.add(txn.id);
        break;
      } else if (isExactAmount) {
        proposedMatches.push({
          caseId: c.id,
          invoiceNumber: c.invoiceNumber,
          buyerName: c.buyerName,
          transaction: txn,
          matchType: 'EXACT_AMOUNT',
          confidence: 'MEDIUM',
          principalPaise: unpaidPaise,
          paymentPaise: txn.amountPaise,
          discrepancyPaise: 0,
          reason: `Exact amount matches outstanding balance (₹${(unpaidPaise / 100).toFixed(2)}).`,
        });
        matchedTxnIds.add(txn.id);
        break;
      } else if (isTdsAdjusted && (hasInvMatch || hasBuyerMatch)) {
        proposedMatches.push({
          caseId: c.id,
          invoiceNumber: c.invoiceNumber,
          buyerName: c.buyerName,
          transaction: txn,
          matchType: 'TDS_ADJUSTED',
          confidence: 'HIGH',
          principalPaise: unpaidPaise,
          paymentPaise: txn.amountPaise,
          discrepancyPaise: unpaidPaise - txn.amountPaise,
          reason: `Payment matches balance after statutory TDS withholding deduction.`,
        });
        matchedTxnIds.add(txn.id);
        break;
      }
    }
  }

  const unmatchedCredits = creditTxns.filter((t) => !matchedTxnIds.has(t.id));

  return {
    proposedMatches,
    unmatchedCredits,
  };
}
