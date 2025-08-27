
'use client';

import { db } from '@/lib/firebase/client';
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  where,
  writeBatch,
  doc,
  getDoc,
} from 'firebase/firestore';
import { z } from 'zod';
import { getAccounts } from './accounts';
import { Account } from '@/components/chart-of-accounts/account-tree';

const accountDetailSchema = z.object({
  accountId: z.string().min(1, 'Account is required.'),
  amount: z.coerce.number().min(0, 'Amount must be positive.'),
});

const cardAccountDetailSchema = accountDetailSchema.extend({
  receiptImageUrl: z.string().optional(),
});

export const salesRecordSchema = z.object({
  date: z.date(),
  period: z.enum(['Morning', 'Evening']),
  salesperson: z.string().min(2, 'Salesperson name is required.'),
  postingNumber: z.string().optional(),
  cash: accountDetailSchema,
  cards: z.array(cardAccountDetailSchema).optional(),
  credits: z.array(accountDetailSchema).optional(),
});

export type SalesRecordFormData = z.infer<typeof salesRecordSchema>;

export interface AccountDetail {
  accountId: string;
  accountName?: string;
  amount: number;
}

export interface CardAccountDetail extends AccountDetail {
  receiptImageUrl?: string; 
}

export interface SalesRecord {
  id: string;
  date: Timestamp;
  period: 'Morning' | 'Evening';
  cashier: string;
  postingNumber?: string;
  total: number;
  status: 'Pending Upload' | 'Pending Matching' | 'Matched';
  cash: AccountDetail;
  cards: CardAccountDetail[];
  credits: AccountDetail[];
  createdAt: Timestamp;
  actuals?: { [key: string]: number };
  matchNotes?: string;
}

const seedSalesRecords = async () => {
  const allAccounts = await getAccounts();
  const accountMap = createAccountMap(allAccounts);

  const cashAccount = [...accountMap.entries()].find(([id, name]) =>
    name.includes('كاشير')
  )?.[0];
  const networkAccount = [...accountMap.entries()].find(([id, name]) =>
    name.includes('شبكة')
  )?.[0];
  const clientAccount = [...accountMap.entries()].find(([id, name]) =>
    name.includes('اسامه')
  )?.[0];

  if (!cashAccount || !networkAccount || !clientAccount) {
    console.log(
      'Could not find default accounts for seeding sales. Creating some...'
    );
    // This part is complex, for now we will rely on the default accounts being there
    // from the account seeding. If not, we skip seeding sales.
    return;
  }

  const defaultRecords = [
    {
      date: Timestamp.fromDate(new Date()),
      period: 'Morning',
      cashier: 'Yousef Khaled',
      postingNumber: 'PO-001',
      total: 650,
      status: 'Pending Matching',
      cash: {
        accountId: cashAccount,
        accountName: accountMap.get(cashAccount),
        amount: 500,
      },
      cards: [
        {
          accountId: networkAccount,
          accountName: accountMap.get(networkAccount),
          amount: 150,
        },
      ],
      credits: [],
      createdAt: Timestamp.now(),
    },
    {
      date: Timestamp.fromDate(new Date()),
      period: 'Evening',
      cashier: 'Ahmad Ali',
      postingNumber: 'PO-002',
      total: 1200,
      status: 'Matched',
      cash: {
        accountId: cashAccount,
        accountName: accountMap.get(cashAccount),
        amount: 800,
      },
      cards: [],
      credits: [
        {
          accountId: clientAccount,
          accountName: accountMap.get(clientAccount),
          amount: 400,
        },
      ],
      createdAt: Timestamp.now(),
    },
  ];

  const batch = writeBatch(db);
  const salesCol = collection(db, 'salesRecords');
  defaultRecords.forEach((rec) => {
    const newDocRef = doc(salesCol);
    batch.set(newDocRef, rec);
  });
  await batch.commit();
  console.log('Default sales records have been seeded.');
};

