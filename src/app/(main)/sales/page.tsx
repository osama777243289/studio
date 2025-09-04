
'use client';

import { SalesForm } from '@/components/sales/sales-form';
import { Account } from '@/components/chart-of-accounts/account-tree';
import { useEffect, useState } from 'react';
import { getAccounts } from '@/lib/firebase/firestore/accounts';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { SalesRecords } from '@/components/sales/sales-records';
import { useAuth } from '@/contexts/auth-context';
import type { User } from '@/app/(main)/users/page';

function SalesPageContent({ accounts, user }: { accounts: Account[], user: Omit<User, 'password'> }) {
    return (
        <div className="flex flex-col gap-8 justify-center items-center pt-8">
            <Card className="w-full max-w-2xl">
                <SalesForm accounts={accounts} currentUser={user} />
            </Card>
            <div className="w-full max-w-4xl">
                <SalesRecords />
            </div>
        </div>
    );
}


export default function SalesPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loadingAccounts, setLoadingAccounts] = useState(true);
    const { user, loading: loadingUser } = useAuth();

    useEffect(() => {
        const fetchAllAccounts = async () => {
            setLoadingAccounts(true);
            try {
                const allAccounts = await getAccounts();
                setAccounts(allAccounts);
            } catch (error) {
                console.error("Failed to fetch accounts for sales page:", error);
            } finally {
                setLoadingAccounts(false);
            }
        };
        fetchAllAccounts();
    }, []);

    const isLoading = loadingAccounts || loadingUser;

    if (isLoading) {
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
    
    if (!user) {
        // This can happen if the user is not logged in but somehow reached this page.
        // You can redirect or show an error message.
        return <p>الرجاء تسجيل الدخول لعرض هذه الصفحة.</p>
    }

    return <SalesPageContent accounts={accounts} user={user} />;
}
