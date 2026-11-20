import { describe, it, expect } from 'vitest';
import { GET as healthzHandler } from '@/app/api/healthz/route';
import { rupeesToPaise, paiseToRupees } from '@/engine/money';
import { computeAppointedDay } from '@/engine/deadline';
import { calculateMsmeInterest } from '@/engine/interest';
import { getTranslation } from '@/i18n';

describe('Repository Skeleton Smoke Tests', () => {
  it('healthz liveness handler returns 200 with ok status', async () => {
    const response = await healthzHandler();
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.status).toBe('ok');
    expect(json.service).toBe('haq-ai');
    expect(json.probe).toBe('liveness');
    expect(typeof json.uptime).toBe('number');
  });

  it('deterministic engine arithmetic works without floating point distortion', () => {
    const paise = rupeesToPaise('12345.67');
    expect(paise).toBe(1234567);
    expect(paiseToRupees(paise)).toBe('12345.67');
  });

  it('deadline computation computes statutory 15 days without agreement', () => {
    const result = computeAppointedDay({
      invoiceDate: new Date('2024-01-01T00:00:00.000Z'),
      agreedPaymentDays: undefined,
    });
    expect(result.statutoryLimitDays).toBe(15);
    expect(result.appointedDay.toISOString().split('T')[0]).toBe('2024-01-16');
  });

  it('interest computation enforces zero interest when not overdue', () => {
    const result = calculateMsmeInterest({
      principalPaise: 100000,
      appointedDay: new Date('2024-02-01'),
      calculationDate: new Date('2024-01-15'),
      paidAmountPaise: 0,
    });
    expect(result.interestPaise).toBe(0);
    expect(result.daysOverdue).toBe(0);
    expect(result.totalDuePaise).toBe(100000);
  });

  it('i18n loads English, Hindi, and Gujarati dictionaries with mandatory legal disclaimers', () => {
    const en = getTranslation('en');
    const hi = getTranslation('hi');
    const gu = getTranslation('gu');

    expect(en.disclaimer).toContain('Draft only');
    expect(hi.disclaimer).toContain('केवल ड्राफ्ट');
    expect(gu.disclaimer).toContain('માત્ર ડ્રાફ્ટ');
  });
});
