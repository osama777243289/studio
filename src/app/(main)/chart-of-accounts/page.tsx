
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
import { PlusCircle, FileDown, Loader2, RefreshCw } from 'lucide-react';
import { AccountTree, type Account } from '@/components/chart-of-accounts/account-tree';
import { AccountDialog, AccountFormData } from '@/components/chart-of-accounts/account-dialog';
import { DeleteAccountDialog } from '@/components/chart-of-accounts/delete-account-dialog';

const initialAccountsData: Account[] = [
  {
    id: "1",
    code: "1",
    name: "الأصول",
    type: "Debit",
    group: "Assets",
    status: "Active",
    closingType: "Balance Sheet",
    classifications: [],
    children: [
      {
        id: "11",
        code: "11",
        name: "الأصول المتداولة",
        type: "Debit",
        group: "Assets",
        status: "Active",
        closingType: "Balance Sheet",
        classifications: [],
        children: [
           {
            id: "111",
            code: "111",
            name: "الصندوق",
            type: "Debit",
            group: "Assets",
            status: "Active",
            closingType: "Balance Sheet",
            classifications: ['Cashbox'],
            children: []
          },
          {
            id: "112",
            code: "112",
            name: "البنوك",
            type: "Debit",
            group: "Assets",
            status: "Active",
            closingType: "Balance Sheet",
            classifications: ['Bank'],
            children: []
          }
        ]
      }
    ]
  },
   {
    id: "2",
    code: "2",
    name: "الخصوم",
    type: "Credit",
    group: "Liabilities",
    status: "Active",
    closingType: "Balance Sheet",
    classifications: [],
    children: []
  },
  {
    id: "3",
    code: "3",
    name: "حقوق الملكية",
    type: "Credit",
    group: "Equity",
    status: "Active",
    closingType: "Balance Sheet",
    classifications: [],
    children: []
  },
  {
    id: "4",
    code: "4",
    name: "الإيرادات",
    type: "Credit",
    group: "Revenues",
    status: "Active",
    closingType: "Income Statement",
    classifications: ['Revenues'],
    children: []
  },
  {
    id: "5",
    code: "5",
    name: "المصروفات",
    type: "Debit",
    group: "Expenses",
    status: "Active",
    closingType: "Income Statement",
    classifications: ['Expenses'],
    children: []
  }
];


// Helper function to find an account in the tree
const findAccountById = (searchAccounts: Account[], id: string): Account | null => {
    for (const account of searchAccounts) {
        if (account.id === id) return account;
        if (account.children) {
            const found = findAccountById(account.children, id);
            if (found) return found;
        }
    }
    return null;
}

// Helper function to find the parent of an account
const findParentOf = (searchAccounts: Account[], accountId: string, parent: Account | null = null): Account | null => {
    for(const account of searchAccounts){
        if(account.id === accountId) return parent;
        if(account.children){
            const found = findParentOf(account.children, accountId, account);
            if(found) return found;
        }
    }
    return null;
}


export default function ChartOfAccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>(initialAccountsData);
    const [loading, setLoading] = useState(false);
    const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [parentAccount, setParentAccount] = useState<Account | null>(null);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'addSub'>('add');
    
    const refreshAccounts = async () => {
        // In demo mode, we just reset to the initial static data.
        setLoading(true);
        setTimeout(() => {
            setAccounts(initialAccountsData);
            setLoading(false);
            alert("This is a demo. Data is not fetched from a server.");
        }, 500);
    };

    const handleAddAccount = (parentId: string | null = null) => {
        const pAccount = parentId ? findAccountById(accounts, parentId) : null;
        const level = pAccount ? (pAccount.code.length === 1 ? 2 : (pAccount.code.length === 2 ? 3 : 4)) : 1;
        if (level > 4) {
            alert("Cannot add a sub-account deeper than the fourth level.");
            return;
        }
        setDialogMode(parentId ? 'addSub' : 'add');
        setParentAccount(pAccount)
        setSelectedAccount(null);
        setIsAddEditDialogOpen(true);
    };

    const handleEditAccount = (account: Account) => {
        setDialogMode('edit');
        setSelectedAccount(account);
        const pAccount = findParentOf(accounts, account.id);
        setParentAccount(pAccount);
        setIsAddEditDialogOpen(true);
    };

    const handleDeleteAccount = (account: Account) => {
        if (account.children && account.children.length > 0) {
            alert("Cannot delete an account that has sub-accounts. Please delete the sub-accounts first.");
            return;
        }
        setSelectedAccount(account);
        setIsDeleteDialogOpen(true);
    };

    const confirmSave = async (accountData: AccountFormData) => {
        alert("This is a demo. Your changes will not be saved.");
        setIsAddEditDialogOpen(false);
        setSelectedAccount(null);
        setParentAccount(null);
    };

    const confirmDelete = async () => {
        if (!selectedAccount) return;
        alert("This is a demo. Your changes will not be saved.");
        setIsDeleteDialogOpen(false);
        setSelectedAccount(null);
    };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
              <div>
                  <CardTitle className="font-headline">Chart of Accounts</CardTitle>
                  <CardDescription>Browse and manage your accounting tree. (Demo Mode)</CardDescription>
              </div>
              <div className='flex gap-2'>
                  <Button variant="outline" onClick={refreshAccounts} disabled={loading}>
                      <RefreshCw className="mr-2 h-4 w-4" />
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
          <div className="border rounded-md p-4 min-h-[400px] flex items-center justify-center">
            {loading ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Loading accounts...</p>
                </div>
            ) : accounts.length > 0 ? (
                <AccountTree 
                    accounts={accounts} 
                    onAddSubAccount={handleAddAccount}
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
