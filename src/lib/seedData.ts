export interface SeedInvoice {
  id: string;
  ownerUid: string;
  orgId: string;
  supplierName: string;
  buyerName: string;
  buyerGstin: string;
  invoiceNo: string;
  invoiceDate: string;
  acceptanceDate: string;
  deemedAcceptance: boolean;
  amountPaise: number;
  paidPaise: number;
  hasWrittenAgreement: boolean;
  agreedCreditDays: number | null;
  status: 'pending' | 'partially_paid' | 'overdue' | 'paid';
}

export const SEED_DATA: {
  suppliers: Array<{ uid: string; name: string; udyam: string; gstin: string }>;
  buyers: Array<{ orgId: string; name: string; gstin: string }>;
  invoices: SeedInvoice[];
} = {
  suppliers: [
    {
      uid: 'supplier_demo',
      name: 'Gujarat Precision Engineering Pvt Ltd',
      udyam: 'UDYAM-GJ-01-0012345',
      gstin: '24AAACG1234G1Z9',
    },
    {
      uid: 'supplier_2',
      name: 'Kaveri Component Works',
      udyam: 'UDYAM-TN-02-0054321',
      gstin: '33AAACK5678K1Z3',
    },
    {
      uid: 'supplier_3',
      name: 'Shree Fab Industries',
      udyam: 'UDYAM-MH-03-0099887',
      gstin: '27AAACS9988S1Z1',
    },
  ],
  buyers: [
    {
      orgId: 'buyer_apex',
      name: 'Apex Motors India Ltd',
      gstin: '27AAACA1234A1Z5',
    },
    {
      orgId: 'buyer_zenith',
      name: 'Zenith Infrastructure Projects Ltd',
      gstin: '24AAACZ9876Z1Z8',
    },
  ],
  invoices: [
    // 1. 60 days late - High interest
    {
      id: 'inv_001_tata',
      ownerUid: 'supplier_demo',
      orgId: 'org_supplier_demo',
      supplierName: 'Gujarat Precision Engineering Pvt Ltd',
      buyerName: 'Apex Motors India Ltd',
      buyerGstin: '27AAACA1234A1Z5',
      invoiceNo: 'INV/2026/089',
      invoiceDate: '2026-07-01',
      acceptanceDate: '2026-07-05',
      deemedAcceptance: false,
      amountPaise: 85000000, // ₹8,50,000.00
      paidPaise: 0,
      hasWrittenAgreement: true,
      agreedCreditDays: 45,
      status: 'overdue',
    },
    // 2. 10 days late
    {
      id: 'inv_002_zenith',
      ownerUid: 'supplier_demo',
      orgId: 'org_supplier_demo',
      supplierName: 'Gujarat Precision Engineering Pvt Ltd',
      buyerName: 'Zenith Infrastructure Projects Ltd',
      buyerGstin: '24AAACZ9876Z1Z8',
      invoiceNo: 'INV/2026/112',
      invoiceDate: '2026-09-01',
      acceptanceDate: '2026-09-05',
      deemedAcceptance: false,
      amountPaise: 32000000, // ₹3,20,000.00
      paidPaise: 0,
      hasWrittenAgreement: true,
      agreedCreditDays: 30,
      status: 'overdue',
    },
    // 3. On-time (due in future)
    {
      id: 'inv_003_ontime',
      ownerUid: 'supplier_demo',
      orgId: 'org_supplier_demo',
      supplierName: 'Gujarat Precision Engineering Pvt Ltd',
      buyerName: 'Apex Motors India Ltd',
      buyerGstin: '27AAACA1234A1Z5',
      invoiceNo: 'INV/2026/145',
      invoiceDate: '2026-10-25',
      acceptanceDate: '2026-10-28',
      deemedAcceptance: false,
      amountPaise: 50000000, // ₹5,00,000.00
      paidPaise: 0,
      hasWrittenAgreement: true,
      agreedCreditDays: 30,
      status: 'pending',
    },
    // 4. Partially paid (45 days late on remainder)
    {
      id: 'inv_004_partial',
      ownerUid: 'supplier_demo',
      orgId: 'org_supplier_demo',
      supplierName: 'Gujarat Precision Engineering Pvt Ltd',
      buyerName: 'Apex Motors India Ltd',
      buyerGstin: '27AAACA1234A1Z5',
      invoiceNo: 'INV/2026/040',
      invoiceDate: '2026-07-15',
      acceptanceDate: '2026-07-20',
      deemedAcceptance: false,
      amountPaise: 120000000, // ₹12,00,000.00
      paidPaise: 70000000,    // ₹7,00,000.00
      hasWrittenAgreement: true,
      agreedCreditDays: 30,
      status: 'partially_paid',
    },
    // 5. 15-day rule (No written agreement, 35 days overdue)
    {
      id: 'inv_005_noagree',
      ownerUid: 'supplier_2',
      orgId: 'org_supplier_2',
      supplierName: 'Kaveri Component Works',
      buyerName: 'Zenith Infrastructure Projects Ltd',
      buyerGstin: '24AAACZ9876Z1Z8',
      invoiceNo: 'KCW/26/89',
      invoiceDate: '2026-08-10',
      acceptanceDate: '2026-08-15',
      deemedAcceptance: true,
      amountPaise: 18000000, // ₹1,80,000.00
      paidPaise: 0,
      hasWrittenAgreement: false,
      agreedCreditDays: null,
      status: 'overdue',
    },
    // 6. Capped agreed days (contract asked 90 days, capped to 45 by law)
    {
      id: 'inv_006_capped',
      ownerUid: 'supplier_2',
      orgId: 'org_supplier_2',
      supplierName: 'Kaveri Component Works',
      buyerName: 'Apex Motors India Ltd',
      buyerGstin: '27AAACA1234A1Z5',
      invoiceNo: 'KCW/26/102',
      invoiceDate: '2026-08-01',
      acceptanceDate: '2026-08-05',
      deemedAcceptance: false,
      amountPaise: 64000000, // ₹6,40,000.00
      paidPaise: 0,
      hasWrittenAgreement: true,
      agreedCreditDays: 90, // Capped to 45 days
      status: 'overdue',
    },
    // 7. On-time supplier 3
    {
      id: 'inv_007_ontime2',
      ownerUid: 'supplier_3',
      orgId: 'org_supplier_3',
      supplierName: 'Shree Fab Industries',
      buyerName: 'Zenith Infrastructure Projects Ltd',
      buyerGstin: '24AAACZ9876Z1Z8',
      invoiceNo: 'SFI/2026/012',
      invoiceDate: '2026-10-20',
      acceptanceDate: '2026-10-22',
      deemedAcceptance: false,
      amountPaise: 21000000, // ₹2,10,000.00
      paidPaise: 0,
      hasWrittenAgreement: true,
      agreedCreditDays: 30,
      status: 'pending',
    },
    // 8. 90 days late - Major 43B(h) exposure
    {
      id: 'inv_008_severelate',
      ownerUid: 'supplier_3',
      orgId: 'org_supplier_3',
      supplierName: 'Shree Fab Industries',
      buyerName: 'Apex Motors India Ltd',
      buyerGstin: '27AAACA1234A1Z5',
      invoiceNo: 'SFI/2026/001',
      invoiceDate: '2026-05-10',
      acceptanceDate: '2026-05-15',
      deemedAcceptance: false,
      amountPaise: 150000000, // ₹15,00,000.00
      paidPaise: 0,
      hasWrittenAgreement: true,
      agreedCreditDays: 45,
      status: 'overdue',
    },
  ],
};
