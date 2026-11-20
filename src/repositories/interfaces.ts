import { Case, CaseEvent, StatutoryReminderEntity, EvidenceEntity } from '@/domain/types';

export interface ICaseRepository {
  getById(id: string): Promise<Case | null>;
  save(caseEntity: Case, event?: CaseEvent): Promise<void>;
  listByOwner(ownerUid: string): Promise<Case[]>;
  delete(id: string, ownerUid: string): Promise<void>;
}

export interface ICaseEventRepository {
  record(event: CaseEvent): Promise<void>;
  listByCaseId(caseId: string): Promise<CaseEvent[]>;
}

export interface IReminderRepository {
  getById(id: string): Promise<StatutoryReminderEntity | null>;
  save(reminder: StatutoryReminderEntity): Promise<void>;
  listByCaseId(caseId: string): Promise<StatutoryReminderEntity[]>;
  listPending(scheduledBefore: string): Promise<StatutoryReminderEntity[]>;
}

export interface IEvidenceRepository {
  getById(id: string): Promise<EvidenceEntity | null>;
  save(evidence: EvidenceEntity): Promise<void>;
  listByCaseId(caseId: string): Promise<EvidenceEntity[]>;
  delete(id: string, ownerUid: string): Promise<void>;
}
