import * as admin from 'firebase-admin';

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    const existing = admin.apps[0];
    if (existing) return existing;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (clientEmail && privateKey) {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId || 'demo-project',
        clientEmail,
        privateKey,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }

  // Cloud Run or Google Cloud environment with Application Default Credentials
  return admin.initializeApp({
    projectId: projectId || process.env.GOOGLE_CLOUD_PROJECT || 'haq-ai-demo',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export const adminApp = getAdminApp();
export const adminDb = admin.firestore(adminApp);
export const adminAuth = admin.auth(adminApp);
export const adminStorage = admin.storage(adminApp);
