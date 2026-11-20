import { NextResponse } from 'next/server';
import { z } from 'zod';
import { secureRoute } from '@/lib/apiSecurity';
import { parseBankStatementCsv, matchBankTransactionsToCases } from '@/engine/paymentMatcher';
import { CaseService } from '@/services/cases';

export const dynamic = 'force-dynamic';

const statementMatchSchema = z.object({
  csvContent: z.string().min(1, 'Bank statement CSV content is required'),
});

export const POST = secureRoute(
  {
    action: 'MATCH_BANK_STATEMENT_CSV',
    bodySchema: statementMatchSchema,
    rateLimitPerMinute: 10,
  },
  async ({ auth, body }) => {
    const { uid } = auth;

    // 1. Parse CSV transactions deterministically
    const transactions = parseBankStatementCsv(body.csvContent);

    // 2. Fetch user's active cases
    const caseService = new CaseService();
    const cases = await caseService.listCasesByOwner(uid);

    // 3. Propose matches
    const reconciliation = matchBankTransactionsToCases(transactions, cases);

    return NextResponse.json({
      success: true,
      totalParsedTransactions: transactions.length,
      proposedMatchesCount: reconciliation.proposedMatches.length,
      unmatchedCreditsCount: reconciliation.unmatchedCredits.length,
      proposedMatches: reconciliation.proposedMatches,
      unmatchedCredits: reconciliation.unmatchedCredits,
      confirmationRequired: true,
      legalDisclaimer: 'Draft only. Review with a CA/lawyer before sending.',
    });
  }
);
