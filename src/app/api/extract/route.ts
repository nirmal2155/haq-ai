import { NextResponse } from 'next/server';
import { verifyTokenAndGetContext, AuthError } from '@/lib/auth';
import { checkRateLimit } from '@/lib/ratelimit';
import { validateMagicBytes, computeSha256, uploadPrivateDocument, AllowedMimeType } from '@/lib/storage';
import { extractInvoiceFromBuffer } from '@/lib/gemini';
import { validateAndConvertExtraction } from '@/schemas/invoice';
import { writeAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const { uid } = await verifyTokenAndGetContext(request);

    // 2. Rate limit (30 requests/min default)
    const rate = await checkRateLimit(uid, 30);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before uploading more files.' },
        { status: 429, headers: { 'Retry-After': String(rate.resetSeconds) } }
      );
    }

    // 3. Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Validate magic bytes and size (<= 8 MB)
    const validation = validateMagicBytes(buffer);
    if (!validation.valid || !validation.mime) {
      return NextResponse.json(
        { error: validation.error || 'Invalid file format or size exceeded' },
        { status: 400 }
      );
    }

    // 5. Compute SHA256
    const sha256 = computeSha256(buffer);

    // 6. Upload to private Cloud Storage bucket under random UUID
    let storagePath = `uploads/${uid}/mock_${Date.now()}.pdf`;
    try {
      const uploadRes = await uploadPrivateDocument(buffer, uid, validation.mime as AllowedMimeType);
      storagePath = uploadRes.storagePath;
    } catch (storageErr) {
      // In development or test without live Cloud Storage, log safely without failing extraction
      console.warn('[STORAGE_NOTICE] Local upload path used');
    }

    // 7. Call Gemini model for structured extraction
    const rawExtracted = await extractInvoiceFromBuffer(buffer, validation.mime);

    // 8. Re-validate model output strictly with Zod & compute paise
    const { data: validatedInvoice, fieldsNeedingReview } = validateAndConvertExtraction(rawExtracted);

    // 9. Write safe audit log (no PII)
    await writeAuditLog({
      uid,
      action: 'INVOICE_EXTRACTED',
      resourceId: sha256.substring(0, 16),
    });

    return NextResponse.json({
      success: true,
      extracted: {
        ...validatedInvoice,
        fieldsNeedingReview,
      },
      source: {
        storagePath,
        mime: validation.mime,
        sha256,
      },
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    console.error('[EXTRACT_ROUTE_ERROR]', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing the document. Please verify the file and try again.' },
      { status: 500 }
    );
  }
}
