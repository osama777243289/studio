
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
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
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
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed'
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

// Update request status. Journal entries will be created in a separate step.
export const updateCashAdvanceRequestStatus = async (
  requestId: string,
  status: 'Approved' | 'Rejected',
  requestData?: CashAdvanceRequest // requestData is kept for potential future use, but not for journal creation here
): Promise<void> => {
    const requestRef = doc(db, 'cashAdvanceRequests', requestId);
    
    // Simply update the status of the request.
    // The journal entry creation is deferred to another process/UI.
    await updateDoc(requestRef, { status });
};

// Confirm disbursement and create journal entry
interface ConfirmDisbursementParams {
  request: CashAdvanceRequest;
  actualAmount: number;
  notes: string;
  disbursingAccountId: string; // ID of the cash/bank account
}
export const confirmCashAdvanceDisbursement = async ({
  request,
  actualAmount,
  notes,
  disbursingAccountId
}: ConfirmDisbursementParams): Promise<void> => {
    if (!request.employeeAccountId) {
        throw new Error('Employee liability account is not defined for this request.');
    }

    const batch = writeBatch(db);
    const transactionsCol = collection(db, 'transactions');
    
    const journalId = doc(collection(db, 'temp')).id;
    const description = `صرف سلفة للموظف: ${request.employeeName} - ${notes || request.reason}`;

    // Debit Employee's liability account
    const debitTransactionRef = doc(transactionsCol);
    batch.set(debitTransactionRef, {
        accountId: request.employeeAccountId,
        amount: actualAmount, // Positive amount for debit
        date: request.date,
        type: 'Journal',
        description,
        journalId,
        createdAt: Timestamp.now(),
    });

    // Credit Cash/Bank account
    const creditTransactionRef = doc(transactionsCol);
    batch.set(creditTransactionRef, {
        accountId: disbursingAccountId,
        amount: -actualAmount, // Negative amount for credit
        date: request.date,
        type: 'Journal',
        description,
        journalId,
        createdAt: Timestamp.now(),
    });

    // Update the request status to 'Completed'
    const requestRef = doc(db, 'cashAdvanceRequests', request.id);
    batch.update(requestRef, {
        status: 'Completed',
        journalId: journalId,
        // You could also store actualAmount and notes here if needed
    });

    await batch.commit();
};
