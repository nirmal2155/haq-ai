import { NextResponse } from 'next/server';
import { z } from 'zod';
import { secureRoute } from '@/lib/apiSecurity';
import { CaseService } from '@/services/cases';
import { adminDb } from '@/lib/firestore';
import { createEvidencePack } from '@/services/evidencePack';
import { CaseEvent } from '@/domain/types';

export const dynamic = 'force-dynamic';

export const GET = secureRoute(
  {
    action: 'GENERATE_EVIDENCE_PACK',
    paramsSchema: z.object({ id: z.string().min(1) }),
  },
  async ({ auth, params }) => {
    const caseId = params.id;
    const { uid } = auth;

    const caseService = new CaseService();
    const caseEntity = await caseService.getCaseById(caseId, uid);

    // 1. Fetch case events (timeline)
    const eventsSnap = await adminDb
      .collection('caseEvents')
      .where('caseId', '==', caseId)
      .orderBy('timestamp', 'asc')
      .get();
    const events = eventsSnap.docs.map((d) => d.data() as CaseEvent);

    // 2. Fetch case reminders
    const remindersSnap = await adminDb
      .collection('reminders')
      .where('caseId', '==', caseId)
      .get();
    const reminders = remindersSnap.docs.map((d) => d.data());

    // 3. Generate Evidence Pack & Samadhaan Copy Kit
    const evidencePack = await createEvidencePack({
      caseEntity,
      events,
      reminders,
    });

    return NextResponse.json({
      success: true,
      caseId,
      downloadUrl: evidencePack.signedDownloadUrl,
      samadhaanKit: evidencePack.samadhaanKit,
      disclaimer: evidencePack.disclaimer,
    });
  }
);