// Add a new sales record
export const addSaleRecord = async (
  data: SalesRecordFormData
): Promise<string> => {
  const salesCol = collection(db, 'salesRecords');
  const allAccounts = await getAccounts();
  const accountMap = createAccountMap(allAccounts);

  const enrichedCash = {
    ...data.cash,
    accountName: accountMap.get(data.cash.accountId) || 'Unknown',
  };

  const enrichedCards =
    data.cards?.map((card) => {
      return {
        ...card,
        accountName: accountMap.get(card.accountId) || 'Unknown',
      };
    }) || [];

  const enrichedCredits =
    data.credits?.map((credit) => ({
      ...credit,
      accountName: accountMap.get(credit.accountId) || 'Unknown',
    })) || [];

  const total =
    (data.cash?.amount || 0) +
    (data.cards?.reduce((sum, item) => sum + item.amount, 0) || 0) +
    (data.credits?.reduce((sum, item) => sum + item.amount, 0) || 0);

  const dataToSave = {
    date: Timestamp.fromDate(data.date),
    period: data.period,
    cashier: data.salesperson,
    postingNumber: data.postingNumber || null,
    total: total,
    status: 'Pending Upload',
    cash: enrichedCash,
    cards: enrichedCards,
    credits: enrichedCredits,
    createdAt: Timestamp.now(),
  };

  const newDocRef = await addDoc(salesCol, dataToSave);
  return newDocRef.id;
};

// Helper to create a map of account IDs to names
const createAccountMap = (accounts: Account[]): Map<string, string> => {
  const accountMap = new Map<string, string>();
  const traverse = (accs: Account[]) => {
    for (const acc of accs) {
      accountMap.set(acc.id, acc.name);
      if (acc.children) {
        traverse(acc.children);
      }
    }
  };
  traverse(accounts);
  return accountMap;
};

// Function to enrich records with account names
const enrichRecordsWithAccountNames = (
  records: Omit<SalesRecord, 'id'>[],
  accountMap: Map<string, string>
): Omit<SalesRecord, 'id'>[] => {
  return records.map((record) => ({
    ...record,
    cash: {
      ...record.cash,
      accountName: accountMap.get(record.cash.accountId) || 'Unknown Account',
    },
    cards: record.cards.map((card) => ({
      ...card,
      accountName: accountMap.get(card.accountId) || 'Unknown Account',
    })),
    credits: record.credits.map((credit) => ({
      ...credit,
      accountName: accountMap.get(credit.accountId) || 'Unknown Account',
    })),
  }));
};

// Get all sales records
export const getSalesRecords = async (
  count: number = 20
): Promise<SalesRecord[]> => {
  const salesCol = collection(db, 'salesRecords');
  const q = query(salesCol, orderBy('createdAt', 'desc'), limit(count));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log('No sales records found, seeding database...');
    await seedSalesRecords();
    const seededSnapshot = await getDocs(q);
    if (seededSnapshot.empty) return [];
    return seededSnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as SalesRecord)
    );
  }

  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as SalesRecord)
  );
};

// Get sales records by status
export const getSalesRecordsByStatus = async (
  status: 'Pending Matching' | 'Matched' | 'Pending Upload'
): Promise<SalesRecord[]> => {
  const salesCol = collection(db, 'salesRecords');
  const q = query(
    salesCol,
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty && status === 'Pending Matching') {
    console.log('No pending matching records found, trying to seed...');
    // We only seed when getting all records to avoid multiple seeds.
    // This function will likely be called after getSalesRecords has run and seeded.
    // If still empty, then there are truly no records with this status.
    return [];
  }

  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as SalesRecord)
  );
};

// Get a single sales record by its ID
export const getSaleRecordById = async (id: string): Promise<SalesRecord | null> => {
  if (!id) return null;
  const docRef = doc(db, 'salesRecords', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as SalesRecord;
  } else {
    console.log("No such document!");
    return null;
  }
}
