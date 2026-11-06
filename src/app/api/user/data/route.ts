import { NextResponse } from 'next/server';
import { verifyTokenAndGetContext, AuthError } from '@/lib/auth';
import { checkRateLimit } from '@/lib/ratelimit';
import { adminDb } from '@/lib/firestore';
import { writeAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

/**
 * DPDP Act Compliance & User Right to Erasure:
 * Deletes all invoices, generated notices, call transcripts, and metadata
 * associated with the authenticated user.
 */
export async function DELETE(request: Request) {
  try {
    const { uid } = await verifyTokenAndGetContext(request);

    const rate = await checkRateLimit(uid, 5);
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    let deletedInvoicesCount = 0;
    let deletedNoticesCount = 0;
    let deletedCallsCount = 0;

    // 1. Delete user invoices
    const invoiceSnap = await adminDb
      .collection('invoices')
      .where('ownerUid', '==', uid)
      .get();

    for (const doc of invoiceSnap.docs) {
      await doc.ref.delete();
      deletedInvoicesCount++;
    }

    // 2. Delete user notices
    const noticeSnap = await adminDb
      .collection('notices')
      .where('ownerUid', '==', uid)
      .get();

    for (const doc of noticeSnap.docs) {
      await doc.ref.delete();
      deletedNoticesCount++;
    }

    // 3. Delete user calls
    const callSnap = await adminDb
      .collection('calls')
      .where('ownerUid', '==', uid)
      .get();

    for (const doc of callSnap.docs) {
      await doc.ref.delete();
      deletedCallsCount++;
    }

    // Write safe audit log (IDs only, zero PII)
    await writeAuditLog({
      uid,
      action: 'USER_DATA_DELETED',
      resourceId: uid,
    });

    return NextResponse.json({
      success: true,
      message: 'All user data erased successfully in accordance with DPDP compliance.',
      deleted: {
        invoices: deletedInvoicesCount,
        notices: deletedNoticesCount,
        calls: deletedCallsCount,
      },
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('[USER_DATA_DELETE_ERROR]', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json({ error: 'Failed to erase user data' }, { status: 500 });
  }
}
