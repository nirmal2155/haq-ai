import { NextResponse } from 'next/server';
import { verifyTokenAndGetContext, AuthError } from '@/lib/auth';
import { checkRateLimit } from '@/lib/ratelimit';
import { adminDb } from '@/lib/firestore';
import { writeAuditLog } from '@/lib/audit';
import { computeDueDate } from '@/engine/deadline';
import { computeInterest, DEFAULT_LEGAL_CONFIG } from '@/engine/interest';
import { renderNoticeTemplate, verifyNumberIntegrity } from '@/schemas/notice';
import { generateNoticeTranslationAndSummary } from '@/lib/gemini';
import { formatPaiseToINR, paiseToRupees } from '@/engine/money';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const GenerateNoticeSchema = z.object({
  invoiceId: z.string().min(1),
  lang: z.enum(['en', 'hi', 'gu']).default('en'),
  supplierName: z.string().optional(),
  supplierUdyam: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const { uid, orgId } = await verifyTokenAndGetContext(request);
    const rate = await checkRateLimit(uid, 30);
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    const { invoiceId, lang, supplierName, supplierUdyam } = GenerateNoticeSchema.parse(body);

    // Fetch invoice and check ownership
    const invoiceDoc = await adminDb.collection('invoices').doc(invoiceId).get();
    if (!invoiceDoc.exists) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const invoiceData = invoiceDoc.data()!;
    if (invoiceData.ownerUid !== uid) {
      return NextResponse.json({ error: 'Forbidden: You do not own this invoice' }, { status: 403 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Compute statutory deadline
    const deadline = computeDueDate({
      acceptanceDate: invoiceData.acceptanceDate,
      hasWrittenAgreement: invoiceData.hasWrittenAgreement,
      agreedCreditDays: invoiceData.agreedCreditDays,
    });

    // Compute statutory interest
    const interest = computeInterest({
      principalPaise: invoiceData.amountPaise,
      dueDate: deadline.dueDate,
      asOfDate: today,
      paidPaise: invoiceData.paidPaise || 0,
      config: DEFAULT_LEGAL_CONFIG,
    });

    const noticeData = {
      supplierName: supplierName || 'Registered MSME Supplier',
      supplierUdyam: supplierUdyam || 'UDYAM-REG-0000000',
      buyerName: invoiceData.buyerName,
      buyerGstin: invoiceData.buyerGstin,
      invoiceNo: invoiceData.invoiceNo,
      invoiceDate: invoiceData.invoiceDate,
      acceptanceDate: invoiceData.acceptanceDate,
      statutoryDueDate: deadline.dueDate,
      amountPaise: invoiceData.amountPaise,
      paidPaise: invoiceData.paidPaise || 0,
      unpaidPaise: interest.unpaidPrincipalPaise,
      daysOverdue: interest.daysOverdue,
      bankRatePercent: DEFAULT_LEGAL_CONFIG.bankRatePercent,
      effectiveRatePercent: interest.effectiveAnnualRatePercent,
      interestPaise: interest.interestPaise,
      totalPaise: interest.totalPaise,
      noticeDate: today,
    };

    // 1. Code fills fixed template deterministically
    const bodyEn = renderNoticeTemplate(noticeData);

    // Critical tokens that must never be altered or omitted by LLM translation
    const criticalTokens = [
      invoiceData.invoiceNo,
      invoiceData.invoiceDate,
      deadline.dueDate,
      String(invoiceData.amountPaise),
      String(interest.daysOverdue),
      String(interest.interestPaise),
      String(interest.totalPaise),
      formatPaiseToINR(interest.totalPaise),
    ];

    // 2. Call Gemini for translation and 3-line polite summary
    const { translatedBody: llmTranslated, summaryLocal } =
      await generateNoticeTranslationAndSummary({
        templateEn: bodyEn,
        lang,
        criticalTokens,
      });

    // 3. Number Integrity Verification (Hard Rule)
    let finalBody = llmTranslated;
    let fallbackUsed = false;

    if (lang !== 'en') {
      const integrity = verifyNumberIntegrity(bodyEn, llmTranslated, [
        invoiceData.invoiceNo,
        String(interest.daysOverdue),
        String(interest.totalPaise),
      ]);

      if (!integrity.intact) {
        console.warn(
          `[NOTICE_INTEGRITY_FAIL] Missing tokens in LLM translation: ${integrity.missingTokens.join(', ')}. Falling back to plain template.`
        );
        finalBody = bodyEn;
        fallbackUsed = true;
      }
    }

    // Save to Firestore notices collection
    const noticeDoc = {
      invoiceId,
      ownerUid: uid,
      orgId,
      lang,
      bodyEn,
      finalBody,
      summaryLocal,
      fallbackUsed,
      disclaimer: 'Draft only. Review with a CA/lawyer before sending.',
      createdAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection('notices').add(noticeDoc);

    await writeAuditLog({
      uid,
      action: 'NOTICE_DRAFTED',
      resourceId: docRef.id,
    });

    return NextResponse.json({
      success: true,
      noticeId: docRef.id,
      bodyEn,
      finalBody,
      summaryLocal,
      fallbackUsed,
      disclaimer: noticeDoc.disclaimer,
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid parameters', issues: error.issues }, { status: 400 });
    }
    console.error('[NOTICE_GENERATE_ERROR]', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json({ error: 'Failed to generate statutory notice' }, { status: 500 });
  }
}
