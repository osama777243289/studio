
import { db } from '@/lib/firebase/client';
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  writeBatch,
  doc,
  where,
} from 'firebase/firestore';
import { z } from 'zod';
import { getAccounts, Account } from './accounts';

export const transactionSchema = z.object({
  amount: z.coerce.number().positive('يجب أن يكون المبلغ أكبر من صفر'),
  accountId: z.string().min(1, 'الحساب مطلوب'),
  date: z.date(),
  description: z.string().optional(),
  type: z.enum(['Income', 'Expense', 'Journal']),
  journalId: z.string().optional(),
  createdAt: z.instanceof(Timestamp).optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

export interface Transaction extends Omit<TransactionFormData, 'date' | 'createdAt'> {
    id: string;
    date: Timestamp;
    createdAt: Timestamp;
}

export interface TransactionWithAccountName extends Transaction {
    accountName?: string;
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

// Add a new transaction
export const addTransaction = async (transactionData: Omit<TransactionFormData, 'createdAt'>): Promise<string> => {
  const transactionsCol = collection(db, 'transactions');
  const dataToSave = {
    ...transactionData,
    date: Timestamp.fromDate(transactionData.date),
    createdAt: Timestamp.now(),
    type: transactionData.type === 'Journal' ? 'Journal' : transactionData.amount > 0 ? 'Income' : 'Expense'
  };
  const newDocRef = await addDoc(transactionsCol, dataToSave);
  return newDocRef.id;
};


// Get recent transactions for the dashboard
export const getRecentTransactions = async (count: number = 5): Promise<Transaction[]> => {
    const transactionsCol = collection(db, 'transactions');
    const q = query(transactionsCol, orderBy('createdAt', 'desc'), limit(count));
    const transactionSnapshot = await getDocs(q);

    return transactionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
}

// Get all transactions
export const getAllTransactions = async (): Promise<TransactionWithAccountName[]> => {
    const transactionsCol = collection(db, 'transactions');
    const q = query(transactionsCol, orderBy('createdAt', 'desc'));
    const transactionSnapshot = await getDocs(q);
    
    if (transactionSnapshot.empty) {
        console.log("No transactions found. Returning empty array.");
        return [];
    }

    const allAccounts = await getAccounts();
    const accountMap = createAccountMap(allAccounts);

    const transactions = transactionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));

    return transactions.map(tx => ({
        ...tx,
        accountName: accountMap.get(tx.accountId) || 'حساب غير معروف'
    }));
}
