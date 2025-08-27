
import { db } from '@/lib/firebase/client';
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  where
} from 'firebase/firestore';
import { z } from 'zod';
import { getAccounts } from './accounts';
import { Account } from '@/components/chart-of-accounts/account-tree';


const accountDetailSchema = z.object({
  accountId: z.string().min(1, "Account is required."),
  amount: z.coerce.number().min(0, "Amount must be positive."),
});

export const salesRecordSchema = z.object({
  date: z.date(),
  period: z.enum(['Morning', 'Evening']),
  salesperson: z.string().min(2, "Salesperson name is required."),
  cash: accountDetailSchema,
  cards: z.array(accountDetailSchema).optional(),
  credits: z.array(accountDetailSchema).optional(),
});

export type SalesRecordFormData = z.infer<typeof salesRecordSchema>;

export interface AccountDetail {
    accountId: string;
    accountName?: string;
    amount: number;
}

export interface SalesRecord {
    id: string;
    date: Timestamp;
    period: 'Morning' | 'Evening';
    cashier: string;
    total: number;
    status: 'Pending Upload' | 'Pending Matching' | 'Matched';
    cash: AccountDetail;
    cards: AccountDetail[];
    credits: AccountDetail[];
    createdAt: Timestamp;
}


// Add a new sales record
export const addSaleRecord = async (data: SalesRecordFormData): Promise<string> => {
  const salesRecordsCol = collection(db, 'salesRecords');
  
  const total = (data.cash?.amount || 0) + 
                (data.cards?.reduce((sum, card) => sum + card.amount, 0) || 0) +
                (data.credits?.reduce((sum, credit) => sum + credit.amount, 0) || 0);

  const dataToSave = {
    ...data,
    date: Timestamp.fromDate(data.date),
    cashier: data.salesperson,
    total,
    status: 'Pending Matching', // Automatically set to pending matching
    createdAt: Timestamp.now(),
  };

  delete (dataToSave as any).salesperson;

  const newDocRef = await addDoc(salesRecordsCol, dataToSave);
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
const enrichRecordsWithAccountNames = (records: Omit<SalesRecord, 'id'>[], accountMap: Map<string, string>): Omit<SalesRecord, 'id'>[] => {
    return records.map(record => ({
        ...record,
        cash: {
            ...record.cash,
            accountName: accountMap.get(record.cash.accountId) || 'Unknown Account'
        },
        cards: record.cards.map(card => ({
            ...card,
            accountName: accountMap.get(card.accountId) || 'Unknown Account'
        })),
        credits: record.credits.map(credit => ({
            ...credit,
            accountName: accountMap.get(credit.accountId) || 'Unknown Account'
        })),
    }));
};


// Get all sales records
export const getSalesRecords = async (count: number = 20): Promise<SalesRecord[]> => {
    const salesRecordsCol = collection(db, 'salesRecords');
    const q = query(salesRecordsCol, orderBy('date', 'desc'), limit(count));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
        return [];
    }

    const records = snapshot.docs.map(doc => {
        return {
            id: doc.id,
            ...doc.data()
        } as SalesRecord;
    });

    return records;
}

// Get sales records by status
export const getSalesRecordsByStatus = async (status: 'Pending Matching' | 'Matched'): Promise<SalesRecord[]> => {
    const salesRecordsCol = collection(db, 'salesRecords');
    const q = query(
        salesRecordsCol, 
        where("status", "==", status), 
        orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return [];
    }
    
    const allAccounts = await getAccounts();
    const accountMap = createAccountMap(allAccounts);

    const records = snapshot.docs.map(doc => doc.data() as Omit<SalesRecord, 'id'>);
    const enriched = enrichRecordsWithAccountNames(records, accountMap);

    return snapshot.docs.map((doc, index) => {
        return {
            id: doc.id,
            ...enriched[index]
        } as SalesRecord;
    });
};
