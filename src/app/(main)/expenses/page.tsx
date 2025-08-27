
'use client';

import { TransactionForm } from '@/components/transaction-form';
import { Card, CardContent } from '@/components/ui/card';
import { Account } from '@/components/chart-of-accounts/account-tree';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertCircle } from 'lucide-react';
import { getAccounts } from '@/lib/firebase/firestore/accounts';

export default function ExpensesPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchExpenseAccounts = async () => {
            setLoading(true);
            setError(null);
            try {
                const allAccounts = await getAccounts();
                // Flatten the account tree and filter for expense accounts
                const expenseAccounts: Account[] = [];
                const traverse = (accs: Account[]) => {
                    for (const acc of accs) {
                        if (acc.group === 'Expenses' && (!acc.children || acc.children.length === 0)) {
                            expenseAccounts.push(acc);
                        }
                        if (acc.children) {
                            traverse(acc.children);
                        }
                    }
                };
                traverse(allAccounts);
                setAccounts(expenseAccounts);
            } catch (e: any) {
                console.error("Failed to fetch accounts:", e);
                setError("Failed to load accounts from Firestore. Please ensure the connection is set up and you have permissions to read the 'accounts' collection.");
            } finally {
                setLoading(false);
            }
        };

        fetchExpenseAccounts();
    }, []);

    return (
        <div className="flex justify-center items-start pt-8">
            <Card className="w-full max-w-lg">
                <CardContent className="pt-6">
                     {error && (
                         <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Connection Error</AlertTitle>
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
