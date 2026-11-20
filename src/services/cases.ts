import { InvoiceData } from '@/schemas/invoice';
import { NotFoundError, ForbiddenError } from '@/lib/errors';
import { computeAppointedDay } from '@/engine/deadline';
import { calculateMsmeInterest } from '@/engine/interest';
import { Case, CaseEvent, CaseState, Actor } from '@/domain/types';
import { transitionCase, computeNonPiiPayloadHash } from '@/domain/caseStateMachine';
import { ICaseRepository } from '@/repositories/interfaces';
import { FirestoreCaseRepository } from '@/repositories/firestore';

export interface CreateCaseParams {
  ownerUid: string;
  invoice: InvoiceData;
  idempotencyKey: string;
  actor: Actor;
}

export interface TransitionCaseParams {
  caseId: string;
  toState: CaseState;
  ownerUid: string;
  actor: Actor;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
  stateUpdates?: Partial<Omit<Case, 'id' | 'ownerUid' | 'state' | 'lastIdempotencyKey' | 'createdAt'>>;
}

export class CaseService {
  constructor(private repo: ICaseRepository = new FirestoreCaseRepository()) {}

  async createCase(params: CreateCaseParams): Promise<{ caseEntity: Case; event: CaseEvent }> {
    const { ownerUid, invoice, idempotencyKey, actor } = params;

    const calculationDate = new Date();
    const deadlineResult = computeAppointedDay({
      invoiceDate: invoice.invoiceDate,
      deliveryDate: invoice.deliveryDate,
      acceptanceDate: invoice.acceptanceDate,
      agreedPaymentDays: invoice.agreedPaymentDays,
    });

    const interestResult = calculateMsmeInterest({
      principalPaise: invoice.totalAmountPaise,
      appointedDay: deadlineResult.appointedDay,
      calculationDate,
      paidAmountPaise: invoice.paidAmountPaise ?? 0,
    });

    const caseId = `case_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const caseEntity: Case = {
      id: caseId,
      ownerUid,
      invoiceId: invoice.id,
      state: 'DRAFT',
      principalAmountPaise: invoice.totalAmountPaise,
      paidAmountPaise: invoice.paidAmountPaise ?? 0,
      accruedInterestPaise: interestResult.interestPaise,
      totalClaimPaise: interestResult.totalDuePaise,
      statutoryCapDays: deadlineResult.statutoryLimitDays,
      appointedDay: deadlineResult.appointedDayStr,
      daysOverdue: deadlineResult.daysOverdue,
      buyerName: invoice.buyer.name,
      buyerGstin: invoice.buyer.gstin || null,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      deliveryDate: invoice.deliveryDate || null,
      acceptanceDate: invoice.acceptanceDate || null,
      isDeemedAcceptance: deadlineResult.isDeemedAcceptance,
      hasDispute: false,
      disputeNotes: null,
      lastIdempotencyKey: idempotencyKey,
      createdAt: now,
      updatedAt: now,
    };

    const payloadHash = computeNonPiiPayloadHash({
      caseId,
      fromState: null,
      toState: 'DRAFT',
      timestamp: now,
      idempotencyKey,
    });

    const event: CaseEvent = {
      id: `evt_${crypto.randomUUID()}`,
      caseId,
      actor,
      type: 'CASE_CREATED',
      fromState: null,
      toState: 'DRAFT',
      timestamp: now,
      payloadHash,
      idempotencyKey,
    };

    await this.repo.save(caseEntity, event);

    return { caseEntity, event };
  }

  async transition(params: TransitionCaseParams): Promise<{ updatedCase: Case; event: CaseEvent }> {
    const { caseId, toState, ownerUid, actor, idempotencyKey, metadata, stateUpdates } = params;

    const caseEntity = await this.repo.getById(caseId);
    if (!caseEntity) {
      throw new NotFoundError('Recovery case');
    }

    if (caseEntity.ownerUid !== ownerUid) {
      throw new ForbiddenError();
    }

    const result = transitionCase({
      caseEntity,
      toState,
      eventType: 'STATUS_MODIFIED',
      actor,
      idempotencyKey,
      metadata,
      stateUpdates,
    });

    if (!result.isIdempotentReplay) {
      await this.repo.save(result.updatedCase, result.event);
    }

    return {
      updatedCase: result.updatedCase,
      event: result.event,
    };
  }

  async getCaseById(caseId: string, ownerUid: string): Promise<Case> {
    const caseEntity = await this.repo.getById(caseId);
    if (!caseEntity) {
      throw new NotFoundError('Recovery case');
    }
    if (caseEntity.ownerUid !== ownerUid) {
      throw new ForbiddenError();
    }
    return caseEntity;
  }

  async listCasesByOwner(ownerUid: string): Promise<Case[]> {
    return this.repo.listByOwner(ownerUid);
  }
}

// Standalone functions for backward compatibility
const defaultService = new CaseService();

export async function createRecoveryCase(
  ownerUid: string,
  invoice: InvoiceData
): Promise<Case> {
  const result = await defaultService.createCase({
    ownerUid,
    invoice,
    idempotencyKey: `init_${invoice.id}_${Date.now()}`,
    actor: { uid: ownerUid, role: 'user' },
  });
  return result.caseEntity;
}

export async function getRecoveryCaseById(
  caseId: string,
  ownerUid: string
): Promise<Case> {
  return defaultService.getCaseById(caseId, ownerUid);
}
