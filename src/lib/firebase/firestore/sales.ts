

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
import { addTransaction } from './transactions';

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
  salesperson: z.string().min(1, 'مندوب المبيعات مطلوب.'),
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
  journalId?: string;
  cogsJournalId?: string;
}

const createAccountMap = (accounts: Account[]): Map<string, Account> => {
  const accountMap = new Map<string, Account>();
  const traverse = (accs: Account[]) => {
    for (const acc of accs) {
      accountMap.set(acc.id, acc);
      if (acc.children) {
        traverse(acc.children);
      }
    }
  };
  traverse(accounts);
  return accountMap;
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
  
  const flatAccounts: Account[] = [];
  const flatten = (accs: Account[]) => {
      for (const acc of accs) {
          flatAccounts.push(acc);
          if (acc.children) flatten(acc.children);
      }
  }
  flatten(allAccounts);

  const accountMap = new Map(flatAccounts.map(a => [a.id, a.name]));

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

  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as SalesRecord)
  );
};

// Get sales records by status
export const getSalesRecordsByStatus = async (
  status: 'Pending Upload' | 'Pending Matching' | 'Ready for Posting' | 'Posted'
): Promise<SalesRecord[]> => {
  const salesCol = collection(db, 'salesRecords');
  const q = query(salesCol, where('status', '==', status));
  const snapshot = await getDocs(q);
  const records = snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as SalesRecord)
  );
  
  // Sort manually to avoid composite index requirement
  records.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

  return records;
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
  status: 'Ready for Posting',
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


const findAccountByCode = (accounts: Account[], code: string): Account | null => {
    const flatAccounts: Account[] = [];
    const flatten = (accs: Account[]) => {
      for (const acc of accs) {
          flatAccounts.push(acc);
          if (acc.children) flatten(acc.children);
      }
    }
    flatten(accounts);
    return flatAccounts.find(acc => acc.code === code) || null;
}

