/**
 * Haq AI — Runtime Secret Manager Access
 * Conforms to Master Rule 3: Never commit secrets, never expose API keys to browser.
 * In Cloud Run production, secrets are mounted from Google Secret Manager.
 */

const secretCache = new Map<string, string>();

export async function getSecret(secretName: string): Promise<string> {
  // Check memory cache first
  const cached = secretCache.get(secretName);
  if (cached) {
    return cached;
  }

  // 1. Check environment variable (injected via Secret Manager secretKeyRef in Cloud Run)
  const envVal = process.env[secretName];
  if (envVal && envVal.trim() !== '') {
    secretCache.set(secretName, envVal);
    return envVal;
  }

  // 2. In local test/development mode, allow fallback placeholders
  if (process.env.NODE_ENV === 'test') {
    const testSecret = `test-secret-${secretName}`;
    secretCache.set(secretName, testSecret);
    return testSecret;
  }

  throw new Error(`CRITICAL_SECURITY_ERROR: Required secret "${secretName}" not found in runtime environment or Secret Manager.`);
}
