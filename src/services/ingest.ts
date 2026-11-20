import { uploadPrivateDocument, validateMagicBytes, AllowedMimeType } from '@/lib/storage';
import { extractInvoiceWithGemini } from '@/lib/gemini';
import { ValidationError } from '@/lib/errors';
import { InvoiceData } from '@/schemas/invoice';
import { rupeesToPaise } from '@/engine/money';

export interface IngestDocumentParams {
  userId: string;
  buffer: Buffer;
  mimeType: AllowedMimeType;
}

export interface IngestDocumentResult {
  storagePath: string;
  sha256: string;
  extractedData: InvoiceData;
}

export async function ingestInvoiceDocument(
  params: IngestDocumentParams
): Promise<IngestDocumentResult> {
  const validation = validateMagicBytes(params.buffer);
  if (!validation.valid || validation.mime !== params.mimeType) {
    throw new ValidationError(
      validation.error || 'Magic byte verification failed. Unsupported file signature.'
    );
  }

  // 1. Store in private Cloud Storage bucket under userId isolation
  const { storagePath, sha256 } = await uploadPrivateDocument(
    params.buffer,
    params.userId,
    params.mimeType
  );

  // 2. Extract structured fields with Gemini
  const extracted = await extractInvoiceWithGemini(params.buffer, params.mimeType);

  return {
    storagePath,
    sha256,
    extractedData: {
      id: `inv_${crypto.randomUUID()}`,
      ownerUid: params.userId,
      invoiceNumber: extracted.invoiceNo,
      invoiceDate: extracted.invoiceDate,
      acceptanceDate: extracted.acceptanceDate || undefined,
      agreedPaymentDays: extracted.agreedCreditDays,
      totalAmountPaise: rupeesToPaise(extracted.amountRupees),
      paidAmountPaise: 0,
      buyer: {
        name: extracted.buyerName,
        gstin: extracted.buyerGstin || undefined,
      },
    },
  };
}
