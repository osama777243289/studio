
'use client';

import { TransactionForm } from '@/components/transaction-form';
import { Card, CardContent } from '@/components/ui/card';
import { Account } from '@/components/chart-of-accounts/account-tree';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const demoAccounts: Account[] = [
    { id: '1', code: '401', name: 'إيرادات المبيعات', type: 'Credit', group: 'Revenues', status: 'Active', classifications: ['Revenues'], closingType: 'Income Statement' },
    { id: '2', code: '402', name: 'إيرادات الخدمات', type: 'Credit', group: 'Revenues', status: 'Active', classifications: ['Revenues'], closingType: 'Income Statement' },
];

export default function IncomePage() {
    const [accounts, setAccounts] = useState<Account[]>(demoAccounts);
    const [loading, setLoading] = useState(false); // No loading in demo mode
    const [isDemo, setIsDemo] = useState(true);

    return (
        <div className="flex justify-center items-start pt-8">
            <Card className="w-full max-w-lg">
                <CardContent className="pt-6">
                    {isDemo && (
                         <Alert className="mb-6">
                            <Info className="h-4 w-4" />
                            <AlertTitle>وضع العرض التوضيحي</AlertTitle>
                            <AlertDescription>
                                أنت تعمل الآن في وضع عدم الاتصال. لن يتم حفظ أي إدخالات.
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
