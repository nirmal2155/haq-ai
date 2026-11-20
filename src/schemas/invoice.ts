import { z } from 'zod';
import { rupeesToPaise } from '../engine/money';

// Standard 15-character GSTIN format: 2 digit state code + 10 char PAN + 1 entity code + 'Z' + 1 checksum char
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const ISO_DATE_REGEX = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;

export const RawExtractionSchema = z.object({
  buyerName: z.string().min(1, 'Buyer name is required').max(200),
  buyerGstin: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val ? val.trim().toUpperCase() : null))
    .refine((val) => val === null || val === '' || GSTIN_REGEX.test(val), {
      message: 'Invalid Indian GSTIN format',
    }),
  invoiceNo: z.string().min(1, 'Invoice number is required').max(100),
  invoiceDate: z.string().regex(ISO_DATE_REGEX, 'Invoice date must be YYYY-MM-DD'),
  acceptanceDate: z
    .string()
    .nullable()
    .optional()
    .refine((val) => !val || ISO_DATE_REGEX.test(val), {
      message: 'Acceptance date must be YYYY-MM-DD or null',
    }),
  amountRupees: z
    .string()
    .min(1, 'Amount in rupees is required')
    .refine((val) => {
      const cleaned = val.replace(/,/g, '').trim();
      const num = parseFloat(cleaned);
      return !isNaN(num) && num > 0;
    }, 'Amount must be a positive number'),
  hasWrittenAgreement: z.boolean().default(false),
  agreedCreditDays: z
    .number()
    .int()
    .min(0)
    .max(365)
    .nullable()
    .optional(),
  documentType: z.enum([
    'tax_invoice',
    'delivery_challan',
    'commercial_invoice',
    'agreement',
    'other',
  ]).default('tax_invoice'),
  fieldsNeedingReview: z.array(z.string()).default([]),
});

export type RawExtractedInvoice = z.infer<typeof RawExtractionSchema>;

export interface InvoiceData {
  id: string;
  ownerUid: string;
  invoiceNumber: string;
  invoiceDate: string;
  deliveryDate?: string;
  acceptanceDate?: string;
  agreedPaymentDays?: number | null;
  totalAmountPaise: number;
  paidAmountPaise?: number;
  buyer: {
    name: string;
    gstin?: string;
  };
}

export interface ConfirmedInvoicePayload {
  buyerName: string;
  buyerGstin: string | null;
  invoiceNo: string;
  invoiceDate: string;
  acceptanceDate: string;
  deemedAcceptance: boolean;
  amountPaise: number;
  paidPaise: number;
  hasWrittenAgreement: boolean;
  agreedCreditDays: number | null;
  status: 'pending' | 'partially_paid' | 'overdue' | 'paid';
  source?: {
    storagePath: string;
    mime: string;
    sha256: string;
  };
  extraction?: {
    model: string;
    fieldsNeedingReview: string[];
  };
}

export function validateAndConvertExtraction(raw: unknown): {
  data: RawExtractedInvoice & { amountPaise: number };
  fieldsNeedingReview: string[];
} {
  const parsed = RawExtractionSchema.parse(raw);
  const amountPaise = rupeesToPaise(parsed.amountRupees);

  const fieldsNeedingReview = [...parsed.fieldsNeedingReview];

  if (!parsed.acceptanceDate) {
    if (!fieldsNeedingReview.includes('acceptanceDate')) {
      fieldsNeedingReview.push('acceptanceDate');
    }
  }

  return {
    data: {
      ...parsed,
      amountPaise,
    },
    fieldsNeedingReview,
  };
}
