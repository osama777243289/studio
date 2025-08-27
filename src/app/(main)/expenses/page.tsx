
'use client';

import { TransactionForm } from '@/components/transaction-form';
import { Card, CardContent } from '@/components/ui/card';
import { Account } from '@/components/chart-of-accounts/account-tree';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertCircle } from 'lucide-react';
// import { getAccounts } from '@/lib/firebase/firestore/accounts';

const sampleAccounts: Account[] = [
    { id: '1', code: '501', name: 'Salaries Expense', type: 'Debit', group: 'Expenses', status: 'Active', closingType: 'Income Statement', classifications: ['Expenses'] },
    { id: '2', code: '502', name: 'Rent Expense', type: 'Debit', group: 'Expenses', status: 'Active', closingType: 'Income Statement', classifications: ['Expenses'] },
];

export default function ExpensesPage() {
    const [accounts, setAccounts] = useState<Account[]>(sampleAccounts);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>("This page is in demo mode. Please set up the Firestore connection in 'Chart of Accounts'.");

    return (
        <div className="flex justify-center items-start pt-8">
            <Card className="w-full max-w-lg">
                <CardContent className="pt-6">
                     {error && (
                         <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Demo Mode</AlertTitle>
                            <AlertDescription>
                               {error}
                            </AlertDescription>
                        </Alert>
                    )}
                     {loading ? (
                        <div className="space-y-8">
                            <Skeleton className="h-8 w-1/2" />
                            <div className="space-y-4">
                                <Skeleton className="h-6 w-1/4" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                             <div className="space-y-4">
                                <Skeleton className="h-6 w-1/4" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                             <div className="space-y-4">
                                <Skeleton className="h-6 w-1/4" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                        <TransactionForm
                            formTitle="Record New Expense"
                            formButtonText="Add Expense"
                            accounts={accounts}
                            transactionType="Expense"
                        />
                     )}
                </CardContent>
            </Card>
        </div>
    );
}
