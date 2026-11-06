import { z } from 'zod';

const serverEnvSchema = z.object({
  FIREBASE_PROJECT_ID: z.string().min(1, 'FIREBASE_PROJECT_ID is required'),
  FIREBASE_CLIENT_EMAIL: z.string().email('FIREBASE_CLIENT_EMAIL must be a valid email'),
  FIREBASE_PRIVATE_KEY: z.string().min(1, 'FIREBASE_PRIVATE_KEY is required'),
  FIREBASE_STORAGE_BUCKET: z.string().min(1, 'FIREBASE_STORAGE_BUCKET is required'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  GEMINI_MODEL: z.string().default('gemini-2.0-flash'),
  GEMINI_LIVE_MODEL: z.string().default('gemini-2.0-flash-exp'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_API_KEY is required'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is required'),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_PROJECT_ID is required'),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is required'),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID is required'),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_APP_ID is required'),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

let cachedServerEnv: ServerEnv | null = null;
let cachedClientEnv: ClientEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error('FATAL: Attempted to access server environment variables from client bundle!');
  }

  if (cachedServerEnv) {
    return cachedServerEnv;
  }

  const rawEnv = {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
    GEMINI_LIVE_MODEL: process.env.GEMINI_LIVE_MODEL,
    NODE_ENV: process.env.NODE_ENV,
  };

  const parsed = serverEnvSchema.safeParse(rawEnv);
  if (!parsed.success) {
    const errorDetails = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new Error(`Environment validation failed (server): ${errorDetails}`);
  }

  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}

export function getClientEnv(): ClientEnv {
  if (cachedClientEnv) {
    return cachedClientEnv;
  }

  const rawEnv = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const parsed = clientEnvSchema.safeParse(rawEnv);
  if (!parsed.success) {
    const errorDetails = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new Error(`Environment validation failed (client): ${errorDetails}`);
  }

  cachedClientEnv = parsed.data;
  return cachedClientEnv;
}

export { serverEnvSchema, clientEnvSchema };