export const postSaleRecord = async (recordId: string, costOfSales: number): Promise<void> => {
    const recordRef = doc(db, 'salesRecords', recordId);
    const recordSnap = await getDoc(recordRef);

    if (!recordSnap.exists()) {
        throw new Error("Sales record not found.");
    }
    const record = recordSnap.data() as SalesRecord;
    
    const allAccounts = await getAccounts();
    const salesRevenueAccount = findAccountByCode(allAccounts, '4101001'); 
    const vatAccount = findAccountByCode(allAccounts, '2101001');           
    const cogsAccount = findAccountByCode(allAccounts, '5101001');      
    const inventoryAccount = findAccountByCode(allAccounts, '1104001');    
    const mainCashAccount = findAccountByCode(allAccounts, '1101001');

    if (!salesRevenueAccount || !vatAccount || !cogsAccount || !inventoryAccount || !mainCashAccount) {
        throw new Error("System accounts for posting not found. Please ensure accounts 4101001, 2101001, 5101001, 1104001 and 1101001 exist.");
    }

    const journalId = doc(collection(db, 'temp')).id; 
    let cogsJournalId: string | null = null;
    const description = `ترحيل مبيعات فترة ${record.period === 'Morning' ? 'الصباحية' : 'المسائية'} ليوم ${record.date.toDate().toLocaleDateString('ar-SA')} ${record.postingNumber ? '- ' + record.postingNumber : ''}`;
    const totalActualSales = Object.values(record.actuals || {}).reduce((sum, val) => sum + val, 0);

    const salesRevenue = totalActualSales / 1.15;
    const vatAmount = totalActualSales - salesRevenue;

    const batch = writeBatch(db);
    const transactionsCol = collection(db, 'transactions');
    
    const actuals = record.actuals || {};
    
    // Debit all payment methods against revenue/VAT
    const actualCashAmount = actuals['cash'];
    if (actualCashAmount > 0) {
        // Debit cashier account (to be credited immediately)
        batch.set(doc(transactionsCol), {
            accountId: record.cash.accountId,
            date: record.date,
            amount: actualCashAmount, // Debit
            type: 'Journal',
            description,
            journalId,
            createdAt: Timestamp.now(),
        });

        // Add entry to move cash from cashier to main fund
        // Debit Main Fund
         batch.set(doc(transactionsCol), {
            accountId: mainCashAccount.id,
            date: record.date,
            amount: actualCashAmount, // Debit
            type: 'Journal',
            description: `إيداع نقدية من ${record.cash.accountName}`,
            journalId,
            createdAt: Timestamp.now(),
        });
        // Credit Cashier Account
         batch.set(doc(transactionsCol), {
            accountId: record.cash.accountId,
            date: record.date,
            amount: -actualCashAmount, // Credit
            type: 'Journal',
            description: `إيداع نقدية إلى ${mainCashAccount.name}`,
            journalId,
            createdAt: Timestamp.now(),
        });
    }

    record.cards.forEach((card, i) => {
        const actualAmount = actuals[`card-${i}`];
        if (actualAmount > 0) {
            batch.set(doc(transactionsCol), {
                accountId: card.accountId,
                date: record.date,
                amount: actualAmount, // Debit
                type: 'Journal',
                description,
                journalId,
                createdAt: Timestamp.now(),
            });
        }
    });

    record.credits.forEach((credit, i) => {
        const actualAmount = actuals[`credit-${i}`];
        if (actualAmount > 0) {
            batch.set(doc(transactionsCol), {
                accountId: credit.accountId,
                date: record.date,
                amount: actualAmount, // Debit
                type: 'Journal',
                description,
                journalId,
                createdAt: Timestamp.now(),
            });
        }
    });

    // Credit Sales Revenue
    batch.set(doc(transactionsCol), {
        accountId: salesRevenueAccount.id,
        date: record.date,
        amount: -salesRevenue, // Credit
        type: 'Journal',
        description,
        journalId,
        createdAt: Timestamp.now(),
    });
    
    // Credit VAT Payable
    batch.set(doc(transactionsCol), {
        accountId: vatAccount.id,
        date: record.date,
        amount: -vatAmount, // Credit
        type: 'Journal',
        description,
        journalId,
        createdAt: Timestamp.now(),
    });

    // Separate COGS entry
    if (costOfSales > 0) {
        cogsJournalId = doc(collection(db, 'temp')).id;
        const cogsDescription = `تكلفة مبيعات فترة ${record.period === 'Morning' ? 'الصباحية' : 'المسائية'} ليوم ${record.date.toDate().toLocaleDateString('ar-SA')} ${record.postingNumber ? '- ' + record.postingNumber : ''}`;
        
        // Debit COGS
        batch.set(doc(transactionsCol), {
            accountId: cogsAccount.id,
            date: record.date,
            amount: costOfSales, // Debit
            type: 'Journal',
            description: cogsDescription,
            journalId: cogsJournalId,
            createdAt: Timestamp.now(),
        });
        
         // Credit Inventory
         batch.set(doc(transactionsCol), {
            accountId: inventoryAccount.id,
            date: record.date,
            amount: -costOfSales, // Credit
            type: 'Journal',
            description: cogsDescription,
            journalId: cogsJournalId,
            createdAt: Timestamp.now(),
        });
    }

    batch.update(recordRef, { 
        status: 'Posted', 
        costOfSales: costOfSales,
        journalId: journalId,
        cogsJournalId: cogsJournalId,
    });

    await batch.commit();
};

export const unpostSaleRecord = async (recordId: string): Promise<void> => {
    const recordRef = doc(db, 'salesRecords', recordId);
    const recordSnap = await getDoc(recordRef);

    if (!recordSnap.exists()) {
        throw new Error("Sales record not found.");
    }

    const record = recordSnap.data() as SalesRecord;

    if (record.status !== 'Posted') {
        throw new Error("Only posted records can be un-posted.");
    }
    
    const batch = writeBatch(db);
    const transactionsCol = collection(db, 'transactions');
    
    const journalIdsToDelete: string[] = [];
    if (record.journalId) journalIdsToDelete.push(record.journalId);
    if (record.cogsJournalId) journalIdsToDelete.push(record.cogsJournalId);

    if(journalIdsToDelete.length > 0) {
        const q = query(transactionsCol, where('journalId', 'in', journalIdsToDelete));
        const transactionsSnapshot = await getDocs(q);

        transactionsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
    }

    batch.update(recordRef, {
        status: 'Ready for Posting',
        journalId: null,
        cogsJournalId: null,
    });
    
    await batch.commit();
}

    

    
