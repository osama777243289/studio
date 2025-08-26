'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileDown } from 'lucide-react';
import { AccountTree, type Account } from '@/components/chart-of-accounts/account-tree';
import { AccountDialog } from '@/components/chart-of-accounts/account-dialog';
import { DeleteAccountDialog } from '@/components/chart-of-accounts/delete-account-dialog';

const initialChartOfAccountsData: Account[] = [
    {
    id: '1',
    code: '1000',
    name: 'الأصول',
    children: [
      {
        id: '1-1',
        code: '1100',
        name: 'الأصول المتداولة',
        children: [
          { id: '1-1-1', code: '1110', name: 'النقدية وما في حكمها' },
          { id: '1-1-2', code: '1120', name: 'الذمم المدينة' },
        ],
      },
      {
        id: '1-2',
        code: '1200',
        name: 'الأصول غير المتداولة',
        children: [
            { id: '1-2-1', code: '1210', name: 'العقارات والمعدات' }
        ],
      },
    ],
  },
  {
    id: '2',
    code: '2000',
    name: 'الخصوم',
    children: [
      {
        id: '2-1',
        code: '2100',
        name: 'الخصوم المتداولة',
        children: [{ id: '2-1-1', code: '2110', name: 'الذمم الدائنة' }],
      },
    ],
  },
  {
    id: '3',
    code: '3000',
    name: 'حقوق الملكية',
    children: [
      { id: '3-1-1', code: '3100', name: 'رأس المال' },
      { id: '3-1-2', code: '3200', name: 'الأرباح المحتجزة' },
    ]
  },
  {
    id: '4',
    code: '4000',
    name: 'الإيرادات',
     children: [
      { id: '4-1-1', code: '4100', name: 'إيرادات المبيعات' },
    ]
  },
  {
    id: '5',
    code: '5000',
    name: 'المصروفات',
    children: [
      { id: '5-1-1', code: '5100', name: 'مصروفات التشغيل' },
      { id: '5-1-2', code: '5200', name: 'مصروفات عمومية وإدارية' },
    ]
  },
];


// Helper function to find and update an account in the tree
const findAndManipulateAccount = (
  accounts: Account[],
  accountId: string,
  action: 'add' | 'edit' | 'delete',
  payload?: Account
): Account[] => {
  return accounts
    .map((acc) => {
      if (acc.id === accountId) {
        switch (action) {
          case 'add':
            return {
              ...acc,
              children: [...(acc.children || []), payload!],
            };
          case 'edit':
            return { ...acc, ...payload };
          case 'delete':
            return null; // Will be filtered out
        }
      }
      if (acc.children) {
        return {
          ...acc,
          children: findAndManipulateAccount(acc.children, accountId, action, payload),
        };
      }
      return acc;
    })
    .filter((acc): acc is Account => acc !== null);
};


export default function ChartOfAccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>(initialChartOfAccountsData);
    const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'addSub'>('add');
    
    const handleAddAccount = (parentId: string | null = null) => {
        setDialogMode(parentId ? 'addSub' : 'add');
        const parentAccount = parentId ? findAccountById(accounts, parentId) : null;
        setSelectedAccount(parentAccount);
        setIsAddEditDialogOpen(true);
    };

    const handleEditAccount = (account: Account) => {
        setDialogMode('edit');
        setSelectedAccount(account);
        setIsAddEditDialogOpen(true);
    };

    const handleDeleteAccount = (account: Account) => {
        setSelectedAccount(account);
        setIsDeleteDialogOpen(true);
    };

    const findAccountById = (accounts: Account[], id: string): Account | null => {
        for (const account of accounts) {
            if (account.id === id) return account;
            if (account.children) {
                const found = findAccountById(account.children, id);
                if (found) return found;
            }
        }
        return null;
    }

    const confirmSave = (accountData: Omit<Account, 'id' | 'children'>) => {
        if (dialogMode === 'add') {
             const newAccount: Account = { ...accountData, id: Date.now().toString(), children: [] };
             setAccounts(prev => [...prev, newAccount]);
        } else if (dialogMode === 'edit' && selectedAccount) {
            setAccounts(prev => findAndManipulateAccount(prev, selectedAccount.id, 'edit', accountData as Account));
        } else if (dialogMode === 'addSub' && selectedAccount) {
            const newSubAccount: Account = { ...accountData, id: Date.now().toString(), children: [] };
            setAccounts(prev => findAndManipulateAccount(prev, selectedAccount.id, 'add', newSubAccount));
        }
        setIsAddEditDialogOpen(false);
        setSelectedAccount(null);
    };

    const confirmDelete = () => {
        if (selectedAccount) {
            // A bit of a trick: we need to find the parent to call the manipulator function
            // This is a simplified approach. A real app might need a more robust way to find the parent.
            const deleteRecursively = (accounts: Account[], accountId: string): Account[] => {
                return accounts.filter(acc => acc.id !== accountId).map(acc => {
                    if (acc.children) {
                        acc.children = deleteRecursively(acc.children, accountId);
                    }
                    return acc;
                });
            }
            setAccounts(prev => deleteRecursively(prev, selectedAccount.id));
        }
        setIsDeleteDialogOpen(false);
        setSelectedAccount(null);
    };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
              <div>
                  <CardTitle className="font-headline">دليل الحسابات</CardTitle>
                  <CardDescription>تصفح وقم بإدارة شجرة الحسابات المحاسبية الخاصة بك.</CardDescription>
              </div>
              <div className='flex gap-2'>
                  <Button variant="outline">
                      <FileDown className="ml-2 h-4 w-4" />
                      تصدير
                  </Button>
                  <Button onClick={() => handleAddAccount()}>
                      <PlusCircle className="ml-2 h-4 w-4" />
                      إضافة حساب رئيسي
                  </Button>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md p-4">
              <AccountTree 
                accounts={accounts} 
                onAddSubAccount={handleAddAccount}
                onEditAccount={handleEditAccount}
                onDeleteAccount={handleDeleteAccount}
              />
          </div>
        </CardContent>
      </Card>
      <AccountDialog
        isOpen={isAddEditDialogOpen}
        onClose={() => setIsAddEditDialogOpen(false)}
        onSave={confirmSave}
        account={dialogMode === 'edit' ? selectedAccount : null}
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