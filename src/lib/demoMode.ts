/**
 * Haq AI — Demo Mode & Seeded Realistic Demonstration Data.
 *
 * Provides instant, zero-setup demo scenarios for pitch juries, investors,
 * and prospective MSME users without requiring live Google Cloud or Firestore credentials.
 */

export interface DemoEnterprise {
  companyName: string;
  udyamNumber: string;
  category: 'MICRO' | 'SMALL';
  gstin: string;
  state: string;
  bankAccount: string;
}

export interface DemoCase {
  id: string;
  invoiceNumber: string;
  buyerName: string;
  buyerGstin: string;
  invoiceDate: string;
  principalRupees: number;
  principalPaise: number;
  agreedDays: number;
  appointedDay: string;
  daysOverdue: number;
  interestRupees: number;
  status:
    | 'DRAFT'
    | 'ELIGIBILITY_CHECKED'
    | 'TRACKING'
    | 'REMINDER_DUE'
    | 'REMINDER_APPROVED'
    | 'REMINDER_SENT'
    | 'NOTICE_DRAFTED'
    | 'PAID';
  recommendation: string;
  section43bhWarning: boolean;
}

export const DEMO_ENTERPRISE: DemoEnterprise = {
  companyName: 'Rajkot Precision Auto Engg Pvt Ltd',
  udyamNumber: 'UDYAM-GJ-01-0012345',
  category: 'MICRO',
  gstin: '24ABCDE1234F1Z5',
  state: 'Gujarat',
  bankAccount: 'HDFC Bank - A/C Ending in 8421',
};

export const DEMO_CASES: DemoCase[] = [
  {
    id: 'case_demo_1',
    invoiceNumber: 'INV-2024-889',
    buyerName: 'Apex Heavy Engineering Ltd',
    buyerGstin: '27AABCA1234A1Z9',
    invoiceDate: '2024-01-05',
    principalRupees: 500000,
    principalPaise: 50000000,
    agreedDays: 15, // Default MSMED statutory limit
    appointedDay: '2024-01-20',
    daysOverdue: 92,
    interestRupees: 38452,
    status: 'NOTICE_DRAFTED',
    recommendation: 'Issue Formal Legal Notice (Section 15 & 16) and prepare MSME Samadhaan kit',
    section43bhWarning: true,
  },
  {
    id: 'case_demo_2',
    invoiceNumber: 'INV-2024-912',
    buyerName: 'Surat Industrial Forge Ltd',
    buyerGstin: '24AABCS9876K1Z2',
    invoiceDate: '2024-02-10',
    principalRupees: 150000,
    principalPaise: 15000000,
    agreedDays: 45, // Written contract capped at 45 days
    appointedDay: '2024-03-26',
    daysOverdue: 0,
    interestRupees: 0,
    status: 'REMINDER_DUE',
    recommendation: 'Send Day 40 Courtesy Reminder prior to statutory deadline',
    section43bhWarning: false,
  },
  {
    id: 'case_demo_3',
    invoiceNumber: 'INV-2024-740',
    buyerName: 'Vadodara Power Transmission Ltd',
    buyerGstin: '24AABCV5544J1Z8',
    invoiceDate: '2023-11-15',
    principalRupees: 1200000,
    principalPaise: 120000000,
    agreedDays: 30,
    appointedDay: '2023-12-15',
    daysOverdue: 45,
    interestRupees: 59120,
    status: 'PAID',
    recommendation: 'Payment recovered in full with Section 194Q TDS reconciliation',
    section43bhWarning: false,
  },
];

export const DEMO_METRICS = {
  totalRecoveredRupees: 1200000,
  activeOverdueRupees: 500000,
  accruedInterestRupees: 38452,
  atRiskSection43bhRupees: 500000,
  casesUnderTracking: 3,
};

/**
 * Checks if the application is running in demo mode
 */
export function isDemoMode(): boolean {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === 'true') return true;
    if (localStorage.getItem('haq_demo_mode') === 'true') return true;
  }
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}

/**
 * Resets local demo state back to pristine default
 */
export function resetDemoData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('haq_demo_cases');
    localStorage.removeItem('haq_demo_reminders');
    localStorage.setItem('haq_demo_mode', 'true');
  }
}
