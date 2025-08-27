
'use client';

import { SalesForm } from '@/components/sales/sales-form';
import { SalesRecords } from '@/components/sales/sales-records';
import { Account } from '@/components/chart-of-accounts/account-tree';
import { useEffect, useState } from 'react';
import { getAccounts } from '@/lib/firebase/firestore/accounts';
import { Skeleton } from '@/components/ui/skeleton';
import { SalesRecord } from '@/lib/firebase/firestore/sales';

export default function SalesPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllAccounts = async () => {
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
        fetchAllAccounts();
    }, []);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="space-y-8">
        {loading ? (
             <div className="space-y-8 p-4 border rounded-lg">
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
             <SalesForm accounts={accounts}/>
        )}
      </div>
      <div className="space-y-8">
        <SalesRecords />
      </div>
    </div>
  );
}
