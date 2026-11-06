import { adminDb } from './firestore';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

// In-memory fallback for test environment and low-latency cache
const localMemoryStore = new Map<string, { count: number; windowStart: number }>();

export async function checkRateLimit(
  uid: string,
  limitPerMinute = 30
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowDurationMs = 60 * 1000;
  const currentWindowKey = Math.floor(now / windowDurationMs).toString();
  const docId = `${uid}_${currentWindowKey}`;

  // In-memory fast path (or test mode)
  if (process.env.NODE_ENV === 'test') {
    const record = localMemoryStore.get(docId) || { count: 0, windowStart: now };
    if (record.count >= limitPerMinute) {
      return {
        allowed: false,
        remaining: 0,
        resetSeconds: Math.ceil((windowDurationMs - (now % windowDurationMs)) / 1000),
      };
    }
    record.count += 1;
    localMemoryStore.set(docId, record);
    return {
      allowed: true,
      remaining: limitPerMinute - record.count,
      resetSeconds: Math.ceil((windowDurationMs - (now % windowDurationMs)) / 1000),
    };
  }

  try {
    const docRef = adminDb.collection('rateLimits').doc(docId);
    let count = 1;

    await adminDb.runTransaction(async (transaction) => {
      const snap = await transaction.get(docRef);
      if (!snap.exists) {
        transaction.set(docRef, {
          uid,
          count: 1,
          createdAt: now,
          expiresAt: now + windowDurationMs * 2, // for TTL cleanup
        });
      } else {
        count = (snap.data()?.count || 0) + 1;
        transaction.update(docRef, { count });
      }
    });

    const resetSeconds = Math.ceil((windowDurationMs - (now % windowDurationMs)) / 1000);

    if (count > limitPerMinute) {
      return {
        allowed: false,
        remaining: 0,
        resetSeconds,
      };
    }

    return {
      allowed: true,
      remaining: Math.max(0, limitPerMinute - count),
      resetSeconds,
    };
  } catch (err) {
    // Fail closed or degrade to in-memory on error
    console.warn(`[RATELIMIT_WARN] Firestore counter unavailable, using in-memory tracker`);
    const record = localMemoryStore.get(docId) || { count: 0, windowStart: now };
    if (record.count >= limitPerMinute) {
      return { allowed: false, remaining: 0, resetSeconds: 60 };
    }
    record.count += 1;
    localMemoryStore.set(docId, record);
    return { allowed: true, remaining: limitPerMinute - record.count, resetSeconds: 60 };
  }
}
