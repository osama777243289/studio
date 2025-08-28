
'use client';

import { SalesForm } from '@/components/sales/sales-form';
import { Account } from '@/components/chart-of-accounts/account-tree';
import { useEffect, useState } from 'react';
import { getAccounts } from '@/lib/firebase/firestore/accounts';
import { Skeleton } from '@/components/ui/skeleton';
import { SalesRecord } from '@/lib/firebase/firestore/sales';
import { Card } from '@/components/ui/card';

export default function SalesPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllAccounts = async () => {
            setLoading(true);
            try {
                const allAccounts = await getAccounts();
                setAccounts(allAccounts);
            } catch (error) {
                console.error("Failed to fetch accounts for sales page:", error);
                // Handle error appropriately, maybe show a toast
            } finally {
                setLoading(false);
            }
        };
        fetchAllAccounts();
    }, []);


  return (
    <div className="flex justify-center items-start pt-8">
      <Card className="w-full max-w-2xl">
        {loading ? (
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
        ) : (
             <SalesForm accounts={accounts}/>
        )}
      </Card>
    </div>
  );
}
