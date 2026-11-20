import { describe, it, expect, beforeEach } from 'vitest';
import { CaseService } from '../cases';
import { InMemoryCaseRepository, InMemoryCaseEventRepository } from '@/repositories/inMemory';
import { InvoiceData } from '@/schemas/invoice';

describe('CaseService with In-Memory Repository', () => {
  let eventRepo: InMemoryCaseEventRepository;
  let caseRepo: InMemoryCaseRepository;
  let service: CaseService;

  beforeEach(() => {
    eventRepo = new InMemoryCaseEventRepository();
    caseRepo = new InMemoryCaseRepository(eventRepo);
    service = new CaseService(caseRepo);
  });

  const mockInvoice: InvoiceData = {
    id: 'inv_101',
    ownerUid: 'user_abc',
    invoiceNumber: 'INV-2024-001',
    invoiceDate: '2024-01-10',
    deliveryDate: '2024-01-12',
    acceptanceDate: '2024-01-12',
    agreedPaymentDays: 30,
    totalAmountPaise: 10000000, // ₹1,00,000
    paidAmountPaise: 0,
    buyer: {
      name: 'Reliance Industries Limited',
      gstin: '24AAACR1234Q1Z2',
    },
  };

  it('creates a new case in DRAFT state and records CASE_CREATED event', async () => {
    const { caseEntity, event } = await service.createCase({
      ownerUid: 'user_abc',
      invoice: mockInvoice,
      idempotencyKey: 'idem_create_1',
      actor: { uid: 'user_abc', role: 'user' },
    });

    expect(caseEntity.state).toBe('DRAFT');
    expect(caseEntity.principalAmountPaise).toBe(10000000);
    expect(caseEntity.ownerUid).toBe('user_abc');

    // Verify repository persistence
    const saved = await caseRepo.getById(caseEntity.id);
    expect(saved).not.toBeNull();
    expect(saved?.id).toBe(caseEntity.id);

    // Verify append-only event recorded
    expect(event.type).toBe('CASE_CREATED');
    expect(event.fromState).toBeNull();
    expect(event.toState).toBe('DRAFT');
    const events = await eventRepo.listByCaseId(caseEntity.id);
    expect(events).toHaveLength(1);
    expect(events[0].idempotencyKey).toBe('idem_create_1');
  });

  it('transitions through full recovery lifecycle and logs events', async () => {
    const { caseEntity } = await service.createCase({
      ownerUid: 'user_abc',
      invoice: mockInvoice,
      idempotencyKey: 'idem_init',
      actor: { uid: 'user_abc', role: 'user' },
    });

    // 1. DRAFT -> ELIGIBILITY_CHECKED
    const t1 = await service.transition({
      caseId: caseEntity.id,
      toState: 'ELIGIBILITY_CHECKED',
      ownerUid: 'user_abc',
      actor: { uid: 'user_abc', role: 'user' },
      idempotencyKey: 'idem_step_1',
    });
    expect(t1.updatedCase.state).toBe('ELIGIBILITY_CHECKED');

    // 2. ELIGIBILITY_CHECKED -> TRACKING
    const t2 = await service.transition({
      caseId: caseEntity.id,
      toState: 'TRACKING',
      ownerUid: 'user_abc',
      actor: { uid: 'user_abc', role: 'user' },
      idempotencyKey: 'idem_step_2',
    });
    expect(t2.updatedCase.state).toBe('TRACKING');

    // 3. TRACKING -> REMINDER_DUE
    const t3 = await service.transition({
      caseId: caseEntity.id,
      toState: 'REMINDER_DUE',
      ownerUid: 'user_abc',
      actor: { uid: 'system', role: 'system' },
      idempotencyKey: 'idem_step_3',
    });
    expect(t3.updatedCase.state).toBe('REMINDER_DUE');

    // 4. REMINDER_DUE -> REMINDER_APPROVED
    const t4 = await service.transition({
      caseId: caseEntity.id,
      toState: 'REMINDER_APPROVED',
      ownerUid: 'user_abc',
      actor: { uid: 'user_abc', role: 'user' },
      idempotencyKey: 'idem_step_4',
    });
    expect(t4.updatedCase.state).toBe('REMINDER_APPROVED');

    // 5. REMINDER_APPROVED -> REMINDER_SENT
    const t5 = await service.transition({
      caseId: caseEntity.id,
      toState: 'REMINDER_SENT',
      ownerUid: 'user_abc',
      actor: { uid: 'system', role: 'system' },
      idempotencyKey: 'idem_step_5',
    });
    expect(t5.updatedCase.state).toBe('REMINDER_SENT');

    // Check all append-only events
    const allEvents = await eventRepo.listByCaseId(caseEntity.id);
    expect(allEvents).toHaveLength(6); // 1 create + 5 transitions
  });

  it('rejects access from unauthorized owner', async () => {
    const { caseEntity } = await service.createCase({
      ownerUid: 'user_abc',
      invoice: mockInvoice,
      idempotencyKey: 'idem_auth_test',
      actor: { uid: 'user_abc', role: 'user' },
    });

    await expect(
      service.getCaseById(caseEntity.id, 'unauthorized_hacker')
    ).rejects.toThrowError(/Access denied/);
  });
});
