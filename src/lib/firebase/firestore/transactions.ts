
import { db } from '@/lib/firebase/client';
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { z } from 'zod';

export const transactionSchema = z.object({
  amount: z.coerce.number().positive('يجب أن يكون المبلغ أكبر من صفر'),
  accountId: z.string().min(1, 'الحساب مطلوب'),
  date: z.date(),
  description: z.string().optional(),
  type: z.enum(['Income', 'Expense']),
  createdAt: z.instanceof(Timestamp).optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

export interface Transaction extends Omit<TransactionFormData, 'date' | 'createdAt'> {
    id: string;
    date: Timestamp;
    createdAt: Timestamp;
    accountName?: string;
}

// Add a new transaction
export const addTransaction = async (transactionData: Omit<TransactionFormData, 'createdAt'>): Promise<string> => {
  const transactionsCol = collection(db, 'transactions');
  const dataToSave = {
    ...transactionData,
    createdAt: Timestamp.now(),
  };
  const newDocRef = await addDoc(transactionsCol, dataToSave);
  return newDocRef.id;
};


// Get recent transactions for the dashboard
export const getRecentTransactions = async (count: number = 5): Promise<Transaction[]> => {
    const transactionsCol = collection(db, 'transactions');
    const q = query(transactionsCol, orderBy('date', 'desc'), limit(count));
    const transactionSnapshot = await getDocs(q);
    
    if (transactionSnapshot.empty) {
        return [];
    }

    const transactions = await Promise.all(transactionSnapshot.docs.map(async (docSnap) => {
        const data = docSnap.data() as Omit<Transaction, 'id' | 'accountName'>;
        return {
            id: docSnap.id,
            ...data,
        } as Transaction;
    }));

    return transactions;
}
