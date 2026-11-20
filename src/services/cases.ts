import { adminDb } from '@/lib/firestore';
import { InvoiceData } from '@/schemas/invoice';
import { NotFoundError, ForbiddenError } from '@/lib/errors';
import { computeAppointedDay } from '@/engine/deadline';
import { calculateMsmeInterest } from '@/engine/interest';

export interface RecoveryCase {
  id: string;
  ownerUid: string;
  invoiceId: string;
  buyerName: string;
  buyerGstin?: string;
  invoiceNumber: string;
  principalAmountPaise: number;
  accruedInterestPaise: number;
  totalClaimPaise: number;
  status: 'active' | 'in_notice' | 'settled' | 'samadhaan_escalated';
  stage: 'friendly_reminder' | 'formal_demand' | 'legal_notice' | 'samadhaan_filing';
  appointedDay: string;
  createdAt: string;
  updatedAt: string;
}

export async function createRecoveryCase(
  ownerUid: string,
  invoice: InvoiceData
): Promise<RecoveryCase> {
  const calculationDate = new Date();
  const deadlineResult = computeAppointedDay({
    invoiceDate: invoice.invoiceDate,
    deliveryDate: invoice.deliveryDate,
    agreedPaymentDays: invoice.agreedPaymentDays,
  });

  const interestResult = calculateMsmeInterest({
    principalPaise: invoice.totalAmountPaise,
    appointedDay: deadlineResult.appointedDay,
    calculationDate,
    paidAmountPaise: 0,
  });

  const caseId = `case_${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  const newCase: RecoveryCase = {
    id: caseId,
    ownerUid,
    invoiceId: invoice.id,
    buyerName: invoice.buyer.name,
    buyerGstin: invoice.buyer.gstin,
    invoiceNumber: invoice.invoiceNumber,
    principalAmountPaise: invoice.totalAmountPaise,
    accruedInterestPaise: interestResult.interestPaise,
    totalClaimPaise: interestResult.totalDuePaise,
    status: 'active',
    stage: deadlineResult.daysOverdue > 30 ? 'legal_notice' : 'friendly_reminder',
    appointedDay: deadlineResult.appointedDay.toISOString().split('T')[0] ?? '',
    createdAt: now,
    updatedAt: now,
  };

  await adminDb.collection('cases').doc(caseId).set(newCase);
  return newCase;
}

export async function getRecoveryCaseById(
  caseId: string,
  ownerUid: string
): Promise<RecoveryCase> {
  const doc = await adminDb.collection('cases').doc(caseId).get();
  if (!doc.exists) {
    throw new NotFoundError('Recovery case');
  }

  const data = doc.data() as RecoveryCase;
  if (data.ownerUid !== ownerUid) {
    throw new ForbiddenError();
  }

  return data;
}
