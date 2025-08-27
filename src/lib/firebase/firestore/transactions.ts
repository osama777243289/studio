
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
import { useToast } from '@/hooks/use-toast';

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
  // In demo mode, we just simulate the action.
  console.log("Attempted to add transaction in demo mode:", transactionData);
  // We throw an error to be caught by the form handler, which will show a toast.
  throw new Error("Demo Mode: Cannot save transactions.");
};


// Get recent transactions for the dashboard
export const getRecentTransactions = async (count: number = 5): Promise<Transaction[]> => {
    // This function will now be handled by static data in the component itself.
    console.log("Attempted to fetch recent transactions in demo mode.");
    return [];
}
