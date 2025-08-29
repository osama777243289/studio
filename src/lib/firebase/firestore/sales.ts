

'use client';

import { db, storage } from '@/lib/firebase/client';
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
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { z } from 'zod';
import { getAccounts } from './accounts';
import { Account } from '@/components/chart-of-accounts/account-tree';

const cardAccountDetailSchema = z.object({
    accountId: z.string(),
    amount: z.coerce.number().min(0, 'Amount must be positive.'),
    receiptImage: z.string().optional(), // Expecting a base64 data URL
}).superRefine((data, ctx) => {
    if (data.amount > 0 && !data.accountId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "يجب تحديد حساب للبطاقة طالما أن المبلغ أكبر من صفر.",
            path: ['accountId'],
        });
    }
});


const creditAccountDetailSchema = z.object({
    accountId: z.string(),
    amount: z.coerce.number().min(0, 'Amount must be positive.'),
}).superRefine((data, ctx) => {
    if (data.amount > 0 && !data.accountId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "يجب تحديد حساب العميل طالما أن المبلغ أكبر من صفر.",
            path: ['accountId'],
        });
    }
});

export const salesRecordSchema = z.object({
  date: z.date(),
  period: z.enum(['Morning', 'Evening']),
  salesperson: z.string().min(2, 'Salesperson name is required.'),
  postingNumber: z.string().optional(),
  cash: z.object({
    accountId: z.string().min(1, 'يجب تحديد حساب نقدي.'),
    amount: z.coerce.number().min(0, 'Amount must be positive.'),
  }).optional(),
  cards: z.array(cardAccountDetailSchema).optional(),
  credits: z.array(creditAccountDetailSchema).optional(),
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
  status: 'Pending Upload' | 'Pending Matching' | 'Ready for Posting' | 'Posted';
  cash: AccountDetail;
  cards: CardAccountDetail[];
  credits: AccountDetail[];
  createdAt: Timestamp;
  actuals?: { [key: string]: number };
  matchNotes?: string;
  costOfSales?: number;
}

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
      status: 'Ready for Posting',
      costOfSales: 750,
      actuals: {
        'cash': 800,
        'credit-0': 400
      },
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
     {
      date: Timestamp.fromDate(new Date()),
      period: 'Evening',
      cashier: 'Sara Khalid',
      postingNumber: 'PO-003',
      total: 1800,
      status: 'Posted',
      costOfSales: 1100,
      actuals: {
        'cash': 1400,
        'credit-0': 400
      },
      cash: {
        accountId: cashAccount,
        accountName: accountMap.get(cashAccount),
        amount: 1400,
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

// Function to convert data URL to a Buffer
const dataUrlToBuffer = (dataUrl: string): Buffer => {
  const base64 = dataUrl.split(',')[1];
  if (!base64) {
    throw new Error('Invalid data URL');
  }
  return Buffer.from(base64, 'base64');
};


// Add a new sales record
export const addSaleRecord = async (
  data: SalesRecordFormData
): Promise<string> => {
  const salesCol = collection(db, 'salesRecords');
  const allAccounts = await getAccounts();
  const accountMap = createAccountMap(allAccounts);

  const processedCards: CardAccountDetail[] = [];
  if (data.cards) {
    for (const card of data.cards) {
      if (!card.accountId || card.amount <= 0) continue;
      
      const processedCard: CardAccountDetail = {
        accountId: card.accountId,
        amount: card.amount,
        accountName: accountMap.get(card.accountId) || 'Unknown',
      };
      
      if (card.receiptImage) {
        try {
          const imageBuffer = dataUrlToBuffer(card.receiptImage);
          const storageRef = ref(storage, `receipts/${Date.now()}-${card.accountId}.jpg`);
          const snapshot = await uploadBytes(storageRef, imageBuffer, { contentType: 'image/jpeg' });
          processedCard.receiptImageUrl = await getDownloadURL(snapshot.ref);
        } catch (error) {
           console.error("Error uploading image for card:", card.accountId, error);
        }
      }
      processedCards.push(processedCard);
    }
  }
  
  let enrichedCash: AccountDetail = { accountId: '', amount: 0, accountName: ''};
  if (data.cash && data.cash.accountId && data.cash.amount > 0) {
      enrichedCash = {
        accountId: data.cash.accountId,
        amount: data.cash.amount,
        accountName: accountMap.get(data.cash.accountId) || 'Unknown',
      };
  }

  const validCredits = (data.credits || []).filter(c => c.accountId && c.amount > 0);
  const enrichedCredits = validCredits.map((credit) => ({
      accountId: credit.accountId,
      amount: credit.amount,
      accountName: accountMap.get(credit.accountId) || 'Unknown',
    }));

  const total =
    (enrichedCash.amount || 0) +
    (processedCards?.reduce((sum, item) => sum + item.amount, 0) || 0) +
    (enrichedCredits?.reduce((sum, item) => sum + item.amount, 0) || 0);

  const dataToSave = {
    date: Timestamp.fromDate(data.date),
    period: data.period,
    cashier: data.salesperson,
    postingNumber: data.postingNumber || null,
    total: total,
    status: 'Pending Matching',
    cash: enrichedCash,
    cards: processedCards,
    credits: enrichedCredits,
    createdAt: Timestamp.now(),
  };

  const newDocRef = await addDoc(salesCol, dataToSave);
  return newDocRef.id;
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
  status: 'Pending Matching' | 'Ready for Posting' | 'Posted'
): Promise<SalesRecord[]> => {
  const salesCol = collection(db, 'salesRecords');
  const q = query(
    salesCol,
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
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

// Update a sales record's status and actuals
export const updateSaleRecordStatus = async (
  recordId: string,
  status: 'Ready for Posting' | 'Rejected',
  actuals: { [key: string]: number },
  notes: string
): Promise<void> => {
  const recordRef = doc(db, 'salesRecords', recordId);
  await updateDoc(recordRef, {
    status,
    actuals,
    matchNotes: notes,
  });
};

// Update a sales record's status to 'Posted'
export const postSaleRecord = async (recordId: string, costOfSales: number): Promise<void> => {
    const recordRef = doc(db, 'salesRecords', recordId);
    await updateDoc(recordRef, {
        status: 'Posted',
        costOfSales: costOfSales,
    });
};
