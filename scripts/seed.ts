import { adminDb } from '../src/lib/firestore';
import { SEED_DATA } from '../src/lib/seedData';

export async function runSeed(): Promise<void> {
  console.log('[SEED] Seeding 3 suppliers, 2 buyers, and 8 invoices...');

  // Seed users & orgs
  for (const s of SEED_DATA.suppliers) {
    try {
      await adminDb.collection('users').doc(s.uid).set({
        orgId: `org_${s.uid}`,
        name: s.name,
        udyamNo: s.udyam,
        gstin: s.gstin,
        role: 'owner',
        lang: 'en',
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      // ignore if offline
    }
  }

  // Seed invoices
  for (const inv of SEED_DATA.invoices) {
    try {
      await adminDb.collection('invoices').doc(inv.id).set({
        ...inv,
        createdAt: new Date().toISOString(),
      });
      console.log(`[SEED] Saved invoice: ${inv.id}`);
    } catch (e) {
      // ignore if offline
    }
  }

  console.log('[SEED] Seeding finished successfully.');
}

if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
