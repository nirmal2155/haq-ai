import { describe, it, expect } from 'vitest';
import {
  canTransition,
  transitionCase,
  IllegalStateTransitionError,
  ALLOWED_TRANSITIONS,
} from '../caseStateMachine';
import { Case, Actor } from '../types';

function createMockCase(overrides?: Partial<Case>): Case {
  return {
    id: 'case_test_123',
    ownerUid: 'user_456',
    invoiceId: 'inv_789',
    state: 'DRAFT',
    principalAmountPaise: 5000000,
    paidAmountPaise: 0,
    accruedInterestPaise: 0,
    totalClaimPaise: 5000000,
    statutoryCapDays: 45,
    appointedDay: '2024-03-01',
    daysOverdue: 0,
    buyerName: 'Acme Corp',
    buyerGstin: '27AAACA1234A1Z5',
    invoiceNumber: 'INV-001',
    invoiceDate: '2024-01-15',
    deliveryDate: null,
    acceptanceDate: null,
    isDeemedAcceptance: false,
    hasDispute: false,
    disputeNotes: null,
    lastIdempotencyKey: null,
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
    ...overrides,
  };
}

const mockActor: Actor = { uid: 'user_456', role: 'user' };

describe('Haq AI Case State Machine', () => {
  describe('Transition Matrix (ALLOWED_TRANSITIONS)', () => {
    it('allows valid standard recovery flow', () => {
      expect(canTransition('DRAFT', 'ELIGIBILITY_CHECKED')).toBe(true);
      expect(canTransition('ELIGIBILITY_CHECKED', 'TRACKING')).toBe(true);
      expect(canTransition('TRACKING', 'REMINDER_DUE')).toBe(true);
      expect(canTransition('REMINDER_DUE', 'REMINDER_APPROVED')).toBe(true);
      expect(canTransition('REMINDER_APPROVED', 'REMINDER_SENT')).toBe(true);
      expect(canTransition('REMINDER_SENT', 'NOTICE_DRAFTED')).toBe(true);
      expect(canTransition('NOTICE_DRAFTED', 'NOTICE_SENT_BY_USER')).toBe(true);
      expect(canTransition('NOTICE_SENT_BY_USER', 'PAID')).toBe(true);
      expect(canTransition('PAID', 'CLOSED')).toBe(true);
    });

    it('allows direct payment from any active recovery state', () => {
      expect(canTransition('TRACKING', 'PAID')).toBe(true);
      expect(canTransition('REMINDER_DUE', 'PAID')).toBe(true);
      expect(canTransition('REMINDER_APPROVED', 'PAID')).toBe(true);
      expect(canTransition('REMINDER_SENT', 'PAID')).toBe(true);
      expect(canTransition('NOTICE_DRAFTED', 'PAID')).toBe(true);
      expect(canTransition('NOTICE_SENT_BY_USER', 'PAID')).toBe(true);
    });

    it('allows ineligibility and termination flows', () => {
      expect(canTransition('DRAFT', 'INELIGIBLE')).toBe(true);
      expect(canTransition('ELIGIBILITY_CHECKED', 'INELIGIBLE')).toBe(true);
      expect(canTransition('INELIGIBLE', 'CLOSED')).toBe(true);
    });

    it('forbids outbound transitions from terminal CLOSED state', () => {
      expect(ALLOWED_TRANSITIONS.CLOSED).toHaveLength(0);
      expect(canTransition('CLOSED', 'TRACKING')).toBe(false);
      expect(canTransition('CLOSED', 'DRAFT')).toBe(false);
      expect(canTransition('CLOSED', 'PAID')).toBe(false);
    });
  });

  describe('transitionCase Execution & Guards', () => {
    it('executes a valid state transition and writes an append-only event', () => {
      const initialCase = createMockCase({ state: 'DRAFT' });
      const result = transitionCase({
        caseEntity: initialCase,
        toState: 'ELIGIBILITY_CHECKED',
        eventType: 'ELIGIBILITY_EVALUATED',
        actor: mockActor,
        idempotencyKey: 'idem_elig_001',
      });

      expect(result.updatedCase.state).toBe('ELIGIBILITY_CHECKED');
      expect(result.updatedCase.lastIdempotencyKey).toBe('idem_elig_001');
      expect(result.isIdempotentReplay).toBe(false);

      // Event checks
      expect(result.event.type).toBe('ELIGIBILITY_EVALUATED');
      expect(result.event.fromState).toBe('DRAFT');
      expect(result.event.toState).toBe('ELIGIBILITY_CHECKED');
      expect(result.event.actor).toEqual(mockActor);
      expect(result.event.payloadHash).toMatch(/^[a-f0-9]{64}$/); // 64-char hex SHA-256
    });

    it('strictly throws IllegalStateTransitionError on illegal transitions', () => {
      const initialCase = createMockCase({ state: 'DRAFT' });

      // Cannot skip directly from DRAFT to NOTICE_SENT_BY_USER
      expect(() =>
        transitionCase({
          caseEntity: initialCase,
          toState: 'NOTICE_SENT_BY_USER',
          eventType: 'NOTICE_MARKED_SENT',
          actor: mockActor,
          idempotencyKey: 'idem_skip_001',
        })
      ).toThrow(IllegalStateTransitionError);
    });

    it('strictly throws IllegalStateTransitionError when trying to transition from CLOSED', () => {
      const closedCase = createMockCase({ state: 'CLOSED' });

      expect(() =>
        transitionCase({
          caseEntity: closedCase,
          toState: 'TRACKING',
          eventType: 'STATUS_MODIFIED',
          actor: mockActor,
          idempotencyKey: 'idem_closed_001',
        })
      ).toThrow(IllegalStateTransitionError);
    });
  });

  describe('Idempotency Key Handling', () => {
    it('safely replays when given identical idempotencyKey and target state', () => {
      const initialCase = createMockCase({ state: 'DRAFT' });

      const firstTransition = transitionCase({
        caseEntity: initialCase,
        toState: 'ELIGIBILITY_CHECKED',
        eventType: 'ELIGIBILITY_EVALUATED',
        actor: mockActor,
        idempotencyKey: 'idem_key_same',
      });

      // Repeat with the exact same key
      const replayTransition = transitionCase({
        caseEntity: firstTransition.updatedCase,
        toState: 'ELIGIBILITY_CHECKED',
        eventType: 'ELIGIBILITY_EVALUATED',
        actor: mockActor,
        idempotencyKey: 'idem_key_same',
      });

      expect(replayTransition.isIdempotentReplay).toBe(true);
      expect(replayTransition.updatedCase.state).toBe('ELIGIBILITY_CHECKED');
    });

    it('throws 409 conflict when idempotencyKey is reused with a different target state', () => {
      const initialCase = createMockCase({
        state: 'ELIGIBILITY_CHECKED',
        lastIdempotencyKey: 'idem_key_conflict',
      });

      expect(() =>
        transitionCase({
          caseEntity: initialCase,
          toState: 'TRACKING',
          eventType: 'TRACKING_STARTED',
          actor: mockActor,
          idempotencyKey: 'idem_key_conflict', // reusing key for different target state
        })
      ).toThrowError(/Idempotency conflict/);
    });
  });
});
