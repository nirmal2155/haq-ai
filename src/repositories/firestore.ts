import { adminDb } from '@/lib/firestore';
import { Case, CaseEvent, StatutoryReminderEntity, EvidenceEntity } from '@/domain/types';
import {
  ICaseRepository,
  ICaseEventRepository,
  IReminderRepository,
  IEvidenceRepository,
} from './interfaces';

export class FirestoreCaseRepository implements ICaseRepository {
  async getById(id: string): Promise<Case | null> {
    const snap = await adminDb.collection('cases').doc(id).get();
    if (!snap.exists) return null;
    return snap.data() as Case;
  }

  async save(caseEntity: Case, event?: CaseEvent): Promise<void> {
    const batch = adminDb.batch();
    const caseRef = adminDb.collection('cases').doc(caseEntity.id);
    batch.set(caseRef, caseEntity, { merge: true });

    if (event) {
      const eventRef = adminDb.collection('caseEvents').doc(event.id);
      batch.set(eventRef, event);
    }

    await batch.commit();
  }

  async listByOwner(ownerUid: string): Promise<Case[]> {
    const snap = await adminDb
      .collection('cases')
      .where('ownerUid', '==', ownerUid)
      .orderBy('updatedAt', 'desc')
      .get();

    return snap.docs.map((doc) => doc.data() as Case);
  }

  async delete(id: string, ownerUid: string): Promise<void> {
    const docRef = adminDb.collection('cases').doc(id);
    const snap = await docRef.get();
    if (snap.exists && snap.data()?.ownerUid === ownerUid) {
      await docRef.delete();
    }
  }
}

export class FirestoreCaseEventRepository implements ICaseEventRepository {
  async record(event: CaseEvent): Promise<void> {
    await adminDb.collection('caseEvents').doc(event.id).set(event);
  }

  async listByCaseId(caseId: string): Promise<CaseEvent[]> {
    const snap = await adminDb
      .collection('caseEvents')
      .where('caseId', '==', caseId)
      .orderBy('timestamp', 'asc')
      .get();

    return snap.docs.map((doc) => doc.data() as CaseEvent);
  }
}

export class FirestoreReminderRepository implements IReminderRepository {
  async getById(id: string): Promise<StatutoryReminderEntity | null> {
    const snap = await adminDb.collection('reminders').doc(id).get();
    if (!snap.exists) return null;
    return snap.data() as StatutoryReminderEntity;
  }

  async save(reminder: StatutoryReminderEntity): Promise<void> {
    await adminDb.collection('reminders').doc(reminder.id).set(reminder, { merge: true });
  }

  async listByCaseId(caseId: string): Promise<StatutoryReminderEntity[]> {
    const snap = await adminDb
      .collection('reminders')
      .where('caseId', '==', caseId)
      .orderBy('scheduledFor', 'asc')
      .get();

    return snap.docs.map((doc) => doc.data() as StatutoryReminderEntity);
  }

  async listPending(scheduledBefore: string): Promise<StatutoryReminderEntity[]> {
    const snap = await adminDb
      .collection('reminders')
      .where('status', '==', 'pending')
      .where('scheduledFor', '<=', scheduledBefore)
      .get();

    return snap.docs.map((doc) => doc.data() as StatutoryReminderEntity);
  }
}

export class FirestoreEvidenceRepository implements IEvidenceRepository {
  async getById(id: string): Promise<EvidenceEntity | null> {
    const snap = await adminDb.collection('evidence').doc(id).get();
    if (!snap.exists) return null;
    return snap.data() as EvidenceEntity;
  }

  async save(evidence: EvidenceEntity): Promise<void> {
    await adminDb.collection('evidence').doc(evidence.id).set(evidence, { merge: true });
  }

  async listByCaseId(caseId: string): Promise<EvidenceEntity[]> {
    const snap = await adminDb
      .collection('evidence')
      .where('caseId', '==', caseId)
      .orderBy('uploadedAt', 'desc')
      .get();

    return snap.docs.map((doc) => doc.data() as EvidenceEntity);
  }

  async delete(id: string, ownerUid: string): Promise<void> {
    const docRef = adminDb.collection('evidence').doc(id);
    const snap = await docRef.get();
    if (snap.exists && snap.data()?.ownerUid === ownerUid) {
      await docRef.delete();
    }
  }
}
