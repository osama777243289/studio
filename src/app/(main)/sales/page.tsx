
'use client';

import { SalesForm } from '@/components/sales/sales-form';
import { Account } from '@/components/chart-of-accounts/account-tree';
import { useEffect, useState } from 'react';
import { getAccounts } from '@/lib/firebase/firestore/accounts';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import type { User } from '@/app/(main)/users/page';
import { getUsers } from '@/lib/firebase/firestore/users';

function SalesPageContent({ accounts, allUsers, currentUser }: { accounts: Account[], allUsers: User[], currentUser: Omit<User, 'password'> }) {
    return (
        <div className="flex flex-col gap-8 justify-center items-center pt-8">
            <Card className="w-full max-w-2xl">
                <SalesForm accounts={accounts} allUsers={allUsers} currentUser={currentUser} />
            </Card>
            <div className="w-full max-w-4xl">
                <SalesRecords />
            </div>
        </div>
    );
}


export default function SalesPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const { user, loading: loadingUser } = useAuth();

    useEffect(() => {
        const fetchAllData = async () => {
            setLoadingData(true);
            try {
                const [fetchedAccounts, fetchedUsers] = await Promise.all([
                   getAccounts(),
                   getUsers()
                ]);
                setAccounts(fetchedAccounts);
                setAllUsers(fetchedUsers);
            } catch (error) {
                console.error("Failed to fetch data for sales page:", error);
            } finally {
                setLoadingData(false);
            }
        };
        fetchAllData();
    }, []);

    const isLoading = loadingData || loadingUser;

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
        return <p>الرجاء تسجيل الدخول لعرض هذه الصفحة.</p>
    }

    return <SalesPageContent accounts={accounts} allUsers={allUsers} currentUser={user} />;
}
