
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
} from 'firebase/firestore';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { getAccounts } from './accounts';

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

const seedTransactions = async () => {
    const allAccounts = await getAccounts();
    const revenuesAccount = allAccounts.find(a => a.name === 'الإيرادات')?.children?.find(c => c.name === 'الخدمات');
    const expensesAccount = allAccounts.find(a => a.name === 'المصروفات')?.children?.find(c => c.name === 'الرواتب والأجور');

    if (!revenuesAccount || !expensesAccount) {
        console.error("Could not find default revenue/expense accounts for seeding transactions.");
        return;
    }

    const defaultTransactions = [
        { amount: 5000, accountId: revenuesAccount.id, date: new Date(), description: 'Sample Income 1', type: 'Income' },
        { amount: 300, accountId: expensesAccount.id, date: new Date(), description: 'Sample Expense 1', type: 'Expense' },
        { amount: 1200, accountId: revenuesAccount.id, date: new Date(), description: 'Sample Income 2', type: 'Income' },
        { amount: 50, accountId: expensesAccount.id, date: new Date(), description: 'Sample Expense 2', type: 'Expense' },
        { amount: 750, accountId: revenuesAccount.id, date: new Date(), description: 'Sample Income 3', type: 'Income' },
    ];

    const batch = writeBatch(db);
    const transactionsCol = collection(db, 'transactions');
    defaultTransactions.forEach(trans => {
        const newDocRef = doc(transactionsCol);
        batch.set(newDocRef, { ...trans, date: Timestamp.fromDate(trans.date), createdAt: Timestamp.now() });
    });
    await batch.commit();
    console.log("Default transactions have been seeded.");
}


// Add a new transaction
export const addTransaction = async (transactionData: Omit<TransactionFormData, 'createdAt'>): Promise<string> => {
  const transactionsCol = collection(db, 'transactions');
  const dataToSave = {
    ...transactionData,
    date: Timestamp.fromDate(transactionData.date),
    createdAt: Timestamp.now(),
  };
  const newDocRef = await addDoc(transactionsCol, dataToSave);
  return newDocRef.id;
};


// Get recent transactions for the dashboard
export const getRecentTransactions = async (count: number = 5): Promise<Transaction[]> => {
    const transactionsCol = collection(db, 'transactions');
    const q = query(transactionsCol, orderBy('createdAt', 'desc'), limit(count));
    const transactionSnapshot = await getDocs(q);
    
    if (transactionSnapshot.empty) {
        console.log("No transactions found, seeding database...");
        await seedTransactions();
        const seededSnapshot = await getDocs(q);
        if (seededSnapshot.empty) return [];
        return seededSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    }

    return transactionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
}
