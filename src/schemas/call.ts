import { z } from 'zod';

export const SaveCallRecordSchema = z.object({
  invoiceId: z.string().min(1),
  consentGiven: z.boolean(),
  transcript: z.string().max(10000).optional(),
  promisedDate: z.string().max(100).nullable().optional(),
});

export type SaveCallRecordInput = z.infer<typeof SaveCallRecordSchema>;

export interface CallRecord {
  id: string;
  invoiceId: string;
  ownerUid: string;
  orgId: string;
  consentGiven: boolean;
  transcript?: string;
  promisedDate?: string | null;
  createdAt: string;
}
