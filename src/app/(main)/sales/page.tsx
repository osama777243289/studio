
'use client';

import { SalesForm } from '@/components/sales/sales-form';
import { SalesRecords } from '@/components/sales/sales-records';
import { Account } from '@/components/chart-of-accounts/account-tree';
import { useEffect, useState } from 'react';
import { getAccounts } from '@/lib/firebase/firestore/accounts';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function SalesPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAccounts = async () => {
            setLoading(true);
            try {
                const fetchedAccounts = await getAccounts();
                setAccounts(fetchedAccounts);
            } catch (error) {
                console.error("Failed to fetch accounts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAccounts();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col gap-8 justify-center items-center pt-8">
                <Card className="w-full max-w-2xl">
                    <div className="space-y-8 p-6">
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
                </Card>
                 <Card className="w-full max-w-4xl h-96">
                     <div className="p-6">
                        <Skeleton className="h-8 w-1/3 mb-4" />
                        <Skeleton className="h-12 w-full mb-2" />
                        <Skeleton className="h-12 w-full mb-2" />
                        <Skeleton className="h-12 w-full" />
                     </div>
                 </Card>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col gap-8 justify-center items-center pt-8">
            <Card className="w-full max-w-2xl">
                <SalesForm accounts={accounts} />
            </Card>
            <div className="w-full max-w-4xl">
                <SalesRecords />
            </div>
        </div>
    );
}
