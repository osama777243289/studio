
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
  console.log("Attempted to add sales record in demo mode:", data);
  throw new Error("Demo Mode: Cannot save sales records.");
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
    console.log("Attempted to fetch sales records in demo mode.");
    return [];
}

// Get sales records by status
export const getSalesRecordsByStatus = async (status: 'Pending Matching' | 'Matched'): Promise<SalesRecord[]> => {
    console.log("Attempted to fetch sales records by status in demo mode.");
    return [];
};
