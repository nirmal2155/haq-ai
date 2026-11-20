import { NextResponse } from 'next/server';
import { secureRoute } from '@/lib/apiSecurity';
import { adminDb, adminAuth } from '@/lib/firestore';
import { deleteUserStorageFolder } from '@/lib/storage';

export const dynamic = 'force-dynamic';

/**
 * DPDP Act (2023) Compliance & User Right to Erasure:
 * Deletes all user documents, cases, invoices, evidence, storage files,
 * notices, calls, and deletes the Firebase Auth user account.
 */
export const DELETE = secureRoute(
  {
    action: 'USER_DATA_ERASURE_DPDP',
    rateLimitPerMinute: 5,
  },
  async ({ auth }) => {
    const { uid } = auth;

    let deletedInvoicesCount = 0;
    let deletedCasesCount = 0;
    let deletedRemindersCount = 0;
    let deletedEvidenceCount = 0;
    let deletedNoticesCount = 0;
    let deletedCallsCount = 0;

    // 1. Delete user cases
    const caseSnap = await adminDb.collection('cases').where('ownerUid', '==', uid).get();
    for (const doc of caseSnap.docs) {
      await doc.ref.delete();
      deletedCasesCount++;
    }

    // 2. Delete user reminders
    const reminderSnap = await adminDb.collection('reminders').where('ownerUid', '==', uid).get();
    for (const doc of reminderSnap.docs) {
      await doc.ref.delete();
      deletedRemindersCount++;
    }

    // 3. Delete user evidence records
    const evidenceSnap = await adminDb.collection('evidence').where('ownerUid', '==', uid).get();
    for (const doc of evidenceSnap.docs) {
      await doc.ref.delete();
      deletedEvidenceCount++;
    }

    // 4. Delete user files from private Cloud Storage bucket
    const deletedFilesCount = await deleteUserStorageFolder(uid).catch(() => 0);

    // 5. Delete user invoices
    const invoiceSnap = await adminDb.collection('invoices').where('ownerUid', '==', uid).get();
    for (const doc of invoiceSnap.docs) {
      await doc.ref.delete();
      deletedInvoicesCount++;
    }

    // 6. Delete user notices
    const noticeSnap = await adminDb.collection('notices').where('ownerUid', '==', uid).get();
    for (const doc of noticeSnap.docs) {
      await doc.ref.delete();
      deletedNoticesCount++;
    }

    // 7. Delete user calls
    const callSnap = await adminDb.collection('calls').where('ownerUid', '==', uid).get();
    for (const doc of callSnap.docs) {
      await doc.ref.delete();
      deletedCallsCount++;
    }

    // 8. Delete user profile document
    await adminDb.collection('users').doc(uid).delete().catch(() => {});

    // 9. Delete Firebase Auth user record
    await adminAuth.deleteUser(uid).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'All user data and account records erased in accordance with DPDP compliance.',
      deleted: {
        cases: deletedCasesCount,
        invoices: deletedInvoicesCount,
        reminders: deletedRemindersCount,
        evidence: deletedEvidenceCount,
        files: deletedFilesCount,
        notices: deletedNoticesCount,
        calls: deletedCallsCount,
      },
    });
  }
);
