import { describe, it, expect } from 'vitest';
import { rupeesToPaise, paiseToRupees, formatPaiseToINR } from '../money';

describe('rupeesToPaise', () => {
  it('converts standard decimal string', () => {
    expect(rupeesToPaise('1234.56')).toBe(123456);
  });

  it('converts integer string', () => {
    expect(rupeesToPaise('100')).toBe(10000);
  });

  it('handles number input', () => {
    expect(rupeesToPaise(999.99)).toBe(99999);
  });

  it('strips commas from Indian format', () => {
    expect(rupeesToPaise('1,00,000.50')).toBe(10000050);
  });

  it('handles zero', () => {
    expect(rupeesToPaise(0)).toBe(0);
  });

  it('handles empty string as zero', () => {
    expect(rupeesToPaise('')).toBe(0);
  });

  it('rounds half-up correctly', () => {
    // 1.005 rupees = 100.5 paise -> rounds to 101
    expect(rupeesToPaise('1.005')).toBe(101);
  });

  it('throws on non-numeric input', () => {
    expect(() => rupeesToPaise('abc')).toThrow();
  });
});

describe('paiseToRupees', () => {
  it('converts to 2 decimal places', () => {
    expect(paiseToRupees(123456)).toBe('1234.56');
  });

  it('handles zero', () => {
    expect(paiseToRupees(0)).toBe('0.00');
  });

  it('handles single paise', () => {
    expect(paiseToRupees(1)).toBe('0.01');
  });

  it('throws on non-integer', () => {
    expect(() => paiseToRupees(123.45)).toThrow();
  });
});

describe('formatPaiseToINR', () => {
  it('formats zero paise correctly', () => {
    expect(formatPaiseToINR(0)).toBe('₹0.00');
  });

  it('formats below 1000 rupees', () => {
    expect(formatPaiseToINR(50000)).toBe('₹500.00');
  });

  it('formats 1 lakh with Indian commas', () => {
    expect(formatPaiseToINR(10000000)).toBe('₹1,00,000.00');
  });

  it('formats large crore amount', () => {
    expect(formatPaiseToINR(1000000000)).toBe('₹1,00,00,000.00');
  });

  it('formats negative paise', () => {
    // Negative paise formatting should include the minus sign
    const result = formatPaiseToINR(-10000);
    expect(result).toContain('-');
    expect(result).toContain('₹');
  });

  it('formats 1 paise as ₹0.01', () => {
    expect(formatPaiseToINR(1)).toBe('₹0.01');
  });
});
