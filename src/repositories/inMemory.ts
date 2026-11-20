import { Case, CaseEvent, StatutoryReminderEntity, EvidenceEntity } from '@/domain/types';
import {
  ICaseRepository,
  ICaseEventRepository,
  IReminderRepository,
  IEvidenceRepository,
} from './interfaces';

export class InMemoryCaseRepository implements ICaseRepository {
  private cases = new Map<string, Case>();
  private eventRepo?: ICaseEventRepository;

  constructor(eventRepo?: ICaseEventRepository) {
    this.eventRepo = eventRepo;
  }

  async getById(id: string): Promise<Case | null> {
    return this.cases.get(id) || null;
  }

  async save(caseEntity: Case, event?: CaseEvent): Promise<void> {
    this.cases.set(caseEntity.id, { ...caseEntity });
    if (event && this.eventRepo) {
      await this.eventRepo.record(event);
    }
  }

  async listByOwner(ownerUid: string): Promise<Case[]> {
    return Array.from(this.cases.values()).filter((c) => c.ownerUid === ownerUid);
  }

  async delete(id: string, ownerUid: string): Promise<void> {
    const existing = this.cases.get(id);
    if (existing && existing.ownerUid === ownerUid) {
      this.cases.delete(id);
    }
  }

  // Testing helper
  clear(): void {
    this.cases.clear();
  }
}

export class InMemoryCaseEventRepository implements ICaseEventRepository {
  private events: CaseEvent[] = [];

  async record(event: CaseEvent): Promise<void> {
    this.events.push({ ...event });
  }

  async listByCaseId(caseId: string): Promise<CaseEvent[]> {
    return this.events.filter((e) => e.caseId === caseId);
  }

  clear(): void {
    this.events = [];
  }
}

export class InMemoryReminderRepository implements IReminderRepository {
  private reminders = new Map<string, StatutoryReminderEntity>();

  async getById(id: string): Promise<StatutoryReminderEntity | null> {
    return this.reminders.get(id) || null;
  }

  async save(reminder: StatutoryReminderEntity): Promise<void> {
    this.reminders.set(reminder.id, { ...reminder });
  }

  async listByCaseId(caseId: string): Promise<StatutoryReminderEntity[]> {
    return Array.from(this.reminders.values()).filter((r) => r.caseId === caseId);
  }

  async listPending(scheduledBefore: string): Promise<StatutoryReminderEntity[]> {
    return Array.from(this.reminders.values()).filter(
      (r) => r.status === 'pending' && r.scheduledFor <= scheduledBefore
    );
  }

  clear(): void {
    this.reminders.clear();
  }
}

export class InMemoryEvidenceRepository implements IEvidenceRepository {
  private evidence = new Map<string, EvidenceEntity>();

  async getById(id: string): Promise<EvidenceEntity | null> {
    return this.evidence.get(id) || null;
  }

  async save(evidence: EvidenceEntity): Promise<void> {
    this.evidence.set(evidence.id, { ...evidence });
  }

  async listByCaseId(caseId: string): Promise<EvidenceEntity[]> {
    return Array.from(this.evidence.values()).filter((e) => e.caseId === caseId);
  }

  async delete(id: string, ownerUid: string): Promise<void> {
    const existing = this.evidence.get(id);
    if (existing && existing.ownerUid === ownerUid) {
      this.evidence.delete(id);
    }
  }

  clear(): void {
    this.evidence.clear();
  }
}
