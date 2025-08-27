
'use client';

import { TransactionForm } from '@/components/transaction-form';
import { Card, CardContent } from '@/components/ui/card';
import { Account } from '@/components/chart-of-accounts/account-tree';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertCircle } from 'lucide-react';
import { getAccounts } from '@/lib/firebase/firestore/accounts';

export default function IncomePage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchIncomeAccounts = async () => {
            setLoading(true);
            setError(null);
            try {
                const allAccounts = await getAccounts();
                // Flatten the account tree to find all accounts classified as 'Revenues'
                const incomeAccounts: Account[] = [];
                const traverse = (accs: Account[]) => {
                    for (const acc of accs) {
                        // A transactional account is one that does not have children.
                        if ((!acc.children || acc.children.length === 0) && acc.classifications.includes('Revenues')) {
                            incomeAccounts.push(acc);
                        }
                        if (acc.children) {
                            traverse(acc.children);
                        }
                    }
                };
                traverse(allAccounts);
                setAccounts(incomeAccounts);

                 if (incomeAccounts.length === 0) {
                   setError("No income accounts found. Please create accounts with the 'Revenues' classification in the Chart of Accounts.");
                }

            } catch (e) {
                console.error("Failed to fetch accounts:", e);
                setError("Failed to connect to the database. Please ensure your Firebase setup is correct and you have an internet connection.");
            } finally {
                setLoading(false);
            }
        };

        fetchIncomeAccounts();
    }, []);

    return (
        <div className="flex justify-center items-start pt-8">
            <Card className="w-full max-w-lg">
                <CardContent className="pt-6">
                    {error && !loading && (
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
                    ) : !error ? (
                        <TransactionForm
                            formTitle="Record New Income"
                            formButtonText="Add Income"
                            accounts={accounts}
                            transactionType="Income"
                        />
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            Please resolve the error above to continue.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
