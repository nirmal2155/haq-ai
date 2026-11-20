import { z } from 'zod';

/**
 * Haq AI — Domain States for MSME Recovery Cases
 */
export const CASE_STATES = [
  'DRAFT',
  'ELIGIBILITY_CHECKED',
  'TRACKING',
  'REMINDER_DUE',
  'REMINDER_APPROVED',
  'REMINDER_SENT',
  'NOTICE_DRAFTED',
  'NOTICE_SENT_BY_USER',
  'PAID',
  'CLOSED',
  'INELIGIBLE',
] as const;

export type CaseState = (typeof CASE_STATES)[number];

export const CaseStateSchema = z.enum(CASE_STATES);

export interface Actor {
  uid: string;
  role: 'user' | 'system' | 'admin';
}

export const ActorSchema = z.object({
  uid: z.string().min(1),
  role: z.enum(['user', 'system', 'admin']),
});

export type CaseEventType =
  | 'CASE_CREATED'
  | 'ELIGIBILITY_EVALUATED'
  | 'TRACKING_STARTED'
  | 'REMINDER_TRIGGERED'
  | 'REMINDER_APPROVED'
  | 'REMINDER_DISPATCHED'
  | 'NOTICE_GENERATED'
  | 'NOTICE_MARKED_SENT'
  | 'PAYMENT_RECORDED'
  | 'CASE_CLOSED'
  | 'STATUS_MODIFIED';

export interface CaseEvent {
  id: string;
  caseId: string;
  actor: Actor;
  type: CaseEventType;
  fromState: CaseState | null;
  toState: CaseState;
  timestamp: string; // ISO-8601
  payloadHash: string; // SHA-256 of non-PII event metadata
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}

export const CaseEventSchema = z.object({
  id: z.string().min(1),
  caseId: z.string().min(1),
  actor: ActorSchema,
  type: z.string().min(1) as z.ZodType<CaseEventType>,
  fromState: CaseStateSchema.nullable(),
  toState: CaseStateSchema,
  timestamp: z.string(),
  payloadHash: z.string().length(64), // SHA-256 hex string
  idempotencyKey: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
});

export interface Case {
  id: string;
  ownerUid: string;
  invoiceId: string;
  state: CaseState;
  principalAmountPaise: number;
  paidAmountPaise: number;
  accruedInterestPaise: number;
  totalClaimPaise: number;
  statutoryCapDays: number;
  appointedDay: string; // YYYY-MM-DD
  daysOverdue: number;
  buyerName: string;
  buyerGstin: string | null;
  invoiceNumber: string;
  invoiceDate: string; // YYYY-MM-DD
  deliveryDate: string | null;
  acceptanceDate: string | null;
  isDeemedAcceptance: boolean;
  hasDispute: boolean;
  disputeNotes: string | null;
  lastIdempotencyKey: string | null;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
}

export const CaseSchema = z.object({
  id: z.string().min(1),
  ownerUid: z.string().min(1),
  invoiceId: z.string().min(1),
  state: CaseStateSchema,
  principalAmountPaise: z.number().int().nonnegative(),
  paidAmountPaise: z.number().int().nonnegative(),
  accruedInterestPaise: z.number().int().nonnegative(),
  totalClaimPaise: z.number().int().nonnegative(),
  statutoryCapDays: z.number().int().positive(),
  appointedDay: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  daysOverdue: z.number().int().nonnegative(),
  buyerName: z.string().min(1),
  buyerGstin: z.string().nullable(),
  invoiceNumber: z.string().min(1),
  invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  deliveryDate: z.string().nullable(),
  acceptanceDate: z.string().nullable(),
  isDeemedAcceptance: z.boolean(),
  hasDispute: z.boolean(),
  disputeNotes: z.string().nullable(),
  lastIdempotencyKey: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export interface UserProfile {
  id: string; // matches auth.uid
  email: string;
  businessName: string;
  udyamNumber?: string | null;
  enterpriseType: 'micro' | 'small' | 'medium';
  gstin?: string | null;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StatutoryReminderEntity {
  id: string;
  caseId: string;
  ownerUid: string;
  trigger: 'before_due' | 'on_appointed_day' | 'overdue_15_days' | 'overdue_30_days' | 'year_end_43bh';
  scheduledFor: string; // ISO-8601
  status: 'pending' | 'approved' | 'sent' | 'cancelled';
  channel: 'email' | 'whatsapp' | 'sms';
  approvedAt: string | null;
  sentAt: string | null;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceEntity {
  id: string;
  caseId: string;
  ownerUid: string;
  name: string;
  storagePath: string;
  sha256: string;
  mimeType: string;
  sizeBytes: number;
  magicBytesVerified: boolean;
  uploadedAt: string;
}

export interface InboundEmailEntity {
  id: string;
  from: string;
  subject: string;
  receivedAt: string;
  caseId: string | null;
  buyerGstin: string | null;
  contentSnippet: string;
  status: 'pending' | 'processed' | 'matched' | 'unmatched';
  createdAt: string;
}
