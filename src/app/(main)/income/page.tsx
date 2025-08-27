
'use client';

import { TransactionForm } from '@/components/transaction-form';
import { Card, CardContent } from '@/components/ui/card';
import { getAccounts } from '@/lib/firebase/firestore/accounts';
import { Account } from '@/components/chart-of-accounts/account-tree';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

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


export default function IncomePage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAccounts = async () => {
            setLoading(true);
            setError(null);
            try {
                const fetchedAccounts = await getAccounts();
                if (fetchedAccounts.length === 0) {
                     throw new Error("Connection successful, but no accounts were found. Please ensure your 'accounts' collection in Firestore has data.");
                }
                setAccounts(fetchedAccounts);
            } catch (e: any) {
                console.error(e);
                setError("Failed to connect to Firestore. Please check your Firebase project settings and security rules. The database might not be created or is not allowing reads.");
            } finally {
                setLoading(false);
            }
        };
        fetchAccounts();
    }, []);

    const incomeAccounts = useMemo(() => getTransactionalAccounts(accounts, 'Revenues'), [accounts]);

    return (
        <div className="flex justify-center items-start pt-8">
            <Card className="w-full max-w-lg">
                <CardContent className="pt-6 space-y-4">
                     {loading ? (
                         <p>Connecting to Firestore...</p>
                     ) : error ? (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Connection Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                     ) : (
                        <>
                            <Alert variant="default" className="border-green-500">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <AlertTitle>Connection Successful</AlertTitle>
                                <AlertDescription>Successfully fetched {accounts.length} accounts from Firestore. You can now record new income.</AlertDescription>
                            </Alert>
                            <TransactionForm
                                formTitle="Record New Income"
                                formButtonText="Add Income"
                                accounts={incomeAccounts}
                                transactionType="Income"
                            />
                        </>
                     )}
                </CardContent>
            </Card>
        </div>
    );
}
