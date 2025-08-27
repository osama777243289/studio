
'use client';

import { TransactionForm } from '@/components/transaction-form';
import { Card, CardContent } from '@/components/ui/card';
import { Account } from '@/components/chart-of-accounts/account-tree';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

const sampleAccounts: Account[] = [
  {
    id: '4',
    code: '4',
    name: 'الإيرادات',
    type: 'Credit',
    group: 'Revenues',
    status: 'Active',
    closingType: 'Income Statement',
    classifications: [],
    children: [
       {
        id: '41',
        code: '41',
        name: 'إيرادات النشاط الرئيسي',
        type: 'Credit',
        group: 'Revenues',
        status: 'Active',
        closingType: 'Income Statement',
        classifications: [],
        children: [
           {
            id: '411',
            code: '411',
            name: 'مبيعات المنتجات',
            type: 'Credit',
            group: 'Revenues',
            status: 'Active',
            closingType: 'Income Statement',
            classifications: [],
            children: [
                 { id: '41101', code: '41101', name: 'مبيعات التجزئة', type: 'Credit', group: 'Revenues', status: 'Active', closingType: 'Income Statement', classifications: ['Revenues'] },
                 { id: '41102', code: '41102', name: 'مبيعات الجملة', type: 'Credit', group: 'Revenues', status: 'Active', closingType: 'Income Statement', classifications: ['Revenues'] },
            ]
           }
        ]
      },
    ],
  },
];


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
    const incomeAccounts = useMemo(() => getTransactionalAccounts(sampleAccounts, 'Revenues'), []);

    return (
        <div className="flex justify-center items-start pt-8">
            <Card className="w-full max-w-lg">
                <CardContent className="pt-6 space-y-4">
                     <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Connection Error - Demo Mode</AlertTitle>
                        <AlertDescription>
                            Failed to connect to Firestore. The app is currently running in offline demo mode with sample data. Your entries will not be saved. Please check your Firebase project setup to enable database functionality.
                        </AlertDescription>
                    </Alert>
                    <TransactionForm
                        formTitle="Record New Income"
                        formButtonText="Add Income"
                        accounts={incomeAccounts}
                        transactionType="Income"
                    />
                </CardContent>
            </Card>
        </div>
    );
}

