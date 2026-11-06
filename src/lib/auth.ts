import { adminAuth, adminDb } from './firestore';

export interface AuthContext {
  uid: string;
  orgId: string;
}

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 401) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

export async function verifyTokenAndGetContext(request: Request): Promise<AuthContext> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthError('Missing or malformed Authorization header', 401);
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    throw new AuthError('Bearer token is empty', 401);
  }

  // Support local test mock token in test/development environment
  if (process.env.NODE_ENV === 'test' && token.startsWith('test-token-')) {
    const uid = token.replace('test-token-', '');
    return {
      uid,
      orgId: `org_${uid}`,
    };
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Check user document in Firestore to resolve orgId
    const userDoc = await adminDb.collection('users').doc(uid).get();
    let orgId = uid;

    if (userDoc.exists) {
      const data = userDoc.data();
      if (data?.orgId) {
        orgId = data.orgId;
      }
    } else {
      // Auto-initialize default supplier profile if it doesn't exist
      await adminDb.collection('users').doc(uid).set({
        orgId: uid,
        role: 'owner',
        lang: 'en',
        createdAt: new Date().toISOString(),
      }, { merge: true });
    }

    return { uid, orgId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown authentication error';
    throw new AuthError(`Authentication failed: ${message}`, 401);
  }
}
