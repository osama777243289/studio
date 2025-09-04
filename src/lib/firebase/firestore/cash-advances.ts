
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
} from 'firebase/firestore';
import { z } from 'zod';
import type { User } from '@/app/(main)/users/page';

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

// Update request status
export const updateCashAdvanceRequestStatus = async (
  requestId: string,
  status: 'Approved' | 'Rejected'
): Promise<void> => {
    const requestRef = doc(db, 'cashAdvanceRequests', requestId);
    await updateDoc(requestRef, { status });
    // In a real app, if status is 'Approved', you would also create the journal entries here.
};
