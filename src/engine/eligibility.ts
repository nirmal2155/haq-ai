export type EnterpriseType = 'micro' | 'small' | 'medium' | 'large' | 'unknown';
export type ActivityType = 'manufacturing' | 'services' | 'trading' | 'unknown';

export interface EligibilityInput {
  isUdyamRegistered: boolean;
  udyamNumber?: string | null;
  enterpriseType: EnterpriseType;
  activityType?: ActivityType;
  hasWrittenAgreement?: boolean;
  agreedCreditDays?: number | null;
  registrationDate?: string | null; // YYYY-MM-DD
  invoiceDate?: string | null; // YYYY-MM-DD
}

export interface EligibilityResult {
  eligible: boolean;
  needsCaReview: boolean;
  reasons: string[];
  warnings: string[];
}

/**
 * Validates Udyam registration number structure (UDYAM-XX-00-0000000).
 */
export function isValidUdyamFormat(udyamNumber?: string | null): boolean {
  if (!udyamNumber) return false;
  const regex = /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/i;
  return regex.test(udyamNumber.trim());
}

/**
 * Pure deterministic rule engine for MSMED Act Chapter V & Section 43B(h) eligibility.
 * NEVER GUESSES: If status is ambiguous or borderline, flags `needsCaReview: true`.
 */
export function checkMsmeEligibility(input: EligibilityInput): EligibilityResult {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let eligible = true;
  let needsCaReview = false;

  // 1. Udyam Registration Check
  if (!input.isUdyamRegistered) {
    eligible = false;
    reasons.push(
      'Supplier is not registered under Udyam. Section 43B(h) and MSMED Chapter V statutory protections apply only to registered suppliers.'
    );
  } else if (input.udyamNumber && !isValidUdyamFormat(input.udyamNumber)) {
    warnings.push(
      `Udyam registration number "${input.udyamNumber}" does not match standard format (UDYAM-XX-00-0000000). [NEEDS-CA-REVIEW]`
    );
    needsCaReview = true;
  }

  // 2. Pre-requisite Registration Date vs Invoice Date Check
  if (input.registrationDate && input.invoiceDate) {
    const regDate = input.registrationDate.split('T')[0] ?? '';
    const invDate = input.invoiceDate.split('T')[0] ?? '';
    if (regDate > invDate) {
      eligible = false;
      reasons.push(
        `Invoice date (${invDate}) precedes Udyam registration date (${regDate}). MSMED Act protections generally apply only to supplies made after registration. [NEEDS-CA-REVIEW]`
      );
      needsCaReview = true;
    }
  }

  // 3. Enterprise Type Check (Micro or Small ONLY)
  if (input.enterpriseType === 'micro' || input.enterpriseType === 'small') {
    reasons.push(
      `Enterprise is classified as ${input.enterpriseType.toUpperCase()}, satisfying MSMED Act and Section 43B(h) criteria.`
    );
  } else if (input.enterpriseType === 'medium') {
    eligible = false;
    reasons.push(
      'Enterprise is classified as MEDIUM. Section 43B(h) of the Income Tax Act explicitly applies only to Micro and Small enterprises.'
    );
  } else if (input.enterpriseType === 'large') {
    eligible = false;
    reasons.push('Enterprise is LARGE and excluded from MSMED Act Chapter V.');
  } else {
    eligible = false;
    needsCaReview = true;
    reasons.push(
      'Enterprise classification is unknown. Micro/Small status must be verified from Udyam certificate before claiming statutory remedies. [NEEDS-CA-REVIEW]'
    );
  }

  // 4. Activity Type (Trading Nuance)
  if (input.activityType === 'trading') {
    warnings.push(
      'Traders (Wholesale/Retail) with Udyam registration are eligible for Priority Sector Lending but excluded from MSMED Chapter V benefits (OM No. 5/2(2)/2021-E/P&G/Policy). Verify with CA if Section 43B(h) disallowance applies. [NEEDS-CA-REVIEW]'
    );
    needsCaReview = true;
  } else if (input.activityType === 'unknown' || !input.activityType) {
    warnings.push(
      'Activity type is not specified (manufacturing vs trading). Verification recommended. [NEEDS-CA-REVIEW]'
    );
  }

  // 5. Credit Agreement Terms Check
  if (input.hasWrittenAgreement && input.agreedCreditDays !== undefined && input.agreedCreditDays !== null) {
    if (input.agreedCreditDays > 45) {
      warnings.push(
        `Agreed credit period of ${input.agreedCreditDays} days violates Section 15 of MSMED Act. Contractual term is legally capped at 45 days.`
      );
    }
  }

  return {
    eligible,
    needsCaReview,
    reasons,
    warnings,
  };
}
