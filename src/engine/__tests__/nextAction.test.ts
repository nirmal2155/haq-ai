import { describe, it, expect } from 'vitest';
import { determineNextAction } from '../nextAction';

describe('Deterministic Next Action Rules (Not AI)', () => {
  it('returns wait for fully settled invoices', () => {
    const res = determineNextAction({
      daysToDue: 0,
      daysOverdue: 0,
      unpaidPaise: 0,
    });
    expect(res.action).toBe('wait');
    expect(res.label).toBe('Settled');
    expect(res.priority).toBe('low');
  });

  it('returns wait when bill is safely within agreed credit period (> 7 days remaining)', () => {
    const res = determineNextAction({
      daysToDue: 20,
      daysOverdue: 0,
      unpaidPaise: 100000,
    });
    expect(res.action).toBe('wait');
    expect(res.priority).toBe('low');
  });

  it('returns friendly reminder when due within 7 days', () => {
    const res = determineNextAction({
      daysToDue: 3,
      daysOverdue: 0,
      unpaidPaise: 100000,
    });
    expect(res.action).toBe('friendly_reminder');
    expect(res.label).toContain('Friendly Advance Reminder');
    expect(res.recommendedChannel).toBe('whatsapp');
  });

  it('returns friendly reminder for overdue Tier 1 (1 to 15 days overdue)', () => {
    const res = determineNextAction({
      daysToDue: -10,
      daysOverdue: 10,
      unpaidPaise: 100000,
    });
    expect(res.action).toBe('friendly_reminder');
    expect(res.label).toContain('Soft Overdue Reminder');
    expect(res.priority).toBe('medium');
  });

  it('returns formal reminder for overdue Tier 2 (16 to 30 days overdue)', () => {
    const res = determineNextAction({
      daysToDue: -25,
      daysOverdue: 25,
      unpaidPaise: 100000,
    });
    expect(res.action).toBe('formal_reminder');
    expect(res.label).toContain('Section 16');
    expect(res.priority).toBe('high');
    expect(res.recommendedChannel).toBe('email');
  });

  it('returns draft notice for overdue Tier 3 (31 to 45 days overdue)', () => {
    const res = determineNextAction({
      daysToDue: -40,
      daysOverdue: 40,
      unpaidPaise: 100000,
    });
    expect(res.action).toBe('draft_notice');
    expect(res.label).toContain('Statutory Legal Notice');
    expect(res.priority).toBe('critical');
    expect(res.recommendedChannel).toBe('registered_post');
  });

  it('returns samadhaan kit for overdue Tier 4 (> 45 days overdue)', () => {
    const res = determineNextAction({
      daysToDue: -50,
      daysOverdue: 50,
      unpaidPaise: 100000,
    });
    expect(res.action).toBe('samadhaan_kit');
    expect(res.label).toContain('MSME Samadhaan');
    expect(res.priority).toBe('critical');
    expect(res.recommendedChannel).toBe('msefc_portal');
  });

  it('prioritizes formal dispute clarification if active objection lodged', () => {
    const res = determineNextAction({
      daysToDue: -5,
      daysOverdue: 5,
      unpaidPaise: 100000,
      hasDispute: true,
    });
    expect(res.action).toBe('formal_reminder');
    expect(res.label).toContain('Dispute');
  });

  it('every action contains the mandatory human-in-the-loop legal disclaimer', () => {
    const res = determineNextAction({
      daysToDue: -15,
      daysOverdue: 15,
      unpaidPaise: 50000,
    });
    expect(res.legalDisclaimer).toBe('Draft only. Review with a CA/lawyer before sending.');
  });
});
