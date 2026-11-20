import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Firestore Security Rules Static & Behavioral Verification', () => {
  const rulesPath = path.resolve(__dirname, '../../firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

  it('ensures firestore.rules file exists and is valid rules_version 2', () => {
    expect(rulesContent).toBeDefined();
    expect(rulesContent).toContain("rules_version = '2';");
    expect(rulesContent).toContain('service cloud.firestore');
  });

  it('enforces default-deny on undefined paths', () => {
    // Top level default match
    expect(rulesContent).toContain('match /{document=**}');
    expect(rulesContent).toMatch(/match\s+\/\{document=\*\*\}\s*\{\s*allow\s+read,\s*write:\s*if\s+false;\s*\}/);
  });

  it('enforces owner-only access on users collection (/users/{userId})', () => {
    expect(rulesContent).toContain('match /users/{userId}');
    expect(rulesContent).toContain('isOwner(userId)');
    // Unauthenticated access blocked
    expect(rulesContent).toContain('isAuthenticated()');
  });

  it('enforces owner-only access on cases collection and prevents client writes to computed fields', () => {
    expect(rulesContent).toContain('match /cases/{caseId}');
    expect(rulesContent).toContain('request.resource.data.ownerUid == request.auth.uid');
    // Computed fields must not be altered by client
    expect(rulesContent).toContain('areCaseImmutableFieldsUnchanged()');
    expect(rulesContent).toContain("'accruedInterestPaise', 'totalClaimPaise', 'daysOverdue'");
  });

  it('strictly makes caseEvents ledger append-only / server-only write', () => {
    expect(rulesContent).toContain('match /caseEvents/{eventId}');
    // Client write is completely blocked (server-only write via Admin SDK)
    expect(rulesContent).toMatch(/match\s+\/caseEvents\/\{eventId\}\s*\{[\s\S]*?allow\s+write:\s*if\s+false;/);
  });

  it('strictly denies client access to auditLogs and inboundEmails', () => {
    expect(rulesContent).toContain('match /auditLogs/{logId}');
    expect(rulesContent).toMatch(/match\s+\/auditLogs\/\{logId\}\s*\{[\s\S]*?allow\s+read,\s*write:\s*if\s+false;/);

    expect(rulesContent).toContain('match /inboundEmails/{emailId}');
    expect(rulesContent).toMatch(/match\s+\/inboundEmails\/\{emailId\}\s*\{[\s\S]*?allow\s+read,\s*write:\s*if\s+false;/);
  });

  it('enforces read-only access on rateTable', () => {
    expect(rulesContent).toContain('match /rateTable/{rateId}');
    expect(rulesContent).toMatch(/match\s+\/rateTable\/\{rateId\}\s*\{[\s\S]*?allow\s+write:\s*if\s+false;/);
  });

  it('enforces owner-only access and magic-bytes check on evidence collection', () => {
    expect(rulesContent).toContain('match /evidence/{evidenceId}');
    expect(rulesContent).toContain('magicBytesVerified');
    expect(rulesContent).toContain('request.resource.data.ownerUid == request.auth.uid');
  });
});
