import { describe, it, expect } from 'vitest';
import { calculateExposure43bh, BuyerBill } from '../exposure43bh';

describe('Section 43B(h) Buyer Exposure Engine', () => {
  it('correctly disallows unpaid invoices overdue by March 31', () => {
    const bills: BuyerBill[] = [
      {
        id: 'bill-1',
        invoiceNumber: 'INV-101',
        invoiceDate: '2024-01-15',
        amountPaise: 10000000, // ₹1,00,000
        hasWrittenAgreement: false, // 15-day limit -> due 2024-01-30
        isMicroOrSmallSupplier: true,
        paymentDate: null,
      },
    ];

    const result = calculateExposure43bh(bills, '2024-03-31');

    expect(result.disallowedBillsCount).toBe(1);
    expect(result.totalDisallowedPaise).toBe(10000000);
    expect(result.bills[0].isDisallowedUnder43Bh).toBe(true);
    // Verifies Rule 4 copy adherence
    expect(result.bills[0].taxTimingImpact).toContain(
      'An unpaid MSME bill beyond the legal limit is deductible only in the year it is actually paid'
    );
    expect(result.bills[0].taxTimingImpact).not.toContain('30% tax on the full invoice');
  });

  it('allows invoices paid within statutory due date', () => {
    const bills: BuyerBill[] = [
      {
        id: 'bill-2',
        invoiceNumber: 'INV-102',
        invoiceDate: '2024-02-01',
        amountPaise: 5000000,
        hasWrittenAgreement: true,
        agreedPaymentDays: 30, // due 2024-03-02
        paidAmountPaise: 5000000,
        paymentDate: '2024-02-28', // paid within due date
        isMicroOrSmallSupplier: true,
      },
    ];

    const result = calculateExposure43bh(bills, '2024-03-31');
    expect(result.disallowedBillsCount).toBe(0);
    expect(result.totalDisallowedPaise).toBe(0);
    expect(result.bills[0].isDisallowedUnder43Bh).toBe(false);
  });

  it('allows invoices paid late but settled within the same FY (before March 31)', () => {
    const bills: BuyerBill[] = [
      {
        id: 'bill-3',
        invoiceNumber: 'INV-103',
        invoiceDate: '2024-01-01',
        amountPaise: 7500000,
        hasWrittenAgreement: false, // due 2024-01-16
        paidAmountPaise: 7500000,
        paymentDate: '2024-03-15', // paid late, but before March 31
        isMicroOrSmallSupplier: true,
      },
    ];

    const result = calculateExposure43bh(bills, '2024-03-31');
    expect(result.disallowedBillsCount).toBe(0);
    expect(result.totalDisallowedPaise).toBe(0);
    expect(result.bills[0].isDisallowedUnder43Bh).toBe(false);
  });

  it('exempts non-MSME (Medium and Large) suppliers from Section 43B(h)', () => {
    const bills: BuyerBill[] = [
      {
        id: 'bill-4',
        invoiceNumber: 'INV-104',
        invoiceDate: '2024-01-01',
        amountPaise: 50000000,
        hasWrittenAgreement: false,
        paymentDate: null,
        isMicroOrSmallSupplier: false, // Medium/Large
      },
    ];

    const result = calculateExposure43bh(bills, '2024-03-31');
    expect(result.disallowedBillsCount).toBe(0);
    expect(result.bills[0].isDisallowedUnder43Bh).toBe(false);
    expect(result.bills[0].statutoryReason).toContain('not a Micro or Small enterprise');
  });

  it('summary includes mandatory statutory disclaimer', () => {
    const result = calculateExposure43bh([], '2024-03-31');
    expect(result.legalDisclaimer).toBe('Draft only. Review with a CA/lawyer before sending.');
  });
});
