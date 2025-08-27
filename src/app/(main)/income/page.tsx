
'use client';

import { TransactionForm } from '@/components/transaction-form';
import { Card, CardContent } from '@/components/ui/card';
import { Account } from '@/components/chart-of-accounts/account-tree';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertCircle } from 'lucide-react';
// Temporarily disable direct DB calls from this page
// import { getAccounts } from '@/lib/firebase/firestore/accounts';

const sampleAccounts: Account[] = [
    { id: '1', code: '401', name: 'Sales Revenue', type: 'Credit', group: 'Revenues', status: 'Active', closingType: 'Income Statement', classifications: ['Revenues'] },
    { id: '2', code: '402', name: 'Service Revenue', type: 'Credit', group: 'Revenues', status: 'Active', closingType: 'Income Statement', classifications: ['Revenues'] },
];

export default function IncomePage() {
    const [accounts, setAccounts] = useState<Account[]>(sampleAccounts);
    const [loading, setLoading] = useState(false); // Set to false for demo mode
    const [error, setError] = useState<string | null>("This page is in demo mode. Your entries will not be saved. Please set up the Firestore connection in your Firebase project.");

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
                            formTitle="Record New Income"
                            formButtonText="Add Income"
                            accounts={accounts}
                            transactionType="Income"
                        />
                     )}
                </CardContent>
            </Card>
        </div>
    );
}
