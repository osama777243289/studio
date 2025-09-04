
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
  doc,
  updateDoc,
  writeBatch,
  where,
} from 'firebase/firestore';
import { z } from 'zod';
import type { User } from '@/app/(main)/users/page';
import { getAccounts, Account } from './accounts';

export const cashAdvanceRequestSchema = z.object({
  employeeId: z.string().min(1, 'يجب تحديد الموظف.'),
  amount: z.coerce.number().positive('يجب أن يكون مبلغ السلفة أكبر من صفر.'),
  date: z.date(),
  reason: z.string().min(5, 'يجب كتابة سبب طلب السلفة (5 أحرف على الأقل).'),
});

export type CashAdvanceRequestData = z.infer<typeof cashAdvanceRequestSchema>;

export interface CashAdvanceRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAccountId?: string;
  amount: number;
  date: Timestamp;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: Timestamp;
  journalId?: string;
}

// Add a new cash advance request
export const addCashAdvanceRequest = async (
  data: CashAdvanceRequestData,
  employee: User
): Promise<string> => {
  if (!employee.employeeAccountId) {
    throw new Error('This employee does not have a linked liability account.');
  }
  const requestsCol = collection(db, 'cashAdvanceRequests');

  const dataToSave = {
    ...data,
    employeeName: employee.name,
    employeeAccountId: employee.employeeAccountId,
    date: Timestamp.fromDate(data.date),
    status: 'Pending',
    createdAt: Timestamp.now(),
  };

  const newDocRef = await addDoc(requestsCol, dataToSave);
  return newDocRef.id;
};

// Get all cash advance requests
export const getCashAdvanceRequests = async (
  count: number = 20
): Promise<CashAdvanceRequest[]> => {
  const requestsCol = collection(db, 'cashAdvanceRequests');
  const q = query(requestsCol, orderBy('createdAt', 'desc'), limit(count));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as CashAdvanceRequest)
  );
};

// Get cash advance requests by status
export const getCashAdvanceRequestsByStatus = async (
  status: 'Pending' | 'Approved' | 'Rejected'
): Promise<CashAdvanceRequest[]> => {
    const requestsCol = collection(db, 'cashAdvanceRequests');
    const q = query(requestsCol, where('status', '==', status), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CashAdvanceRequest));
}


const findAccountByClassification = (accounts: Account[], classification: string): Account | null => {
    for (const acc of accounts) {
        if (acc.classifications?.includes(classification)) return acc;
        if (acc.children) {
            const found = findAccountByClassification(acc.children, classification);
            if (found) return found;
        }
    }
    return null;
}

// Update request status and create journal entries if approved
export const updateCashAdvanceRequestStatus = async (
  requestId: string,
  status: 'Approved' | 'Rejected',
  requestData?: CashAdvanceRequest
): Promise<void> => {
    const requestRef = doc(db, 'cashAdvanceRequests', requestId);

    if (status === 'Rejected') {
        await updateDoc(requestRef, { status });
        return;
    }

    if (status === 'Approved') {
        if (!requestData) throw new Error('Request data is required for approval.');
        if (!requestData.employeeAccountId) throw new Error('Employee account is not linked.');

        const allAccounts = await getAccounts();
        const cashAccount = findAccountByClassification(allAccounts, 'صندوق');
        if (!cashAccount) {
            throw new Error('Cash account not found. Please set up an account with "صندوق" classification.');
        }

        const batch = writeBatch(db);
        const journalId = doc(collection(db, 'temp')).id;
        const transactionsCol = collection(db, 'transactions');
        const description = `صرف سلفة للموظف: ${requestData.employeeName}`;
        
        // Debit: Employee's liability account (عهدة موظف)
        const debitEntry = {
            accountId: requestData.employeeAccountId,
            date: requestData.date,
            amount: requestData.amount, // Positive for debit
            type: 'Journal',
            description,
            journalId,
            createdAt: Timestamp.now(),
        };
        batch.set(doc(transactionsCol), debitEntry);
        
        // Credit: Cash/Bank account
        const creditEntry = {
            accountId: cashAccount.id,
            date: requestData.date,
            amount: -requestData.amount, // Negative for credit
            type: 'Journal',
            description,
            journalId,
            createdAt: Timestamp.now(),
        };
        batch.set(doc(transactionsCol), creditEntry);

        // Update the request status and store the journalId
        batch.update(requestRef, { 
            status: 'Approved',
            journalId: journalId,
         });

        await batch.commit();
    }
};
