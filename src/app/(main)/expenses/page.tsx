'use client';

import { TransactionForm } from '@/components/transaction-form';
import { Card, CardContent } from '@/components/ui/card';
import { getAccounts } from '@/lib/firebase/firestore/accounts';
import { Account } from '@/components/chart-of-accounts/account-tree';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Helper to flatten the account tree and filter by classification and group
const getTransactionalAccounts = (accounts: Account[], group: string): Account[] => {
    const flattened: Account[] = [];
    const traverse = (accs: Account[]) => {
        for (const acc of accs) {
            // A transactional account is one that does not have children.
            if (!acc.children || acc.children.length === 0) {
                 if (acc.group === group) {
                    flattened.push(acc);
                }
            }
            if (acc.children) {
                traverse(acc.children);
            }
        }
    };
    traverse(accounts);
    return flattened;
};

export default function ExpensesPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAccounts = async () => {
            setLoading(true);
            const fetchedAccounts = await getAccounts();
            setAccounts(fetchedAccounts);
            setLoading(false);
        };
        fetchAccounts();
    }, []);

    const expenseAccounts = useMemo(() => getTransactionalAccounts(accounts, 'Expenses'), [accounts]);

    return (
        <div className="flex justify-center items-start pt-8">
            <Card className="w-full max-w-lg">
                <CardContent className="pt-6">
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
                            accounts={expenseAccounts}
                            transactionType="Expense"
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
