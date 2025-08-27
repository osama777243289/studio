
'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileDown, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { AccountTree, type Account } from '@/components/chart-of-accounts/account-tree';
import { AccountDialog, AccountFormData } from '@/components/chart-of-accounts/account-dialog';
import { DeleteAccountDialog } from '@/components/chart-of-accounts/delete-account-dialog';
// Temporarily disable direct DB calls
// import { addAccount, deleteAccount, getAccounts, updateAccount } from '@/lib/firebase/firestore/accounts';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// --- Start of Demo Data ---
const sampleAccounts: Account[] = [
    {
        id: '1', code: '1', name: 'الأصول', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: [],
        children: [
            {
                id: '101', code: '11', name: 'الأصول المتداولة', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: [],
                children: [
                    { id: '10101', code: '1101', name: 'النقدية', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: ['Cashbox', 'Bank'], children: [] },
                    { id: '10102', code: '1102', name: 'العملاء', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: ['Clients'], children: [] },
                ]
            },
            {
                id: '102', code: '12', name: 'الأصول الثابتة', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: ['Fixed Assets'], children: []
            }
        ]
    },
    {
        id: '2', code: '2', name: 'الخصوم', type: 'Credit', group: 'Liabilities', status: 'Active', closingType: 'Balance Sheet', classifications: [],
        children: [
            { id: '201', code: '21', name: 'الموردون', type: 'Credit', group: 'Liabilities', status: 'Active', closingType: 'Balance Sheet', classifications: ['Suppliers'], children: [] }
        ]
    },
    {
        id: '4', code: '4', name: 'الإيرادات', type: 'Credit', group: 'Revenues', status: 'Active', closingType: 'Income Statement', classifications: ['Revenues'],
        children: [
             { id: '401', code: '401', name: 'إيرادات المبيعات', type: 'Credit', group: 'Revenues', status: 'Active', closingType: 'Income Statement', classifications: ['Revenues'], children: [] }
        ]
    },
    {
        id: '5', code: '5', name: 'المصروفات', type: 'Debit', group: 'Expenses', status: 'Active', closingType: 'Income Statement', classifications: ['Expenses'],
        children: [
            { id: '501', code: '501', name: 'مصروفات الرواتب', type: 'Debit', group: 'Expenses', status: 'Active', closingType: 'Income Statement', classifications: ['Expenses', 'Employee'], children: [] }
        ]
    }
];
// --- End of Demo Data ---


export default function ChartOfAccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [parentAccount, setParentAccount] = useState<Account | null>(null);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'addSub'>('add');
    const { toast } = useToast();
    
    const refreshAccounts = async () => {
        setLoading(true);
        setError("Failed to connect to Firestore. The app is currently running in offline demo mode with sample data. Your entries will not be saved. Please check your Firebase project setup to enable database functionality.");
        // Simulate fetching data
        setTimeout(() => {
            setAccounts(sampleAccounts);
            setLoading(false);
            toast({
                title: "Demo Mode Active",
                description: "Displaying sample account data.",
                variant: "default",
            });
        }, 500);
    };

    useEffect(() => {
        refreshAccounts();
    }, []);

    const handleAddAccount = (parentId: string | null = null) => {
        toast({ title: "Demo Mode Active", description: "Cannot add accounts in demo mode.", variant: "destructive"});
    };

    const handleEditAccount = (account: Account) => {
        toast({ title: "Demo Mode Active", description: "Cannot edit accounts in demo mode.", variant: "destructive"});
    };

    const handleDeleteAccount = (account: Account) => {
        toast({ title: "Demo Mode Active", description: "Cannot delete accounts in demo mode.", variant: "destructive"});
    };

    const confirmSave = async (accountData: AccountFormData) => {
        toast({ title: "Demo Mode Active", description: "Cannot save accounts in demo mode.", variant: "destructive"});
        setIsAddEditDialogOpen(false);
    };

    const confirmDelete = async () => {
        toast({ title: "Demo Mode Active", description: "Cannot delete accounts in demo mode.", variant: "destructive"});
        setIsDeleteDialogOpen(false);
    };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
              <div>
                  <CardTitle className="font-headline">Chart of Accounts</CardTitle>
                  <CardDescription>Browse and manage your accounting tree.</CardDescription>
              </div>
              <div className='flex gap-2'>
                  <Button variant="outline" onClick={refreshAccounts} disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                      Refresh
                  </Button>
                  <Button onClick={() => handleAddAccount()}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Main Account
                  </Button>
              </div>
          </div>
        </CardHeader>
        <CardContent>
           {error && (
             <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Error - Demo Mode</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
           )}
          <div className="border rounded-md p-4 min-h-[400px] flex items-center justify-center">
            {loading ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Loading Demo Data...</p>
                </div>
            ) : accounts.length > 0 ? (
                <AccountTree 
                    accounts={accounts} 
                    onAddSubAccount={(parentId) => handleAddAccount(parentId)}
                    onEditAccount={handleEditAccount}
                    onDeleteAccount={handleDeleteAccount}
                />
            ) : (
                 <div className="text-center text-muted-foreground">
                    <p>No accounts found.</p>
                    <p>Click "Add Main Account" to get started.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
      <AccountDialog
        isOpen={isAddEditDialogOpen}
        onClose={() => {
            setIsAddEditDialogOpen(false);
            setSelectedAccount(null);
            setParentAccount(null);
        }}
        onSave={confirmSave}
        account={dialogMode === 'edit' ? selectedAccount : null}
        parentAccount={parentAccount}
        mode={dialogMode}
      />
      <DeleteAccountDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        accountName={selectedAccount?.name}
      />
    </>
  );
}
